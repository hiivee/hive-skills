---
name: radar
description: Radar diário de reels virais no Instagram. Pipeline completa (scrape → filter → deep-clone → digest) que entrega top 5+ reels/dia com mp4 baixado, transcrição PT/EN, strategy breakdown e adapted_script na voice do Juan. Ativa quando pedir "rodar radar", "abrir radar", "ver dashboard de reels", "gerar digest de viral", "scrape criadores IG", "atualizar radar", "rodar pipeline IG", "radar de hoje", "ver reels virais".
layer: hive
---

# Radar — Pipeline diário de viral content do IG

Sistema que monitora 30 criadores top em IA / coach / founder / news (BR + EN), identifica reels viralizados, baixa mp4 + transcreve + gera script adaptado pra voice do Juan, e entrega digest em 3 canais.

**Repo:** `~/code/juan/reports-hub`
**Task tracker:** `~/code/juan/reports-hub/docs/tasks/ig-creator-radar/`
**Design:** `~/code/juan/reports-hub/docs/plans/2026-04-26-ig-creator-radar-design.md`

## Verbos

### `/radar` ou `/radar abrir` — abre o dashboard de hoje
```bash
open ~/code/juan/reports-hub/public/reports/radar/index.html
```
Se Hub dev server tá rodando: `open http://localhost:3001/reports/radar/`
Se VPS: `open https://hub.juancarlo.com.br/reports/radar/`

### `/radar run` — força execução manual da pipeline completa
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/run.ts
```
Chain: `scrape → filter → deep-clone → digest`. Tempo total: 5-15 min. Atualiza:
- `public/reports/radar/index.html`
- `public/reports/radar/YYYY-MM-DD-{slot}.html` (snapshot)
- `docs/radar/YYYY-MM-DD-{slot}.md`
- DB: `radar_creators`, `radar_reels`, `radar_runs`

### `/radar status` — estado atual do radar
```bash
cd ~/code/juan/reports-hub && sqlite3 src/db/juan-hub.db "
SELECT 'creators ativos:', COUNT(*) FROM radar_creators WHERE status='active';
SELECT 'reels (72h):', COUNT(*) FROM radar_reels WHERE scraped_at >= datetime('now','-72 hours');
SELECT 'reels viral hoje:', COUNT(*) FROM radar_reels WHERE is_viral=1 AND deep_cloned_at >= datetime('now','-12 hours');
SELECT 'última run:', run_type || ' ' || status || ' ' || started_at FROM radar_runs ORDER BY id DESC LIMIT 1;
"
```

### `/radar discover` — descobre novos criadores (não rodar mais que 1x/semana)
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/discover.ts
```
Insere candidatos em `radar_discoveries` com `status='pending'`.
NB: Estratégia HTML morreu — em iter 2 migrar pra GraphQL.

### `/radar approve list` — lista candidatos pendentes
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/approve.ts list
```
Tabela com IDX, handle, followers, niche, score.

### `/radar approve N,M,K` — aprova candidatos por índice
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/approve.ts approve 1,3,5
```
Insere em `radar_creators` com `status='active'`. Cap hard de 30 active.

