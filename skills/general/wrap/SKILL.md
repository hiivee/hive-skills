---
name: wrap
description: Sincronização cross-board do painel de controle (3 boards do Juan). Voice triggers — "fechamento do dia", "wrap", "wrap-up", "atualiza os 3 boards", "fecha o dia". Cron 8h SP rodam morningWrap, 18h SP rodam eveningWrap automaticamente. Skill é a versão completa que Juan invoca quando quer fechar agora. Cruza Calendar + Gmail + Fathom + WhatsApp + ClickUp e atualiza /board (CRM) + /board-juan (80/20) + /board-claude (memória viva) via SQL transaction direta na VPS. Salva memória do que mudou.
layer: hive
---

# /wrap — Painel de Controle Sync

> Voice triggers: "fechamento do dia" · "wrap" · "wrap-up" · "atualiza os 3 boards" · "fecha o dia" · "atualize /board /board-juan /board-claude" · "pega tudo e me fala"

## O que faz

Sincroniza estado real (calendar, email, reuniões, mensagens) com os 3 boards do Juan:
- **/board** (slug=team) — CRM, pipeline comercial
- **/board-juan** (slug=juan) — 80/20 pessoal, agenda diária
- **/board-claude** (slug=claude) — memória viva do Claude

## Quando ativar

1. Juan fala um voice trigger acima
2. Final de tarde/noite quando ele tá fechando o dia
3. Após sessões que geraram leads/decisões/follow-ups novos
4. Antes de viagem ou pausa longa
5. Manhã pra ver o que entrou enquanto dormia (cron 8h já roda automatic, mas pode rodar manual)

**NÃO ativar pra:**
- Pergunta pontual sobre um board específico
- Adicionar 1 card avulso (faz direto via SQL ou API)
- Quando Juan tá em outra task

## Pipeline (siga em ordem)

### Fase 1 — Reunir contexto (paralelo)
```bash
# Em paralelo: 4 fontes de verdade
ssh root@195.200.2.16 "sqlite3 /var/www/juan-hub/src/db/juan-hub.db 'SELECT bc.id, b.slug, bcol.name as col, bc.title, bc.priority, bc.due_date FROM board_cards bc JOIN boards b ON b.id = bc.board_id JOIN board_columns bcol ON bcol.id = bc.column_id WHERE bc.is_archived = 0 ORDER BY b.slug, bcol.position, bc.position'"
```

Em paralelo (Tool calls):
- `mcp__fathom__list_meetings` últimos 2-3 dias com `include_summary:true`
- `mcp__claude_ai_Gmail__search_threads` query `in:inbox newer_than:3d`
- `mcp__claude_ai_Google_Calendar__list_events` hoje + amanhã + sex
- Query VPS DB pendências/finanças

### Fase 2 — Cruzar e diff
- Reuniões novas → quais já tem card em /board? Quais são leads novos?
- Emails: Otter shared, Pipefy moves, payment failed, propostas enviadas
- Calendar: eventos hoje sem card em /board-juan Hoje?
- Cards Hoje (passados sem ✅) → Concluído ou repetir?

### Fase 3 — Update atomico via SQL
**SEMPRE backup primeiro:**
```bash
ssh root@195.200.2.16 "cp /var/www/juan-hub/src/db/juan-hub.db /var/www/juan-hub/src/db/juan-hub.db.bak-$(date +%Y-%m-%d-%H%M)-wrap"
```

**Escrever SQL em `/tmp/board-wrap-<date>.sql` com `BEGIN TRANSACTION; ... COMMIT;`**

**Schema reference (decorar):**
- Boards: `team=16`, `juan=17`, `claude=19`
- TEAM colunas-chave: `185 Novos leads · 187 Negociação · 188 Proposta enviada · 189 Fechado · 190 Pagamento pendente · 205 Concluídos · 229 Parceiros estratégicos · 204 Arcanys · 191 Mathis · 192 Atómica`
- JUAN colunas: `206 Hoje (80/20) · 207 Esta semana · 208 Este mês · 209 Trimestre · 210 Atenção · 211 Pessoas · 212 Ideias · 213 Em pausa · 214 Concluído`
- CLAUDE colunas: `223 Contexto persistente · 224 Em execução · 225 Próximo · 226 Aguardando Juan · 227 Aprendizados · 228 Concluído`

**Atalho via API hub (preferir quando funcionar):**
```bash
curl -X POST https://hub.juancarlo.com.br/api/cron/wrap-full
# Retorna summary completo pronto pra Telegram
```

**Sempre populate `metadata` JSON com source:**
```sql
INSERT INTO board_cards (..., metadata, ...) VALUES (..., '{"source":{"type":"fathom","id":144184099,"url":"fathom.video/calls/660350628"}}', ...);
```

### Fase 4 — Salvar memória + atualizar CONTEXT.md se domínio mudou
- Memory pattern em `~/.claude/projects/-Users-juan-code-juan-reports-hub/memory/feedback_3boards_painel_controle.md` (já existe, atualizar)
- `docs/CONTEXT.md` se novo cliente, nova estratégia, novo projeto

### Fase 5 — Resumir pro Juan (caveman style)
- Cards/diff aplicados nos 3 boards
- Próximas ações urgentes (Atenção/Hoje 80/20)
- Receivables/finanças
- Pendências aguardando Juan (em /board-claude col 226)

## Helpers TS disponíveis (chamar via tsx ou import)

```typescript
import { addCard, moveCard, findCards, archiveStaleConcluido, listCards, linkCards, updateCard } from '@/lib/board-helpers';
import { TEAM_COLS, JUAN_COLS, CLAUDE_COLS } from '@/lib/board-schema';
import { morningWrap, eveningWrap, runFullWrap, importCalendarToHoje, detectGmailSignals } from '@/lib/wrap-pipeline';
```

Preferir helpers > SQL crú. Helpers garantem `metadata.source` e timestamps consistentes.

## Anti-patterns

- ❌ Editar local `juan-hub.db` (stale, dessincroniza com VPS)
- ❌ Multiple INSERT separados sem transaction
- ❌ Esquecer backup antes de SQL massivo
- ❌ Apagar card em vez de arquivar (perde histórico)
- ❌ Criar coluna nova sem confirmar com Juan
- ❌ Ignorar `metadata.source` — perde rastreabilidade

## Cron schedule (já automatic na VPS)

| Hora SP | Job | Ação |
|---------|-----|------|
| 08:00 | wrap-morning | Importa eventos do dia → Hoje · move Hoje passado → Concluído · detecta Otter/Pipefy/payment via Gmail · auto-archive Concluído > 30d · Telegram resumo matinal |
| 18:00 | wrap-evening | Resume cards Hoje pendentes · preview eventos amanhã · Telegram checklist final |

Manual: `curl -X POST https://hub.juancarlo.com.br/api/cron/wrap-morning` ou `wrap-evening` ou `wrap-full`.
