---
name: prospectar-instagram
description: Pipeline automatizado de prospecção no Instagram. Scrape likers de posts sobre AI/Claude Code, filtra por ICP (tem URL, 100-15K followers, business bio, não é content creator), gera mensagem de conexão + primeira DM via Gemini seguindo template de social selling. Output markdown pronto pra copiar e enviar. Use quando pedir "pega 20 leads", "prospecta no Instagram", "rodar pipeline de leads", "scrape likers de post".
layer: hive
---

# Prospectar Instagram — Pipeline Automatizado

Rode o funil end-to-end: scrape → filter → generate DMs → markdown ready to send.

## Comando

```bash
cd /Users/juan/code/juan/reports-hub
npx tsx scripts/ig-prospect-pipeline.ts <post_url> [max_scrape] [top_n]
```

## Pré-check

1. Verifica se `browse` está logado no Instagram:
```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto "https://www.instagram.com/" && sleep 2 && $B js "document.querySelector('svg[aria-label=\"Home\"]') ? 'LOGGED' : 'NOT'"
```

2. Se NOT, abre login pra user:
```bash
$B goto "https://www.instagram.com/accounts/login/"
$B handoff
```

Espera user logar, depois `$B resume`.

## Posts-Alvo Recomendados

Audiência de empresários/founders (não devs/content creators):

- `@basharjkatou` — 2M followers, AI pra empresários
- `@mikemeansbusiness_ai` — Claude Code pra creators/empresários
- `@ai.blackmagic` — 60K, AI tutorials
- `@prithvirajagarawal` — AI-native agency founder

Achar posts novos: instagram.com/explore → buscar `#claudecode`, `#aiagents`, `#aicoding`.

## O que o Pipeline faz

1. **Scrape likers** do post (usa `browse goto /liked_by/`)
2. **Scrape perfil** de cada liker (bio, stats, URL)
3. **Filtra por ICP:**
   - +25 pts: tem URL
   - +20 pts: 100-15K followers
   - +20 pts: bio menciona CEO/Founder/Owner/Business
   - -30 pts: "Reel creator" / "Digital creator"
   - -15 pts: "Former [X]M followers" (guru)
   - Threshold: score ≥ 40
4. **Gera DMs** via Gemini usando o prompt em `docs/estrategias/claude-code-growth/prospeccao-organica/SOCIAL-SELLING-DM-PROMPT.md`
5. **Salva** em `docs/estrategias/claude-code-growth/prospeccao-organica/batches/batch-YYYY-MM-DD-HHMM.md`

## Output Format

```markdown
## 1. @username — Name
**Score:** 85 | **Followers:** 450 | **Posts:** 41
**URL:** https://www.instagram.com/username/
**Bio:** Product/service | Your No. 1 partner in...

🔗 NOTA DE CONEXÃO
---
[mensagem 300 chars]

💬 PRIMEIRA DM (enviar após aceitar)
---
[mensagem 3-5 linhas]
```

## Learnings (do case SkuuAI que funcionou)

1. **Produto real > content creator** — founder rodando a conta converte melhor
2. **Pergunta técnica > pitch** — "que stack você usa?" gera resposta
3. **Zero link na primeira msg** — deixa o perfil do Juan trabalhar
4. **Curto > longo** — máx 60 palavras

## Limites

- Scrape: 200 req/hora por IP (Instagram ToS)
- DMs: warm-up gradual — 5/dia semana 1, 10/dia semana 2, 20/dia semana 3
- Delays: 2-5s entre actions, 3-8 min entre DMs
