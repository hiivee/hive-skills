---
name: job-tracker
description: Pipeline de candidaturas — visualiza, atualiza status, follow-ups, stats. Uso - /job-tracker [status|update|followups|stats|add]
layer: hive
---

# Job Tracker — Application Pipeline Manager

Gerencia o pipeline de candidaturas salvo em `~/.claude/job-search/applications.json`.

## Uso

```
/job-tracker                    — dashboard completo
/job-tracker stats              — numeros e taxas de conversao
/job-tracker followups          — candidaturas que precisam de follow-up
/job-tracker update [id] [status] — atualiza status de uma candidatura
/job-tracker add                — adiciona candidatura manual (nao-LinkedIn)
```

## Part of Job Search OS

Suite: `/linkedin-apply` → `/job-tracker` → `/job-briefing` → `/job-cv-tailor` → `/job-interview-prep`

## Data Location

- **Profile:** `~/.claude/job-search/profile.json`
- **Applications:** `~/.claude/job-search/applications.json`

## Application Statuses

```
applied → response_received → phone_screen → technical_interview → final_interview → offer → accepted
                                                                                      → rejected
applied → no_response (after 14 days)
applied → rejected
```

## Steps

### 1. Load Data

```bash
cat ~/.claude/job-search/applications.json
cat ~/.claude/job-search/profile.json
```

### 2. Based on Subcommand

#### Default (no args) — Dashboard

Show a comprehensive dashboard:

```markdown
## Job Search Dashboard — [date]

### Pipeline
| Status | Count | % |
|--------|-------|---|
| Applied | X | |
| Response Received | X | |
| Phone Screen | X | |
| Technical Interview | X | |
| Final Interview | X | |
| Offer | X | |
| Rejected | X | |
| No Response (>14d) | X | |

### Recent Activity (last 7 days)
| Date | Company | Role | Action |
|------|---------|------|--------|

### Needs Attention
- [company] — applied 7+ days ago, no response → consider follow-up
- [company] — interview scheduled for [date] → run /job-interview-prep
- [company] — offer pending → negotiate?

### Weekly Stats
- Applications this week: X
- Response rate: X%
- Interview conversion: X%
```

#### `stats` — Conversion Funnel

Calculate and display:
- Total applications by platform (LinkedIn, manual, etc)
- Response rate (responses / total applied)
- Interview rate (interviews / responses)
- Offer rate (offers / interviews)
- Applications by week (trend)
- Top responding companies
- Best performing keywords/regions
- Average time from application to response
- Average time from response to interview

#### `followups` — Follow-up Queue

Find applications where:
- Status = "applied" AND applied_at > 7 days ago → suggest follow-up
- Status = "response_received" AND no update in 5 days → follow up
- Status = "phone_screen" or "technical_interview" AND interview was > 2 days ago → send thank you

For each, generate:
- A follow-up email/message draft
- LinkedIn message template
- Suggested action

#### `update [id] [status]` — Update Status

Update an application's status. Valid transitions:
- `applied` → `response_received`, `rejected`, `no_response`
- `response_received` → `phone_screen`, `rejected`
- `phone_screen` → `technical_interview`, `rejected`
- `technical_interview` → `final_interview`, `rejected`
- `final_interview` → `offer`, `rejected`
- `offer` → `accepted`, `rejected`

Also update timestamps (`response_date`, `interview_dates`).

Write back to `applications.json`.

#### `add` — Manual Application

Ask for:
- Company name
- Job title
- URL (optional)
- Platform (linkedin/indeed/company_site/referral/other)
- Notes

Create application object and append to tracker.

### 3. Save Changes

After any modification, write the updated JSON back to `~/.claude/job-search/applications.json`.

### 4. Suggest Next Actions

Based on current pipeline state, suggest:
- If few applications → "Run /linkedin-apply [keywords] [region]"
- If applications but no responses → "Try /job-cv-tailor to improve CV match"
- If interviews coming → "Run /job-interview-prep [company]"
- If offers → "Congrats! Compare offers and negotiate"
- If high rejection rate → "Review target roles and CV positioning"