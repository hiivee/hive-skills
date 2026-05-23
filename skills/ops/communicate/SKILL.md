---
name: communicate
description: Comunicacao com time e contatos via WhatsApp (wacli/wa) e Google Chat (webhook). Ativa quando Juan pedir pra mandar mensagem, comunicar time, enviar resumo, notificar grupo, ler mensagens, buscar historico, ou listar contatos/grupos. ATIVA PROATIVAMENTE (sem Juan pedir) quando deploy concluido, status rapido atualizado, task critica terminada, erro bloqueante em producao, ou marco importante concluido — ver secao "Proactive Triggers".
user-invokable: true
argument-hint: "[mensagem ou contexto] [--to destinatario] [--channel whatsapp|gchat|both]"
layer: hive
---

# Communicate — WhatsApp + Google Chat CLI

Skill para enviar e ler mensagens via **WhatsApp** (wacli CLI) e **Google Chat** (webhooks).

---

## Proactive Triggers (mandar sem Juan pedir)

Quando **qualquer** uma das situacoes abaixo acontecer durante uma sessao, enviar uma
mensagem curta pro Juan via `wa "..."` — mesmo que ele nao peca. Mensagem curta, 1-3 linhas,
com emoji de contexto. Sempre em PT-BR.

| Gatilho | Quando | Template |
|---------|--------|----------|
| 🚀 **Deploy concluido** | Depois de push pra main em repo Dokploy OU `pm2 restart` na VPS OU merge de PR de producao | `🚀 Deploy *<app>* no ar. Commit: <sha curto> — <1-linha do que mudou>. URL: <link>` |
| 📋 **Status rapido atualizado** | Depois de gerar/atualizar `docs/tasks/status-rapido/*.md` | `📋 Status rapido <DD/MM> atualizado. <N> projetos 🔴 / <N> 🟠. Link: <url hub>` |
| ✅ **Task critica terminada** | Task que estava 🔴 no status virou feita (proposta enviada, PR merged, feature shipada, cliente respondido) | `✅ <task> concluida. Proxima acao: <1 linha> ou "nenhuma, pode baixar prioridade".` |
| 🔥 **Erro bloqueante em prod** | Script deploy falhou, build quebrou, app caiu, pagamento rejeitado, integracao externa derrubou | `🔥 <servico/app> *down*. Erro: <1-linha>. Investigando agora.` |
| 💰 **Movimentacao financeira detectada** | Pagamento confirmado no DB, nova proposta fechada, recebimento caiu | `💰 <cliente> pagou <valor>. Total mes: R$ <total>.` |
| 🦅 **Marco grande** | Fechou cliente novo high-ticket, call estrategica teve resultado, meta do mes batida | `🦅 <marco>. <contexto breve>.` |
| ⚠️ **Decisao irreversivel chegando** | Antes de executar algo destrutivo (drop table, force push, delete em producao), avisar primeiro | `⚠️ Prestes a <acao>. Confirma? (responda SIM ou NAO)` — aguardar resposta |

### Regras dos gatilhos proativos

1. **Nao spamear** — no maximo 1 msg proativa a cada 10min (agrupar se couber). Status rapido + deploy + task concluida no mesmo ciclo = 1 mensagem consolidada.
2. **Fora do horario de sono (00h–07h SP)** so mandar se for **🔥 bloqueante** ou **⚠️ decisao irreversivel**.
3. **Sempre curto** — Juan le no celular. 3 linhas max. Link se precisar de detalhe.
4. **Tom direto, sem enrolacao** — igual mensagem entre socios. Nao "olha, acho que..." — fatos.
5. **Default destinatario eh ele mesmo** — `554198769389@s.whatsapp.net` via `wa "..."`. Nunca mandar pros clientes proativamente.
6. **Se ele disser "nao me avise mais X"** — salvar em memory e respeitar nas proximas sessoes.

### Wrapper `wa` (sempre preferir)

```bash
wa "🚀 Deploy juan-hub no ar. hub.juancarlo.com.br ok."
wa --file /tmp/relatorio.pdf "status rapido 24/04 em PDF"
```

Atalho instalado em `~/bin/wa`, aponta pro `wacli` com JID do Juan pre-configurado.
Usar `wacli` direto so quando destinatario nao for o Juan.

---

## Quick Reference

