# Hive Skills Registry

> 190+ skills for Claude Code agents — browse, install, and ship faster.

Built by [Hive Technology](https://hub.hivetechnology.io) · Live gallery: **[hub.hivetechnology.io/skills](https://hub.hivetechnology.io/skills)**

---

## Install a skill

```bash
npx hive-skills install --skill <name>
```

Or browse the gallery and copy the install command for any skill.

## Categories

| Category | Count | Description |
|---|---|---|
| `sales` | 25 | Cold outreach, SDR, pricing, leads, CRM |
| `design` | 29 | UI, HTML, carousel, brand, visual |
| `dev` | 29 | Code, debugging, testing, architecture, MCP |
| `ops` | 16 | Steve OS, deploy, VPS, WhatsApp, automation |
| `aiox` | 12 | AIOX agile framework — PM, QA, dev, architect |
| `general` | 79 | Productivity, workflow, AI |

## Structure

```
skills/
├── sales/          # Cold outreach, pricing, SDR, CRM
│   ├── ai-cold-outreach/
│   │   └── SKILL.md
│   └── ...
├── design/         # design-md, carousels, brand, UI
├── dev/            # codenavi, coding-guidelines, MCP
├── ops/            # Steve OS, deploy, VPS
├── aiox/           # AIOX framework agents
└── general/        # Everything else
registry.json       # Machine-readable skill index
```

## Skill format

Each skill is a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
description: What this skill does and when to trigger it.
layer: l1
---

# My Skill

Skill content here...
```

## Contributing

1. Fork this repo
2. Create `skills/<category>/<slug>/SKILL.md`
3. Open a PR — it auto-syncs to the gallery on merge

## Built with

- **Claude Code** — skills run inside claude-code sessions
- **AIOX Framework** — orchestration layer (`skills/aiox/`)
- **Hive Hub** — gallery at `hub.hivetechnology.io/skills`

---

[Hive Technology](https://hub.hivetechnology.io) · [Gallery](https://hub.hivetechnology.io/skills) · [Install CLI](https://npmjs.com/package/hive-skills)
