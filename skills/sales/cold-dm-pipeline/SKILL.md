---
name: cold-dm-pipeline
description: Pipeline reutilizável de cold DM via Instagram, configurável por empresa/nicho. Scrape → enrich (LLM) → quality filter → human approval → send com pacing seguro → analytics dashboard. Use quando pedir "rodar prospecção pra empresa X", "criar campanha de cold DM no IG", "scrape coaches/SaaS founders/dentists/etc". Funciona via config JSON: zero código novo por nova empresa, só novo config.
layer: hive
---

# Cold DM Pipeline (multi-empresa)

Pipeline end-to-end de prospecção via IG DM, **config-driven**. Cada nova empresa/campanha = novo arquivo de config, zero refactor.

## Pré-requisitos

1. Chrome dedicado em CDP `:9222` com IG logado (use `scripts/ig-chrome-launch.sh` no projeto base)
2. `OPENAI_API_KEY` em `.env` (pra enrichment via gpt-4o-mini, ~$0.001/lead)
3. Diretório base do projeto: `/Users/juan/code/juan/reports-hub` (scripts originais aqui)

## Como criar nova campanha (5 minutos)

**1. Copia template de config:**

```bash
cp ~/.claude/skills/cold-dm-pipeline/configs/_template.json \
   ~/.claude/skills/cold-dm-pipeline/configs/<empresa>.json
```

**2. Edita o config:**

```json
{
  "campaign_id": "minha-empresa-2026-04",
  "icp": {
    "niche_label": "coaches",
    "follower_range": [1500, 50000],
    "positive_signals": ["coach", "mentor", "transform", "helps women"],
    "negative_signals": ["AI developer", "founder.*SaaS", "crypto"]
  },
  "scrape_sources": {
    "keywords": ["life coach", "mindset coach", "executive coach"],
    "hashtags": ["lifecoachforwomen", "mindsetmatters"]
  },
  "message_variants": {
    "V1_default": "Hi {firstName}, I help {niche} organize their client data, create brand books, and unlock synergies that multiply results. If it makes sense, let's connect.",
    "V2_creator": "Hi {firstName}, I build systems that turn your client work + courses into a repeatable asset. Worth a chat?"
  },
  "pacing": {
    "daily_cap": 50,
    "delay_min_sec": 300,
    "delay_max_sec": 420
  },
  "enrichment_prompt": "You analyze IG profiles for B2B outbound. Classify archetype: pure_coach|coach_creator|coach_speaker|not_fit. Suggest variant V1/V2. Confidence 0-10.",
  "skip_handles": ["austinlwrightofficial", "rachelle__yilmaz"]
}
```

**3. Roda pipeline:**

```bash
# 1. Scrape (popula data/<campaign_id>/candidates.csv)
cold-dm scrape --config <empresa>

# 2. Enrich (LLM via gpt-4o-mini)
cold-dm enrich --config <empresa>

# 3. Mostra top-N pra aprovação humana
cold-dm review --config <empresa> --top=50

# 4. Importa aprovados ao tracker
cold-dm approve --config <empresa> --c-min=7

# 5. Dispara batch (respeitando pacing + cap)
cold-dm send --config <empresa> --count=30

# 6. Analytics
cold-dm analytics --config <empresa>
```

## Comandos disponíveis

| Cmd | Função |
|-----|--------|
| `scrape` | Roda scraper Playwright pelos sources do config (keywords + hashtags). Popula `data/<campaign>/candidates.csv` append-only. |
| `enrich` | LLM classifica cada candidate (archetype, pain signals, variant, firstName, confidence). Output: `candidates-enriched.csv`. |
| `review` | Mostra top-N enriquecidos no terminal pra Juan aprovar manualmente. |
| `approve` | Importa aprovados ao tracker.csv com tag `approved_<data>`. |
| `send` | Roda batch via Playwright com pacing safe (5-7min). Marca status=sent no tracker. |
| `analytics` | Gera HTML dashboard em `public/reports/<campaign>/analytics.html`. |
| `observe` | Inicia loop de inbox observer (poll 30min, marca replies). |

## Padrões obrigatórios (lock-in 2026-04-25)

- **safeOp pattern** em loops Playwright (single tab failure NÃO mata script)
- **CSV append-only** (nunca writeFileSync se size===0, só se !exists)
- **Tab close em finally** (Chrome RAM bomb)
- **Aprovação humana antes de send** (cap diário + sem repetir handles)
- **Sem travessão (em-dash)** em mensagens (`grep "—" mensagens.json` zerar)
- **Diagnóstico Occam antes de "IG block"** (checa Chrome state primeiro)

## Arquitetura