```bash
# WhatsApp — atalho pro Juan (default)
wa "mensagem aqui"

# WhatsApp — arquivo pro Juan
wa --file /abs/path.png "legenda"

# WhatsApp — enviar texto pra outro JID
wacli send text --to "<JID>" --message "texto"

# WhatsApp — enviar arquivo
wacli send file --to "<JID>" --file "/path/to/file" --caption "legenda"

# WhatsApp — buscar mensagens
wacli messages search "termo" --limit 20

# WhatsApp — listar chats recentes
wacli chats list --limit 30

# WhatsApp — listar grupos
wacli groups list --limit 50

# WhatsApp — buscar contatos
wacli contacts search "nome"

# WhatsApp — status da conexao
wacli doctor

# Google Chat — enviar via webhook
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"mensagem"}' \
  "<WEBHOOK_URL>"
```

---

## WhatsApp via wacli

### Setup
- **Binary:** `/opt/homebrew/bin/wacli`
- **Store:** `~/.wacli/`
- **Auth:** `wacli auth` (QR code)
- **Health:** `wacli doctor` → deve mostrar AUTHENTICATED=true

### Diagnostico
Se `wacli doctor` mostrar CONNECTED=false, o send ainda funciona (auto-reconnect).
Se AUTHENTICATED=false, precisa re-autenticar com `wacli auth`.

---

## Diretorio de Contatos (JIDs)

### Pessoas — DM

| Nome | JID | Contexto |
|------|-----|----------|
| **Juan (eu)** | `554198769389@s.whatsapp.net` | Meu proprio numero — usar pra notas pessoais ou rascunhos |
| **Mohamed Amer** | `971528317085@s.whatsapp.net` | CEO Penguin, parceiro, mentor |
| **Matheus Flores** | `5521920009302@s.whatsapp.net` | PM Penguin, operacional |
| **Luiz Fernando** | `558381966523@s.whatsapp.net` | Dev Hive |
| **Steve** | `554197005133@s.whatsapp.net` | Contato |
| **Diogo Dynamis** | `556294797664@s.whatsapp.net` | Dynamis Educacao |
| **Mae** | `554199387622@s.whatsapp.net` | Mae do Juan |

### Grupos

| Nome | JID | Contexto |
|------|-----|----------|
| **Grupo Principal Juan** | `554198769389-1586781772@g.us` | "Deixe o TODO no controle..." — grupo pessoal do Juan |
| **Dynamis Time** | `120363404381451051@g.us` | Time completo Dynamis |
| **Hubix Dynamis** | `120363419450813651@g.us` | Hubix + Dynamis (Edtech) |
| **AI Coders** | `120363404054230307@g.us` | Comunidade AI Coders |
| **AI Coders Lobby** | `120363405494790407@g.us` | Lobby do AI Coders |
| **IA Litoral Imoveis** | `120363421991220041@g.us` | Projeto Litoral Gaivota |
| **Capital Magnetico** | `120363402919086183@g.us` | Capital Magnetico 2 |

### Aliases Comuns (interpretar do contexto)

| Quando Juan diz... | Enviar para |
|---------------------|-------------|
| "manda pra mim" / "me manda" / "pra mim mesmo" | Juan: `554198769389@s.whatsapp.net` |
| "manda pro Mohamed" / "manda pro Mo" | Mohamed: `971528317085@s.whatsapp.net` |
| "manda pro Matheus" | Matheus: `5521920009302@s.whatsapp.net` |
| "manda no grupo" / "meu grupo" / "grupo principal" | Grupo Juan: `554198769389-1586781772@g.us` |
| "manda no Dynamis" / "time Dynamis" | Dynamis: `120363404381451051@g.us` |
| "manda pra mae" | Mae: `554199387622@s.whatsapp.net` |
| "manda pro Luiz" | Luiz: `558381966523@s.whatsapp.net` |

Se o destinatario nao estiver na lista, buscar com `wacli contacts search "nome"` ou `wacli groups list --query "nome"`.

---

## Google Chat via Webhooks

### Setup
Google Chat usa webhooks por space. Cada space tem uma URL unica.

**Configurar webhook:**
1. Abrir Google Chat → Space name → "Apps & integrations" → "Add webhooks"
2. Dar um nome, salvar, copiar a URL
3. Salvar aqui na skill e no `users.settings.gchat.webhooks` do Hub

**URL format:** `https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=KEY&token=TOKEN`

### Spaces Conhecidos

| Space | Webhook URL | Contexto |
|-------|-------------|----------|
| Penguin Software | *(configurar)* | Time Penguin principal |

