---
name: job-cv-tailor
description: Customiza CV e cover letter para uma vaga especifica. Analisa job description, destaca skills relevantes, gera versao otimizada. Uso - /job-cv-tailor [job-url ou job-description]
layer: hive
---

# Job CV Tailor — Resume Customization per Job

Analisa uma vaga e gera CV + cover letter customizados para maximizar match.

## Uso

```
/job-cv-tailor https://linkedin.com/jobs/view/123456
/job-cv-tailor [paste job description here]
```

## Part of Job Search OS

Suite: `/linkedin-apply` → `/job-tracker` → `/job-briefing` → `/job-cv-tailor` → `/job-interview-prep`

## Steps

### 1. Load Profile + Base CV

```bash
cat ~/.claude/job-search/profile.json
```

Also check if base CV exists:
```bash
ls ~/.claude/job-search/cv-base.md 2>/dev/null
```

If no base CV exists, generate one from profile.json on first run and save it.

### 2. Extract Job Description

If URL provided:
- Use browse tool to navigate and extract job description text
- Extract: title, company, location, requirements, nice-to-haves, responsibilities, salary range

If text provided:
- Parse directly

### 3. Analyze Match

Compare job requirements against profile:

```markdown
## Match Analysis — [Company] [Role]

### Required Skills Match
| Requirement | Your Level | Match |
|-------------|-----------|-------|
| Python 5+ years | 3 years | Partial |
| React | 5 years | Strong |
| LLM experience | 3 years | Strong |

### Match Score: X/10

### Strengths to Highlight
- [skill that matches strongly]
- [relevant project/achievement]

### Gaps to Address
- [skill gap — how to frame it positively]

### Keywords to Include
- [ATS-friendly keywords extracted from JD]
```

### 4. Generate Tailored CV

Create a tailored version that:
- **Reorders** experience bullets to match JD priorities
- **Emphasizes** matching skills (bold, first position)
- **Includes** exact keywords from JD (ATS optimization)
- **Quantifies** achievements relevant to this role
- **Adjusts** summary/headline to match role title
- **Removes** irrelevant experience (keep it focused)

Output as markdown (convertible to PDF later).

Save to: `~/.claude/job-search/tailored-cvs/[company]-[role]-[date].md`

### 5. Generate Cover Letter

Write a targeted cover letter:

**Structure:**
1. **Hook** — Why this company specifically (1-2 sentences showing you researched them)
2. **Match** — Top 3 ways your experience maps to their needs (with specific examples)
3. **Unique Value** — What you bring that others dont (AI expertise + full-stack + business acumen)
4. **Close** — Enthusiasm + availability + call to action

**Rules:**
- Max 250 words
- No generic phrases ("I'm excited to apply...")
- Reference specific company products/values
- Include 1 concrete metric/achievement
- Professional but personable tone (not robotic)

Save to: `~/.claude/job-search/cover-letters/[company]-[role]-[date].md`

### 6. Generate Application Notes

For manual applications (not Easy Apply), generate:
- Answers to common application questions
- "Why do you want to work here?" tailored answer
- "What's your biggest achievement?" tailored to role
- Salary expectations framing

### 7. Output Summary

```markdown
## CV Tailored — [Company] [Role]

**Match Score:** X/10
**Key Adjustments:** [what was changed]

### Files Generated
- CV: `~/.claude/job-search/tailored-cvs/[file].md`
- Cover Letter: `~/.claude/job-search/cover-letters/[file].md`

### Recommended Next Steps
- If Easy Apply: Run `/linkedin-apply` (uses default CV)
- If manual apply: Use tailored CV + cover letter above
- Consider: Find referral contact → `/job-interview-prep [company]` for networking
```

### 8. Track

Add to tracker with method "tailored_apply" and notes about customization.