```
~/.claude/skills/cold-dm-pipeline/
├── SKILL.md (este arquivo)
├── configs/
│   ├── _template.json (skeleton pra copiar)
│   ├── coaches.json (campanha atual Juan)
│   └── <empresa>.json (suas)
└── scripts/ (links pros scripts em reports-hub)

/Users/juan/code/juan/reports-hub/
├── scripts/
│   ├── ig-deep-scrape-v2.ts (scrape; safeOp + CSV append-only)
│   ├── ig-enrich-candidates.ts (LLM classify via OpenAI)
│   ├── ig-import-enriched.ts (importa pro tracker)
│   ├── ig-send-batch.ts (sender Playwright com pacing)
│   ├── ig-build-analytics.ts (dashboard Chart.js)
│   ├── ig-inbox-observer.ts (replies poll)
│   ├── ig-recover-lost.ts (recovery quando CSV truncar)
│   ├── ig-chrome-launch.sh (Chrome dedicado :9222)
│   └── ig-daily-campaign.sh (wrapper launchd)
└── docs/tasks/<campaign>/
    ├── CAMPAIGN-LOG.md (single source of truth, append-only)
    ├── tracker.csv (estado de cada lead)
    └── data/
        ├── candidates.csv (raw scrape)
        ├── candidates-enriched.csv (LLM-classified)
        ├── send-log.ndjson (per-attempt log)
        └── screenshots/ (evidência de cada send)
```

## Customização por empresa

**O que muda por nova empresa:**
- `campaign_id`, `niche_label`
- `keywords` e `hashtags` (sources do scrape)
- `positive_signals` e `negative_signals` (regex)
- `message_variants` (template da DM)
- `daily_cap` (conservador 30-60 pra IG pessoal)
- `enrichment_prompt` (prompt LLM customizado pro vertical)

**O que NÃO muda (compartilhado):**
- Scripts (mesmos pra todos)
- Padrões safeOp / CSV append-only / tab close
- Pacing seguro (sempre 5-7min)
- Dedup 3-camadas (status CSV + thread pré-existente + skip list)
- Chrome dedicado em `:9222`

## Checklist setup nova empresa

- [ ] Criar config JSON em `configs/<empresa>.json`
- [ ] Definir 10-30 keywords + 5-10 hashtags do nicho
- [ ] Escrever 1-3 mensagens (V1/V2/V3) sem travessão
- [ ] Cap diário conservador (30-50 primeiros 7 dias)
- [ ] `cold-dm scrape --config <empresa>` (background, 3-4h)
- [ ] `cold-dm enrich --config <empresa>` (~5min)
- [ ] `cold-dm review --config <empresa>` (Juan aprova)
- [ ] `cold-dm send --config <empresa>` (background, 30-60min/batch)
- [ ] `cold-dm analytics --config <empresa>` (dashboard fresh)
- [ ] launchd schedule pra rodar diário automático

## Memorias relacionadas (lock-in patterns)

- `feedback_chrome_ram_bomb.md` — close tab em finally
- `feedback_playwright_safeop_pattern.md` — safeOp helper
- `feedback_diagnose_before_assuming.md` — Occam antes de "IG block"
- `feedback_csv_append_only.md` — nunca truncar CSV
- `feedback_no_em_dash.md` — sem travessão em msg
- `feedback_icp_pivot_coaches.md` — ICP claro > generic
- `feedback_campaign_log_pattern.md` — CAMPAIGN-LOG.md append-only
- `feedback_ig_dm_automation.md` — quando preferir HTML manual vs auto

## Status atual da implementação

- ✅ Scripts core funcionais (scrape, enrich, sender, analytics)
- ✅ Padrões lock-in salvos em memory
- ✅ Campanha real rodando (coaches, Juan @juanncarllo)
- 🟡 CLI wrapper `cold-dm` ainda não implementado (use scripts diretos por enquanto)
- 🟡 Config-driven não implementado (config hardcoded em ig-deep-scrape-v2.ts)
- ⏳ Próxima iteração: extrair config + criar CLI wrapper + multi-empresa no mesmo Chrome

## Como aplicar pra nova empresa HOJE (sem CLI ainda)

1. Duplica `scripts/ig-deep-scrape-v2.ts` → `ig-deep-scrape-<empresa>.ts`
2. Edita: `QUERIES`, `HASHTAGS`, `COACH_SIGNALS`, `NEG_SIGNALS`, `OUT` path
3. Mesmo pra `ig-send-batch.ts`: muda `buildMsg()` template
4. Roda pipeline manual nos novos scripts
5. Doc da campanha em `docs/tasks/<empresa>/CAMPAIGN-LOG.md`

Refactor pra config JSON + CLI fica pra próxima iteração.