> NOTA: Pedir ao Juan as webhook URLs dos spaces que ele quer usar.
> Quando configuradas, adicionar aqui e no `users.settings.gchat.webhooks` do Hub.
> O Hub ja tem suporte em `src/lib/notifications.ts` (case 'google_chat') e `/api/channels`.

### Enviar Mensagem

```bash
# Texto simples
curl -s -X POST \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{"text":"Mensagem aqui"}' \
  "WEBHOOK_URL"

# Com thread (agrupar mensagens no mesmo topico)
curl -s -X POST \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{"text":"Reply na thread", "thread":{"threadKey":"meu-topico-123"}}' \
  "WEBHOOK_URL&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD"

# Com card (visual rico)
curl -s -X POST \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{
    "cards": [{
      "header": {"title": "Titulo", "subtitle": "Subtitulo"},
      "sections": [{
        "widgets": [{"textParagraph": {"text": "Conteudo"}}]
      }]
    }]
  }' \
  "WEBHOOK_URL"
```

### Formatacao Google Chat
- **Bold:** `*texto*`
- **Italic:** `_texto_`
- **Strikethrough:** `~texto~`
- **Code:** `` `codigo` ``
- **Link:** `<url|texto>`
- **Mention:** `<users/USER_ID>`
- **Newline:** `\n`

### Futuro: Full API (leitura + escrita)
O Hub ja tem OAuth2 pro Google (Calendar/Gmail) em `src/lib/google.ts`.
Para integrar Google Chat full (ler mensagens, listar spaces):
1. Habilitar Chat API no GCP Console
2. Adicionar scope `chat.messages` no OAuth2 flow
3. Usar `google.chat({ version: 'v1', auth: oAuth2Client })`
4. Package: `@googleapis/chat` (oficial)

---

## Workflow de Comunicacao

### 1. Juan pede pra comunicar algo

```
Juan: "manda um resumo das mudancas pro time no whats"
```

### 2. Compor a mensagem
- Usar formatacao WhatsApp: `*bold*`, `_italic_`, emojis
- Estrutura: header com emoji → bullet points → link se relevante → contexto breve
- Tom: direto, profissional mas casual
- Idioma: Portugues BR (padrao) ou Ingles se for pro Mohamed/Penguin

### 3. Resolver destinatario
- Interpretar do contexto (ver tabela de aliases)
- Se ambiguo, perguntar antes de enviar
- Se Juan nao especificar, default: enviar pra ele mesmo (`554198769389@s.whatsapp.net`)

### 4. Enviar

```bash
# WhatsApp
wacli send text --to "JID_AQUI" --message 'mensagem aqui'

# Google Chat (se configurado)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"text":"mensagem aqui"}' "WEBHOOK_URL"
```

### 5. Confirmar
- Mostrar ao Juan que a mensagem foi enviada
- Se falhar, mostrar o erro e sugerir diagnostico (`wacli doctor`)

---

## Leitura e Busca

### Ler mensagens recentes de um chat
```bash
wacli messages list --chat "JID" --limit 20
```

### Buscar mensagens por texto (FTS5)
```bash
wacli messages search "termo de busca" --limit 20
```

### Ver contexto de uma mensagem
```bash
wacli messages context MESSAGE_ID
```

### Listar chats recentes
```bash
wacli chats list --limit 30
```

---

## Regras

1. **Nunca enviar sem compor primeiro** — sempre mostrar a mensagem pro Juan antes de enviar, EXCETO se ele explicitamente disser "manda direto" ou ja passou a mensagem pronta
2. **Escapar aspas** — usar single quotes no --message ou escapar double quotes
3. **Mensagens longas** — WhatsApp suporta ate ~65k chars, mas manter conciso (max 500 palavras)
4. **Arquivos** — usar `wacli send file` para imagens, PDFs, etc
5. **Horario comercial** — se for mensagem profissional, considerar horario (09-18 SP)
6. **Privacidade** — nunca enviar dados sensiveis (senhas, tokens, keys) via mensagem
7. **Google Chat** — so funciona se webhook estiver configurado. Se nao tiver, avisar e dar instrucoes
8. **Multi-canal** — se Juan pedir "manda em todos os canais", enviar no WhatsApp E Google Chat
9. **Idioma** — PT-BR por padrao. Ingles quando destinatario for estrangeiro (Mohamed, Paolo)
10. **Se wacli falhar** — rodar `wacli doctor`, verificar auth, tentar sync se necessario