### `/radar reject N,M,K` — rejeita candidatos
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/approve.ts reject 2,4
```

### `/radar add @handle` — adiciona criador manual ao radar
```bash
cd ~/code/juan/reports-hub && sqlite3 src/db/juan-hub.db "
INSERT OR IGNORE INTO radar_creators (user_id, handle, niche, language, status, source)
VALUES ('juan-001', '$1', 'ai', 'multi', 'active', 'manual');"
```

### `/radar pause @handle` — pausa um criador
```bash
cd ~/code/juan/reports-hub && sqlite3 src/db/juan-hub.db "
UPDATE radar_creators SET status='paused' WHERE handle='$1';"
```

### `/radar clone <shortcode> [--topic="..."]` — gera reel clone com branding Juan
```bash
cd ~/code/juan/reports-hub && npx tsx scripts/radar/render-clone.ts $1 ${2:+--topic=\"$2\"}
```
Recorta inner video do source (template Diego Almeida coords: y=720, h=810), gera creator card PNG (Juan Carlo + verified + @juanncarllo.dev + topic line) via Playwright headless, ffmpeg compõe sobre canvas 1080×1920 preto. Output em `public/reports/radar/clones/{shortcode}-juan.mp4`.

Topic line: se omitir `--topic="..."`, deriva do `adapted_script` automaticamente.

**Nota:** template otimizado pro layout @diegoalmeida.ia (creator card top + center video + black borders). Outros formatos (full-frame, sobreposição direta) precisam variante diferente — não suportado ainda.

```bash
# Ver clones renderizados:
ls public/reports/radar/clones/

# Caption + hashtags pronto pra cada:
cat public/reports/radar/clones/POST-READY.md
```

## Cron schedules ativos (timezone São Paulo)

Registrados em `src/lib/cron.ts`. Rodam quando `juan-hub` PM2 tá up.

| Quando | Cron | Script |
|---|---|---|
| Domingo 06:00 | `0 6 * * 0` | discover.ts |
| Diário 08:00 | `0 8 * * *` | run.ts (morning) |
| Diário 20:00 | `0 20 * * *` | run.ts (evening) |
| Diário 03:00 | `0 3 * * *` | purge.ts (mp4 >30d) |

## Arquitetura

5 scripts isolados em `scripts/radar/`:

```
discover.ts  → 1x/semana, popula radar_discoveries
approve.ts   → CLI de aprovação manual (até Hub UI iter 2)
scrape.ts    → 2x/dia, IG API v1 (web_profile_info + feed/user) com cookies
filter.ts    → híbrido: 3× mediana OR >500k absoluto, top-5 mínimo
deep-clone.ts → yt-dlp + ElevenLabs Scribe + Claude/Gemini script-adapt
digest.ts    → markdown + HTML dashboard (auto-gerado a cada run)
purge.ts     → cleanup mp4 > 30d
run.ts       → orquestrador (chain dos 4 acima)
```

**Filter logic:** sempre escolhe TOP 5 minimum por viral_score, mesmo se nenhum bater threshold viral. Se mais de 5 passarem o threshold, escolhe até 10.

**Deep clone:** mp4 baixado via yt-dlp (cookies em `~/.cache/ig-cookies.json` → conversão Netscape em `/tmp/radar-yt-dlp-cookies.txt`). Transcrição via ElevenLabs Scribe (`scribe_v1`, language `por`/`eng`). Strategy + adapted_script via Claude Sonnet 4.6 com fallback Gemini 2.5-flash-lite quando Anthropic está sem créditos.

## Dependências externas

- `yt-dlp` (`/opt/homebrew/bin/yt-dlp`) — download mp4
- `ffmpeg` (`/opt/homebrew/bin/ffmpeg`) — first-frame thumbs
- ElevenLabs API key em `users.settings` JSON do hub DB
- Anthropic + Gemini API keys em `.env` do hub
- IG cookies em `~/.cache/ig-cookies.json` (refrescar via `scripts/ig-export-cookies.ts` quando expirar)

## Deploy VPS

App `juan-hub` já roda em `195.200.2.16:3001` via PM2. Pipeline radar é parte dele (cron registrado em `lib/cron.ts`).

```bash
# Push pra VPS
cd ~/code/juan/reports-hub && git push

# SSH e redeploy
ssh root@195.200.2.16
cd /var/www/juan-hub
git pull && npm install && NODE_OPTIONS='--max-old-space-size=4096' npm run build && pm2 restart juan-hub

# Verificar cron schedules ativos
pm2 logs juan-hub --lines 50 | grep -i radar
```

**Sync de IG cookies pra VPS** (uma vez, ou quando expirar):
```bash
scp ~/.cache/ig-cookies.json root@195.200.2.16:/root/.cache/ig-cookies.json
```
Sem isso, scrape e yt-dlp no VPS retornam HTML thin (zero reels).

## Troubleshooting

**Filter retorna 0 candidates:**
- Reels antigos com `deep_clone_status != 'skipped'` são excluídos. Reset:
  `UPDATE radar_reels SET deep_clone_status='skipped' WHERE deep_clone_status='done' AND scraped_at < datetime('now','-72 hours')`

**Scrape retorna 0 reels:**
- Cookies expiraram. Rerodar `scripts/ig-export-cookies.ts` (precisa Chrome dedicado IG aberto).
- Ou IG mudou layout — checar logs por "thin HTML".

**Deep-clone Claude falha 401:**
- Anthropic credits acabaram. Vai automático pro fallback Gemini. Se ambos falharem, top up do Anthropic.

**Dashboard HTML não carrega thumbs/mp4 em `file://`:**
- Paths são relativos (`thumbs/X.jpg`, `mp4/X.mp4`). Funciona via `file://` E via Hub `/reports/radar/`.

## Iteração 2 (futuro)

- [ ] Hub `/radar` page React com filtros/ações via DB
- [ ] Telegram push (top 3 com thumb + link pro dashboard)
- [ ] WhatsApp push (top 3 via `lib/whatsapp.ts`)
- [ ] Frame analysis: ffmpeg keyframes + Claude vision
- [ ] Discovery via GraphQL endpoint (HTML scraping morto)
- [ ] API routes pra ações: `POST /api/radar/reels/{shortcode}` (cloned/rejected/notes)
