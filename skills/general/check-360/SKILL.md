---
name: check-360
description: Diagnostico rapido da sessao Claude Code do Juan. Reporta modelo Layer 1 (agente principal), Layer 2 (subagents disponiveis e seus modelos), MCPs conectados, skills carregadas e PM2 da VPS quando aplicavel. Use quando Juan pedir "check 360", "checagem", "como voce ta", "saude da sessao", "self check", "diagnostico", "voce esta operacional", "que modelo voce ta usando", "quais mcps", "quantas skills", ou variacoes. Gatilho oficial pra resposta visual escaneavel — Juan usa porque o status visual nao aparece direto na UI.
layer: hive
---

# Check 360 — auto-diagnostico da sessao

Juan precisa de visibilidade do que esta carregado na sessao atual. UI nao mostra direto, entao essa skill faz a varredura e devolve em formato de painel.

## Quando ativar

Triggers de voz/texto (qualquer variacao fonetica):
- `/check-360`, `/check360`, `/check`
- "check 360", "checagem 360", "diagnostico", "self check"
- "como voce ta", "esta operacional", "saude da sessao"
- "que modelo voce ta usando", "qual modelo", "quais mcps", "quantas skills"
- "tudo conectado", "tudo carregado", "voce ta vivo"

## O que reportar (ordem fixa)

### 1. Layer 1 — Agente principal
Modelo da conversa atual. Pegar do system prompt (ja sei). Hoje: Claude Opus 4.7 (`claude-opus-4-7`).

Se /fast estiver ativo, sinalizar: Opus 4.6 em fast mode.

### 2. Layer 2 — Subagents disponiveis
Lista os subagents da sessao (estao listados na descricao das tools — secao "Available agent types"). Pra cada subagent relevante: nome + uma linha do que faz + (modelo se especificado, senao "herda do Layer 1").

Default Claude Code traz: claude-code-guide, code-reviewer, Explore, general-purpose, Plan, statusline-setup. Ambiente do Juan tem +20 gsd-* agents, neocortex, gsd-debugger, etc. Listar agrupado: builtin / gsd / outros.

Nao precisa listar todos os 30+ — agrupar por categoria + total. Mostrar so os que Juan provavelmente quer ver.

### 3. MCPs conectados
Rodar:
```bash
claude mcp list 2>/dev/null || cat ~/.claude.json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print('\n'.join(d.get('mcpServers',{}).keys()))"
```

Listar nomes dos MCPs ativos. Indicar se sao locais ou remotos quando obvio (ex: fathom = remote OAuth, lean-ctx = local stdio).

### 4. Skills carregadas
```bash
ls ~/.claude/skills/ | wc -l
```

Reportar total. Opcional: agrupar por dominio se Juan pediu mais detalhe (sales-*, gsd-*, content-*, etc).

### 5. PM2 da VPS (so se conexao SSH disponivel ou ja estiver rodando localmente)
```bash
pm2 list 2>/dev/null | grep -E "online|errored|stopped" | grep -v "│ id" | wc -l
pm2 list 2>/dev/null | grep -E "errored|stopped" | head -5
```

Reportar:
- Total de processes online
- Quaisquer errored/stopped (red flag)
- Se nao rodar PM2 localmente, dizer "PM2 nao detectado neste host"

### 6. Sinais extras (so quando relevante)
- `~/.claude/CLAUDE.md` carregado? (sempre eh, mas confirmar tamanho < 200 linhas pro indice)
- Working dir atual
- Algum hook ativo?
- Disk + RAM da VPS quando rodando nela

## Formato de output

Visual, escaneavel, com bolinhas. Sem prosa longa.

```
🩺 Check 360 — DD/MM HH:MM

🧠 Layer 1: Claude Opus 4.7 (claude-opus-4-7)
🤖 Layer 2: N subagents (X builtin · Y gsd · Z outros)
   • Plan, Explore, code-reviewer, general-purpose...
   • gsd-planner, gsd-executor, gsd-debugger... (N total)

🔌 MCPs (N): fathom, lean-ctx, secondbrain, evolution-whatsapp, ...

🛠️ Skills: 172 carregadas

🟢 PM2: 9 online · 0 errored
   • juan-hub, odespertar, secondbrain-api, minddesk, ...

📊 Host: 14GB livres · 4.6GB RAM livre · 2.2GB swap
```

Adapt: se nao for VPS (ex: rodando no Mac), trocar "PM2" por "PM2 nao aplicavel" e ajustar Host.

## Regras

- **Rapido.** Output em < 30s. Nao e profundo, e diagnostico.
- **Visual.** Sempre bolinhas + listas, nunca tabelas markdown (Telegram/WhatsApp nao renderiza).
- **Honest.** Se nao consigo determinar Layer 2 ou subagents, dizer. Nao inventar.
- **Sem prosa.** Resposta cabe em 1 tela do celular do Juan.
- **Auto-comparar.** Se o Juan ja rodou check-360 nesta sessao, opcional sinalizar diferencas (novo MCP carregado, app PM2 caiu, etc).
- **Fast path.** Se Juan disser so "check" ou "como voce ta", responder o painel direto, sem perguntar nada.

## Por que existe

A UI do Claude Code nao mostra qual modelo esta ativo, quantos MCPs estao conectados, quais skills carregaram. Juan quer visibilidade rapida porque opera em multiplas maquinas (Mac, VPS, AionUi via Telegram, WhatsApp via Steve) e cada uma tem stack diferente. Esse skill e o "uname -a" da sessao Claude Code dele.
