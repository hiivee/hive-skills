---
name: job-interview-prep
description: Preparacao completa para entrevista — research da empresa, perguntas tecnicas, mock interview, thank-you email. Uso - /job-interview-prep [company] [role]
layer: hive
---

# Job Interview Prep

Preparacao completa para entrevista tecnica ou behavioral.

## Uso

```
/job-interview-prep Anthropic AI Engineer
/job-interview-prep Google Frontend Developer
/job-interview-prep [company] [role]
```

## Part of Job Search OS

Suite: `/linkedin-apply` → `/job-tracker` → `/job-briefing` → `/job-cv-tailor` → `/job-interview-prep`

## Steps

### 1. Load Context

```bash
cat ~/.claude/job-search/profile.json
cat ~/.claude/job-search/applications.json
```

Find the application for this company in the tracker (if exists).

### 2. Company Research

Use WebSearch and WebFetch to research:

- **What they do** — product, market, customers, revenue model
- **Tech stack** — what technologies they use (check job postings, engineering blog, GitHub)
- **Culture** — values, work style, remote policy
- **Recent news** — funding rounds, product launches, hires, challenges
- **Engineering blog** — technical challenges they've solved
- **Glassdoor/Blind** — interview process, common questions, difficulty
- **Key people** — CTO, engineering managers, potential interviewers

### 3. Interviewer Research (if name provided)

If the user provides interviewer name:
- LinkedIn profile summary
- GitHub contributions
- Blog posts / talks
- Shared interests or connections
- Conversation starters

### 4. Generate Prep Document

```markdown
## Interview Prep — [Company] [Role]
**Date:** [interview date if known]

### Company Overview
- **What:** [1-2 sentence description]
- **Founded:** [year] | **Size:** [employees] | **Stage:** [startup/growth/enterprise]
- **Tech Stack:** [main technologies]
- **Culture:** [key values]
- **Recent:** [latest news/developments]

### Why This Company (your answer)
[Tailored answer connecting your experience to their mission]

### Why You (their perspective)
[What makes you a strong candidate specifically for them]

### Technical Questions (likely)

#### System Design
1. [Question based on their product domain]
   - **Your approach:** [outline]

2. [Question based on role requirements]
   - **Your approach:** [outline]

#### Coding
1. [Common pattern for this company/role]
   - **Key concepts:** [data structures, algorithms]

2. [Domain-specific problem]
   - **Key concepts:** [relevant tech]

#### Domain Knowledge
1. [AI/ML specific if AI role]
2. [Frontend specific if frontend role]
3. [Backend specific if backend role]

### Behavioral Questions (STAR format)

#### "Tell me about yourself" (tailored)
[2-minute pitch connecting your story to this role]

#### "Why are you leaving your current role?"
[Positive framing — growth, new challenges, international experience]

#### "Tell me about a challenging project"
[STAR: Situation → Task → Action → Result]
**Use:** [specific project from profile that matches their needs]

#### "How do you handle disagreements?"
[Example with resolution]

#### "Where do you see yourself in 5 years?"
[Aligned with company's growth trajectory]

### Questions to ASK Them
1. [About their engineering challenges]
2. [About team structure and growth]
3. [About their AI/tech strategy]
4. [About remote work and collaboration]
5. [About what success looks like in 6 months]

### Red Flags to Watch
- [Potential concerns about the role]
- [Things to clarify during interview]
```

### 5. Mock Interview (Optional)

If user asks for mock interview:
- Act as interviewer
- Ask 5-7 questions (mix of technical + behavioral)
- After each answer, provide feedback:
  - What was strong
  - What could improve
  - Suggested better framing
- Score each answer 1-10
- Overall readiness assessment

### 6. Post-Interview Support

After the interview, offer:

#### Thank You Email Generator
```
Subject: Thank you — [Role] interview

Hi [Interviewer],

Thank you for taking the time to discuss the [Role] position at [Company] today.

I especially enjoyed our conversation about [specific topic discussed].

[Reference a specific point that shows you were listening and engaged]

I'm excited about the opportunity to [specific contribution you discussed].

Please don't hesitate to reach out if you need any additional information.

Best regards,
Juan Carlo Gonçalves
```

#### Answer Analysis
- Review what went well
- Identify questions where you could improve
- Note follow-up items mentioned
- Update tracker status

### 7. Save & Track

Save prep document to: `~/.claude/job-search/interview-prep/[company]-[role]-[date].md`
Update application status in tracker to appropriate interview stage.