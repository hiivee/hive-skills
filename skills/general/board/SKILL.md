---
name: board
description: Acessa o Hub Board via API — lê agenda, move cards, cria tasks, marca done. Trigger: /board, #hoje, meu dia, o que tenho pra fazer, adiciona no board, marca como feito.
layer: hive
---

# /board — Hub Board Access Skill

Quando essa skill ativa, usa a API do Hub pra ler e escrever no board do Juan.

## Credenciais

- **Base URL:** `https://hub.juancarlo.com.br`
- **Bearer token:** em `/root/.claude/api-keys.md` (item `BOARD_API_TOKEN`) ou env `BOARD_API_TOKEN`
- **Board slugs:** `team` (board principal), `juan` (/board-juan), `claude` (/board-claude)

```bash
TOKEN=$(grep "BOARD_API_TOKEN" /root/.claude/api-keys.md 2>/dev/null | grep -oP '(?<=: ).*' | tr -d '`' | head -1)
# Fallback
TOKEN="${BOARD_API_TOKEN:-}"
HUB="https://hub.juancarlo.com.br"
```

## Endpoints disponíveis

### Ler agenda de hoje
```bash
curl -s -H "Authorization: Bearer $TOKEN" "$HUB/api/board/team/hoje"
```
Retorna: `{ tab, columns, cards[] }` — cards ordenados por position, metadata parseado.
Cada card tem: `id, title, status, column_name, metadata.linked_tab, metadata.linked_column_id`

### Ler board completo (todas as tabs)
```bash
curl -s -H "Authorization: Bearer $TOKEN" "$HUB/api/board/team"
```
Retorna: `{ board, columns[], cards[] }` — tudo. Filtrar por `column.tab` pra separar abas.

### Marcar card como done / desmarcar
```bash
# Done:
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"done"}' "$HUB/api/board/team/cards/$CARD_ID"

# Desmarcar:
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":null}' "$HUB/api/board/team/cards/$CARD_ID"
```

### Criar card em coluna
```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"column_id\":$COL_ID,\"title\":\"$TITLE\",\"body\":\"$BODY\"}" \
  "$HUB/api/board/team/cards"
```

### Mover card para outra coluna (PATCH column_id via metadata ou body)
```bash
# PATCH title/body/status/priority/due_date/metadata:
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"body\":\"$NOVA_DESCRICAO\"}" "$HUB/api/board/team/cards/$CARD_ID"
```

> Para mover entre colunas, use a UI do board ou DELETE + POST em nova coluna.
> API PATCH não suporta column_id move direto (requer reorder endpoint).

### Deletar / arquivar card
```bash
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$HUB/api/board/team/cards/$CARD_ID"
```

### Regenerar imagem de fundo do Hoje (Gemini Image API)
```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" "$HUB/api/board/bg"
```

## Formato de resposta pra Juan (WhatsApp)

Quando Juan pedir "o que eu tenho pra fazer hoje" ou "meu dia":

```
📅 *Hoje — [dia, data]*

🔴 *1.* Título do card mais urgente
🟡 *2.* Segundo card
🟢 *3.* Terceiro card
...

✅ Concluídos: N

🔗 Clientes: [lista resumida]
```

Regras de formatação:
- Top 3 = primeiros 3 da lista ordered (são os mais importantes)
- Emoji de prioridade vem do título do card (🔴🟠🟡🟢✅💡)
- Cards done = mostrar só count, não listar
- Máximo 8 itens pendentes no WhatsApp (demais = "e mais N itens")
- IDs dos cards não mostrar pro Juan — só usar internamente pra PATCH/DELETE

## Mapeamento de abas (board team slug)

| Aba slug | Nome UI | Conteúdo |
|----------|---------|---------|
| hoje | Hoje | Agenda diária do Juan |
| clientes | Clientes | Clientes ativos (Austin, Mathis, Verônica...) |
| crm | CRM | Pipeline commercial (leads, propostas, CRM) |
| projetos | Projetos | Steve OS, Hub, Cockpit... |
| estrategias | Estratégias | Growth, conteúdo, ads... |

## Exemplos de uso

**"O que eu tenho pra fazer hoje?"**
→ GET /api/board/team/hoje → formata lista

**"Marca o Austin como feito"**
→ GET hoje → encontra card com "Austin" no título → PATCH status=done

**"Adiciona 'Call com Rachelle amanhã' na agenda"**
→ GET colunas do tab hoje → acha coluna "📅 Agenda" (col 232) → POST card

**"Como tá o CRM?"**
→ GET /api/board/team → filtra columns.tab === 'crm' → lista cards por coluna

**"Gera um fundo novo pro hoje"**
→ POST /api/board/bg → confirma geração

## Fallback se API fora

Se API retornar erro ou token inválido:
- Avisar Juan: "Hub fora ou token expirado. Verifica em hub.juancarlo.com.br"
- NÃO inventar dados do board
- NÃO criar cards sem confirmação da API
