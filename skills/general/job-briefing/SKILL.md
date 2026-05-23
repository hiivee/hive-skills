---
name: job-briefing
description: Morning briefing — scan novas vagas, prioriza oportunidades, planeja o dia de job search. Uso - /job-briefing [keywords]
layer: hive
---

# Job Morning Briefing

Scan diario de novas vagas, analise do pipeline, e plano de acao para o dia.

## Uso

```
/job-briefing                    — briefing completo com keywords do perfil
/job-briefing AI engineer remote — briefing focado em keywords especificas
```

## Part of Job Search OS

Suite: `/linkedin-apply` → `/job-tracker` → `/job-briefing` → `/job-cv-tailor` → `/job-interview-prep`

## Steps

### 1. Load Context

```bash
cat ~/.claude/job-search/profile.json
cat ~/.claude/job-search/applications.json
```

### 2. Pipeline Status Check

From tracker, calculate:
- Applications pending response (>7 days = needs follow-up)
- Interviews scheduled (upcoming)
- Offers pending
- Today's follow-up queue

### 3. Scan New Jobs

Use the browse tool to scan LinkedIn for NEW jobs (last 24h filter):

```
URL: https://www.linkedin.com/jobs/search/?f_AL=true&f_TPR=r86400&geoId={geoId}&keywords={keywords}
```

The `f_TPR=r86400` filter = last 24 hours only.

For each of the target_roles in profile, scan and collect:
- Job title
- Company
- Location
- Posted time
- Easy Apply available?

### 4. Rank Opportunities

Score each new job 1-10 based on:
- **Role match** (title matches target_roles?) — 3 points
- **Skill match** (required skills overlap with profile?) — 3 points
- **Location match** (remote? target region?) — 2 points
- **Company quality** (known company? growth stage?) — 1 point
- **Easy Apply** (faster application) — 1 point

### 5. Generate Briefing

Output a structured morning briefing:

```markdown
## Job Search Briefing — [date] [weekday]

### Pipeline Status
- Active applications: X
- Awaiting response: X (Y need follow-up)
- Interviews this week: X
- Offers: X

### New Jobs (last 24h)

#### Top Matches (score 7+)
| Score | Company | Role | Location | Type | Action |
|-------|---------|------|----------|------|--------|
| 9/10 | Company | AI Engineer | Remote | Easy Apply | /linkedin-apply or /job-cv-tailor |
| 8/10 | Company | FS Dev | London | Easy Apply | /linkedin-apply |

#### Good Matches (score 4-6)
| Score | Company | Role | Location | Action |
|-------|---------|------|----------|--------|

### Today's Action Plan

1. **Follow-ups** (X pending)
   - [Company] — applied [date], send follow-up message
   - [Company] — phone screen [date], send thank you

2. **Apply** (recommended keywords for today)
   - `/linkedin-apply [keyword1] [region]`
   - For top matches: `/job-cv-tailor [job-url]` first, then apply manually

3. **Interview Prep** (if any upcoming)
   - `/job-interview-prep [company]`

4. **Networking**
   - [Suggested connections to reach out to at target companies]

### Weekly Progress
- This week: X applied | Y responses | Z interviews
- Target: 30 apps/week | 5 responses | 2 interviews
- On track? [Yes/No + recommendation]
```

### 6. Save Briefing

Save the briefing to `~/.claude/job-search/briefings/[date].md` for reference.

```bash
mkdir -p ~/.claude/job-search/briefings
```

### 7. Remind

Suggest the day's rotation keyword based on the weekly schedule:

| Day | Suggested Search |
|-----|-----------------|
| Mon | AI developer europe |
| Tue | fullstack developer europe |
| Wed | react developer uk |
| Thu | AI engineer usa |
| Fri | node.js developer remote |
| Sat | python developer germany |
| Sun | software engineer AI remote |