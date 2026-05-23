---
name: linkedin-apply
description: Aplica automaticamente em vagas de Easy Apply no LinkedIn. Importa cookies do Chrome, navega na busca, preenche formularios e envia candidaturas. Salva no tracker. Uso - /linkedin-apply [keywords] [region]
layer: hive
---

# LinkedIn Easy Apply Automator

Aplica em vagas "Candidatura Simplificada" no LinkedIn e salva tudo no tracker (`~/.claude/job-search/applications.json`).

## Uso

```
/linkedin-apply AI developer europe
/linkedin-apply fullstack developer usa
/linkedin-apply react developer remote
```

## Part of Job Search OS

This skill is part of a suite:
- `/linkedin-apply` — mass Easy Apply (this skill)
- `/job-tracker` — view/manage pipeline, follow-ups, stats
- `/job-briefing` — morning scan of new jobs + daily plan
- `/job-cv-tailor` — customize CV per job description
- `/job-interview-prep` — company research + mock interview

**Shared data:** `~/.claude/job-search/profile.json` (candidate profile) + `applications.json` (tracker)

## Regions (geoId)

| Region | geoId |
|--------|-------|
| europe | 91000007 |
| usa | 103644278 |
| uk | 101165590 |
| germany | 101282230 |
| portugal | 100364837 |
| spain | 105646813 |
| france | 105015875 |
| netherlands | 102890719 |
| switzerland | 106693272 |
| remote | 92000000 |
| canada | 101174742 |
| australia | 101452733 |
| ireland | 104738515 |

## LinkedIn Daily Limits (learned 2026-04-06)

- ~30 Easy Apply per day per account
- 429 after ~25 rapid page loads → restart browser, wait 3 min
- "Limitamos o numero de envios diarios" = STOP, daily limit reached
- "Salvar esta candidatura?" modal → click "Descartar"

## Steps

### 1. Load Profile

```bash
cat ~/.claude/job-search/profile.json
```

Use this data to fill forms. The `experience` object maps tech→years. The `answers` patterns are in the profile.

### 2. Setup Browse + Import Cookies

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B cookie-import-browser chrome --domain .linkedin.com
$B cookie-import-browser chrome --domain www.linkedin.com
$B cookie-import-browser chrome --domain .www.linkedin.com
```

If `li_at` cookie missing (login fails), ask user to copy from Chrome DevTools.

### 3. Build URL + Navigate

Map region arg → geoId. URL: `https://www.linkedin.com/jobs/search/?f_AL=true&geoId={geoId}&keywords={keywords}`

Verify login via screenshot. If not logged in, ask for `li_at` cookie.

### 4. Application Loop

For each page (navigate via `&start=N`, increments of 25):

**For each job card:**

1. Click card → wait 2s
2. Read title from `.t-24.t-bold`
3. Click "Candidatura simplificada" (NOT filter button — exclude `.search-reusables__filter-list`)
4. If no button → skip
5. Process form steps (up to 10 iterations):
   - Check state: SUCCESS / DAILY_LIMIT / SUBMIT / REVIEW / NEXT / OTHER
   - Fill empty fields using profile data
   - Click appropriate button
6. Close success modal
7. **SAVE to tracker** (see section below)

### 5. Form Filling (JavaScript)

**ALWAYS wrap in `(function(){...})()`** — never bare `return`.

Use native value setter for React compatibility:
```javascript
var ns = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
```

**Field matching priority:**
1. Years of experience → match tech keyword in label → use `profile.experience[tech]` → default 3
2. Known answers → match keyword in label → salary, city, website, github, linkedin, cover letter
3. Required fallback → 'Yes'

**Radios:** Default Yes/Sim/Si/Ja/Oui. If no Yes option, pick first.
**Selects:** Yes > first non-empty option (skip "Select an option").

### 6. Save to Tracker

After EACH application (success or fail), append to `~/.claude/job-search/applications.json`:

```bash
# Read current tracker, append new application via node/jq, write back
```

Application object:
```json
{
  "id": "linkedin-{jobId}-{timestamp}",
  "platform": "linkedin",
  "method": "easy_apply",
  "company": "Company Name",
  "title": "Job Title",
  "location": "Location",
  "url": "https://linkedin.com/jobs/view/{jobId}",
  "applied_at": "2026-04-06T16:30:00Z",
  "status": "applied",
  "source_keywords": "AI developer",
  "source_region": "europe",
  "notes": "",
  "follow_up_date": null,
  "response_date": null,
  "interview_dates": [],
  "result": null
}
```

### 7. Final Report

Output summary table + update daily_log in tracker:

```
## LinkedIn Easy Apply — [date]
**Busca:** [keywords] | **Regiao:** [region]
**Resultado:** X enviadas / Y tentadas

| # | Empresa | Vaga | Local | Status |
|---|---------|------|-------|--------|

**Pipeline total:** Z candidaturas ativas
**Proximo:** /job-briefing amanha ou /linkedin-apply [other keywords]
```

## Rotation Strategy

| Dia | Keywords |
|-----|----------|
| Seg | AI developer europe |
| Ter | fullstack developer europe |
| Qua | react developer uk |
| Qui | AI engineer usa |
| Sex | node.js developer remote |
| Sab | python developer germany |
| Dom | software engineer AI remote |