---
name: job-cold-apply
description: Scrapa vagas de multiplas plataformas, gera cold emails personalizados, e envia via Gmail. 100% gratis e sem CAPTCHA. Uso - /job-cold-apply [keywords] [action]
layer: hive
---

# Job Cold Apply — Mass Application via Direct Email

Scrapa vagas de LinkedIn/Indeed/Glassdoor/ZipRecruiter, gera cold emails personalizados por vaga, e envia direto pro email de hiring da empresa via Gmail API do Juan Hub.

**Zero CAPTCHA. Zero limite de plataforma. Vai direto pro inbox do recruiter.**

## Uso

```
/job-cold-apply AI engineer                  — scrape + generate emails
/job-cold-apply fullstack developer send     — scrape + generate + SEND
/job-cold-apply send                         — send previously generated emails
/job-cold-apply status                       — ver quantos gerados/enviados
```

## Part of Job Search OS

Suite completa: `/linkedin-apply` (Easy Apply) → `/job-cold-apply` (direct email) → `/job-tracker` → `/job-briefing` → `/job-cv-tailor` → `/job-interview-prep`

## How It Works

```
1. Scrape jobs (JobSpy: LinkedIn + Indeed + Glassdoor + ZipRecruiter)
          ↓
2. Extract company domain → guess hiring email (careers@, hiring@, jobs@)
          ↓
3. Generate personalized cold email per job (AI-powered)
          ↓
4. Send via Gmail API (Juan Hub's google_gmail_send tool)
          ↓
5. Track in applications.json
```

## Files

- **Scraper:** `~/.claude/job-search/scrape-jobs.py`
- **Email generator:** `~/.claude/job-search/cold-apply.py`
- **Profile:** `~/.claude/job-search/profile.json`
- **Scraped jobs:** `~/.claude/job-search/scraped-jobs.json`
- **Generated emails:** `~/.claude/job-search/cold-emails/`
- **Send log:** `~/.claude/job-search/cold-emails-sent.json`

## Steps

### 1. Scrape Jobs

```bash
python3 ~/.claude/job-search/scrape-jobs.py "AI engineer" "Remote" 100
```

Args: `[search_term] [location] [results_wanted]`

This scrapes LinkedIn, Indeed, Glassdoor, ZipRecruiter simultaneously.
Output: `~/.claude/job-search/scraped-jobs.json`

### 2. Generate Cold Emails

```bash
python3 ~/.claude/job-search/cold-apply.py --dry-run --limit 50
```

This:
- Loads scraped jobs
- Guesses hiring emails from company domain (careers@, hiring@, jobs@, recruiting@)
- Generates personalized cold email per job
- Saves each email to `~/.claude/job-search/cold-emails/{company}-{title}.json`

### 3. Review Generated Emails (IMPORTANT)

Before sending, Claude should read a few generated emails and show them to the user:

```bash
ls ~/.claude/job-search/cold-emails/ | head -5
cat ~/.claude/job-search/cold-emails/[first-file].json
```

Ask user: "Here are sample emails. Want me to adjust the tone/content before sending?"

### 4. Send via Gmail

Use Juan Hub's Gmail integration to send emails. Two approaches:

**Approach A — Via Juan Hub Chat API (AI tool call):**
The Juan Hub chat AI has a `google_gmail_send` tool. Send a message to the chat asking it to send the email.

**Approach B — Direct Gmail API call:**
Juan Hub has Google OAuth2 configured in DB. Use the API:

```
POST http://localhost:3001/api/chat
{
  "message": "Send email to careers@company.com with subject 'Application: AI Engineer — Juan Carlo' and body '...'"
}
```

The AI will use the `google_gmail_send` tool internally.

**Approach C — Batch send script:**
Create a Node.js script that uses Juan Hub's Google library directly:

```javascript
// Uses src/lib/google.ts sendEmail function
import { sendEmail } from '@/lib/google';
await sendEmail(userId, { to, subject, body });
```

### 5. Track Sent

After each email sent, update:
- `~/.claude/job-search/cold-emails-sent.json` — mark as sent
- `~/.claude/job-search/applications.json` — add to pipeline with method "cold_email"

### 6. Email Template

The cold email follows this structure:

```
Subject: Application: {Job Title} — Juan Carlo Gonçalves

Hi {Company} Hiring Team,

[1 sentence: what role + reference to their job posting]

[3-4 bullet highlights matching the job description]

[Availability + links (LinkedIn, GitHub, Portfolio)]

[Call to action]

Signature
```

**Rules:**
- Max 150 words (recruiters scan, don't read)
- Match 3-5 skills from job description
- Include concrete numbers (6+ years, 60+ tools, R$740K revenue)
- Always include LinkedIn + GitHub + Portfolio URLs
- Professional but human tone
- NO attachments on first email (attachment = spam filter risk)
- Include CV link via portfolio website instead

### 7. Email Patterns for Companies

Common hiring email patterns by company domain:
- `careers@{domain}` (most common)
- `hiring@{domain}`
- `jobs@{domain}`
- `recruiting@{domain}`
- `talent@{domain}`
- `hr@{domain}`
- `apply@{domain}`
- `people@{domain}` (startups)

For Greenhouse/Lever companies, the application URL often reveals the company domain.

### 8. Rate Limiting

- **Gmail daily limit:** 500 emails/day (Google Workspace) or 100/day (free Gmail)
- **Recommended:** Max 50 cold emails/day to avoid spam flagging
- **Spacing:** 30-60 second delay between sends
- **Warm up:** Start with 10/day, increase by 10 each day
- **Track bounces:** If >5% bounce rate, stop and clean list

### 9. Follow-up Sequence

If no response after 5 days, send follow-up:

```
Subject: Re: Application: {Job Title} — Juan Carlo Gonçalves

Hi team,

Following up on my application for the {Job Title} role. 
Still very interested and available immediately.

Happy to jump on a quick call anytime.

Best,
Juan Carlo
```

Max 2 follow-ups per company (day 5 and day 12).

### 10. Daily Schedule

| Time | Action | Volume |
|------|--------|--------|
| Morning | `/job-cold-apply AI engineer` | Scrape + generate |
| Morning | Review emails, adjust | 5 min |
| Morning | `/job-cold-apply send` | Send 30-50 |
| Afternoon | `/linkedin-apply [keywords]` | 30 Easy Apply |
| Evening | `/job-tracker followups` | Follow-ups |

**Combined daily output: 60-80 applications (30 LinkedIn + 30-50 cold email)**
