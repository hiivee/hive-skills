---
name: beeper
description: >
  Acessa WhatsApp, Telegram, iMessage, Signal, Messenger, Instagram, LinkedIn, Discord, Slack
  e outros via Beeper Desktop API (http://localhost:23373). Ativa SEMPRE que Juan pedir pra
  ler, buscar, baixar ou enviar mensagem de WhatsApp, Beeper, grupo de WhatsApp, áudio de
  WhatsApp, mídia de WhatsApp, ou qualquer plataforma unificada pelo Beeper. Também ativa
  pra "acessa meu WhatsApp", "pega as mensagens", "baixa o áudio", "lê o grupo X",
  "transcreve esse áudio do WhatsApp", "manda mensagem no Beeper". Sempre usar esta skill
  antes de qualquer tentativa com wacli ou outras ferramentas de WhatsApp.
user-invocable: true
allowed-tools: Bash(curl:*, open:*, python3:*, whisper:*, ffmpeg:*, jq:*, ls:*, cat:*, chmod:*, mkdir:*, bash:*)
layer: hive
---

# Beeper Desktop API — WhatsApp + Telegram + iMessage + tudo

Skill para ler, baixar mídia e enviar mensagens via **Beeper Desktop**, que unifica
WhatsApp, Telegram, iMessage, Signal, Messenger, Instagram, LinkedIn, Discord, Slack, etc.
Mais confiável que `wacli` porque usa o Beeper nativo (protocolo sempre atualizado).

## Setup (1x — já feito)

- Beeper Desktop 4.1.169+ instalado em `/Applications/Beeper Desktop.app`
- API local rodando em `http://localhost:23373` (se não estiver, a skill abre o app)
- Client OAuth2 registrado e config em `~/.beeper-cli/config.json`
- Helper bash em `~/.claude/skills/beeper/scripts/beeper-auth.sh`

## Como usar (SEMPRE começar por aqui)

```bash
# Carregar helper (faz auto-open + auto-refresh de token)
source ~/.claude/skills/beeper/scripts/beeper-auth.sh

# Obter token válido (abre Beeper se fechado, renova se expirado)
TOKEN=$(beeper_token)

# OU chamar a API diretamente com o wrapper
beeper_api GET "/v1/chats/search?query=Lideran&limit=5"
beeper_api GET "/v1/chats/\!xxxxx:beeper.local/messages?limit=100"
beeper_api POST "/v1/chats/\!xxxxx:beeper.local/messages" '{"text":"oi"}'

# Baixar mídia (áudio, imagem, vídeo, doc) pelo srcURL do attachment
beeper_download "mxc://local.beeper.com/xxxx?encryptedFileInfoJSON=..." /tmp/out.ogg
```

## API Endpoints Essenciais

Base: `http://localhost:23373/v1` — auth: `Authorization: Bearer <token>`

| Método | Path | O que faz |
|--------|------|-----------|
| GET | `/v1/info` | Info do servidor (sem auth) |
| GET | `/v1/accounts` | Lista contas conectadas (whatsapp, telegram, etc) |
| GET | `/v1/chats?limit=N` | Lista chats recentes |
| GET | `/v1/chats/search?query=X&limit=N` | Busca chat por título/participante |
| GET | `/v1/chats/{chatID}` | Detalhes de um chat |
| GET | `/v1/chats/{chatID}/messages?limit=100&cursor=<sortKey>&direction=before` | Mensagens (paginada) |
| POST | `/v1/chats/{chatID}/messages` | Envia mensagem (body: `{"text":"..."}`) |
| PUT | `/v1/chats/{chatID}/messages/{messageID}` | Edita mensagem |
| POST | `/v1/chats/{chatID}/messages/{messageID}/reactions` | Reage |
| GET | `/v1/messages/search?query=X&limit=N` | Busca global por texto |
| GET | `/v1/search?query=X` | Busca combinada (chats+mensagens) |
| POST | `/v1/chats` | Cria novo chat |
| POST | `/v1/chats/{chatID}/archive` | Arquiva chat |
| GET | `/v1/assets/serve?url=<mxc...>` | **Baixa mídia** — passa srcURL do attachment URL-encoded |
| POST | `/v1/assets/upload` | Upload de mídia pra enviar |

## Padrão de Paginação

Messages vem em blocos de 20-100, ordem DESC (mais recente primeiro). Para voltar no tempo:

```bash
# 1ª página
beeper_api GET "/v1/chats/$CHAT/messages?limit=100" > /tmp/p1.json

# pegar sortKey da última mensagem (a mais antiga da página)
CURSOR=$(python3 -c "import json; d=json.load(open('/tmp/p1.json')); print(d['items'][-1]['sortKey'])")

# próxima página (mais antigas)
beeper_api GET "/v1/chats/$CHAT/messages?limit=100&cursor=$CURSOR&direction=before" > /tmp/p2.json
```

Loop até `hasMore == false` ou até achar a data desejada.

## Estrutura de Mensagem

```json
{
  "id": "99891",
  "chatID": "!yxr0sf3LWo0werEzhkML:beeper.local",
  "accountID": "whatsapp",
  "senderID": "@whatsapp_lid-xxx:beeper.local",
  "senderName": "Diogo Rodrigues",
  "timestamp": "2026-04-07T20:24:57.000Z",
  "sortKey": "99891",
  "type": "TEXT | VOICE | IMAGE | VIDEO | FILE | REACTION",
  "text": "...",
  "isSender": false,
  "isUnread": false,
  "attachments": [
    {
      "id": "mxc://...",
      "type": "audio | image | video | file",
      "mimeType": "audio/ogg; codecs=opus",
      "fileName": "Voice message.ogg",
      "fileSize": 109016,
      "isVoiceNote": true,
      "srcURL": "mxc://local.beeper.com/xxx?encryptedFileInfoJSON=..."
    }
  ]
}
```

**Importante:** o `srcURL` tem query string `?encryptedFileInfoJSON=...` — precisa URL-encode o
srcURL inteiro (já feito no `beeper_download`). Passar direto pro `/v1/assets/serve?url=<enc>`.

## Fluxos Padrão

### 1. Buscar grupo e ler mensagens recentes

```bash
source ~/.claude/skills/beeper/scripts/beeper-auth.sh
beeper_api GET "/v1/chats/search?query=Lideranças&limit=5" | python3 -m json.tool
# copiar o chatID da resposta
beeper_api GET "/v1/chats/\!yxr0sf3LWo0werEzhkML:beeper.local/messages?limit=50" > /tmp/msgs.json
```

### 2. Baixar áudio e transcrever

```bash
# 1. encontrar mensagem VOICE
python3 -c "
import json
d=json.load(open('/tmp/msgs.json'))
for m in d['items']:
    if m.get('type')=='VOICE':
        print(m['id'], m['timestamp'], m['attachments'][0]['srcURL'])
"

# 2. baixar
beeper_download "<srcURL_da_saida_acima>" /tmp/audio.ogg

# 3. transcrever
whisper /tmp/audio.ogg --model base --language pt --output_format txt --output_dir /tmp
cat /tmp/audio.txt
```

### 3. Enviar mensagem

```bash
beeper_api POST "/v1/chats/\!xxxxx:beeper.local/messages" '{"text":"Mensagem aqui"}'
```

### 4. Baixar toda uma conversa (histórico)

```bash
CHAT="!xxxxx:beeper.local"
CURSOR=""
PAGE=1
while true; do
  if [ -z "$CURSOR" ]; then
    beeper_api GET "/v1/chats/$CHAT/messages?limit=100" > /tmp/hist-$PAGE.json
  else
    beeper_api GET "/v1/chats/$CHAT/messages?limit=100&cursor=$CURSOR&direction=before" > /tmp/hist-$PAGE.json
  fi
  HAS_MORE=$(python3 -c "import json; print(json.load(open('/tmp/hist-$PAGE.json'))['hasMore'])")
  if [ "$HAS_MORE" != "True" ]; then break; fi
  CURSOR=$(python3 -c "import json; d=json.load(open('/tmp/hist-$PAGE.json')); print(d['items'][-1]['sortKey'])")
  PAGE=$((PAGE+1))
done
```

## Diretório de Chats Conhecidos

Quando achar um chat novo relevante, adicionar aqui pra uso rápido:

| Nome | chatID | Plataforma | Contexto |
|------|--------|------------|----------|
| Lideranças (Dynamis) | `!yxr0sf3LWo0werEzhkML:beeper.local` | WhatsApp | Diogo+Bruno+Juan+Yuri+Vitória |

Pra descobrir outros, usar `/v1/chats/search?query=<nome>`.

## Quando `wacli` vs `beeper`?

**Sempre preferir Beeper** — mais confiável, sem protocol mismatch, cobre todas as plataformas.
Só usar `wacli` se:
- Beeper Desktop não estiver instalado
- User pedir explicitamente `wacli`

## Regras

1. **Auto-start Beeper Desktop** — o helper `_beeper_ensure_open` já faz isso; nunca pedir pro user abrir
2. **Auto-refresh de token** — se expirou, `beeper_token` renova sozinho via OAuth2 PKCE (pre-registered client)
3. **NUNCA perguntar credenciais** — tudo em `~/.beeper-cli/config.json`
4. **URL-encode srcURL** antes de passar pro `/v1/assets/serve` (já feito no wrapper)
5. **Timestamps em UTC** — converter pra horário local (BRT = UTC-3) ao mostrar pro user
6. **Ao enviar mensagens** — sempre confirmar com user antes, exceto se ele disser "manda direto"
7. **Buscar por título primeiro**, não ficar listando chats aleatoriamente
8. **Paginação** — se user pedir mensagem de X dias atrás, paginar até achar a data
9. **Privacidade** — nunca logar token; config.json chmod 600
10. **Erro 401 `Token expired`** — chamar `_beeper_mint_token` e retry uma vez

## Troubleshooting

| Erro | Causa | Fix |
|------|-------|-----|
| Connection refused porta 23373 | Beeper fechado | `open -a "Beeper Desktop"` |
| `Token expired` | Token de 24h venceu | `beeper_token` renova sozinho |
| `Invalid or missing token` | Config sumiu ou revogado | Apagar `~/.beeper-cli/config.json`, rodar `beeper_token` |
| `/oauth/authorize/callback` → `server_error` | 1ª tentativa cold | O helper já faz retry 3x |
| `hasMore=true` mas sem achar data | Precisa paginar mais | Loop até `hasMore=false` ou data desejada |
| Áudio baixado é 0 bytes | srcURL mal encodado | Usar `beeper_download`, não curl direto |

## Referências

- Spec completa: `curl -s http://localhost:23373/v1/spec | python3 -m json.tool`
- Docs oficiais: https://developers.beeper.com/desktop-api
- Helper: `~/.claude/skills/beeper/scripts/beeper-auth.sh`