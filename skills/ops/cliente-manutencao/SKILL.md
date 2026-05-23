---
name: cliente-manutencao
description: Manutenção rotineira de VPS de cliente. Health check, deploy, restart, logs, updates, troubleshooting. Auto-discovers VPS info from docs/tasks/vps-setup/README.md no repo do cliente. Use quando Juan pedir "checar VPS do <cliente>", "atualizar pacotes do <cliente>", "deployar <cliente>", "logs do <cliente>", ou trabalhar em qualquer pasta de cliente em ~/code/clientes/.
layer: hive
---

# Cliente Manutenção — VPS Operacional

Skill pra dar manutenção em VPS de cliente do Juan. Cada cliente tem repo em `~/code/clientes/<cliente>/` com `docs/tasks/vps-setup/README.md` documentando infra. Esta skill lê esse README pra descobrir IP, alias SSH, stack, e dispara operações comuns.

## Quando usar

Trigger phrases:
- "checa VPS do <cliente>" / "tá tudo ok no <cliente>?"
- "atualiza pacotes do <cliente>"
- "deploy do <cliente>" / "subir <cliente>"
- "logs do <cliente>" / "o que tá acontecendo no <cliente>"
- "restart <cliente>" / "<app> tá fora"
- Trabalhando dentro de `~/code/clientes/<cliente>/`

## Passo 1 — Auto-discovery do contexto

Antes de qualquer operação, ler em ordem:

1. `~/code/clientes/<cliente>/CLAUDE.md` — instruções específicas do cliente
2. `~/code/clientes/<cliente>/docs/CONTEXT.md` — dashboard
3. `~/code/clientes/<cliente>/docs/tasks/vps-setup/README.md` — infra (IP, alias SSH, stack, plano DNS)

Se algum desses arquivos não existir, avisar Juan e oferecer criar baseado no template.

Extrair do README:
- SSH alias (ex: `mathis-vps`)
- Stack (Node version, PM2, Caddy, etc)
- Apps PM2 + portas
- Domains apontados pra VPS

## Passo 2 — Operações comuns

### Health check completo
```bash
ssh <alias> '
  echo "=== Uptime ==="; uptime
  echo "=== Disk ==="; df -h /
  echo "=== Memory ==="; free -h | head -3
  echo "=== Swap ==="; swapon --show
  echo "=== PM2 ==="; pm2 list
  echo "=== Services ==="; systemctl is-active caddy fail2ban ufw
  echo "=== Recent fails ==="; journalctl -u caddy -n 10 --no-pager 2>&1 | tail -10
'
```

### Atualizar pacotes (mensal)
**Confirmar com Juan antes** — pacotes podem requerer reboot.
```bash
ssh <alias> 'apt-get update && apt-get upgrade -y && apt-get autoremove -y'
ssh <alias> 'cat /var/run/reboot-required 2>/dev/null && echo "REBOOT REQUIRED" || echo "no reboot needed"'
```

### Deploy de app
Padrão (ajustar pelo stack do cliente):
```bash
ssh <alias> '
  cd /var/www/<app>
  git pull
  npm install
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
  pm2 restart <app>
'
```

### Restart de app específico
```bash
ssh <alias> 'pm2 restart <app>'
```

### Logs de app (últimas 100 linhas)
```bash
ssh <alias> 'pm2 logs <app> --lines 100 --nostream'
```

### Logs do Caddy (HTTPS / reverse proxy)
```bash
ssh <alias> 'journalctl -u caddy -n 100 --no-pager'
```

### Reload Caddyfile (após mudar config)
```bash
ssh <alias> 'caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy'
```

### Verificar DNS de domínio
```bash
dig +short <dominio>
# esperado: IP da VPS do cliente (do README)
```

### Verificar HTTPS
```bash
curl -I https://<dominio>
# esperado: HTTP/2 200 ou similar, certificate issuer "Let's Encrypt"
```

### Backup rápido (stateful apps)
TODO por cliente — definir no README específico se tem DB SQLite ou outros volumes.

## Passo 3 — Troubleshooting comum

| Sintoma | Diagnóstico |
|---|---|
| App fora do ar | `pm2 list` → status `errored`/`stopped` → `pm2 logs <app>` → restart |
| HTTPS quebrado | `journalctl -u caddy -n 50` → rate limit Let's Encrypt? DNS errado? Cert expirado? |
| 502 Bad Gateway | App caiu mas Caddy ok → restart app, checar porta no Caddyfile |
| 404 em domínio | DNS aponta certo (`dig`) mas Caddyfile não tem o domínio → adicionar bloco |
| Disco cheio (>90%) | `ncdu /` pra ver onde, limpar `/var/log/`, `npm cache clean --force`, PM2 logs antigos |
| RAM cheia | `pm2 restart all` recicla memória; checar memory leak no app |
| SSH não conecta | Pubkey corrompida ou IP mudou → recovery via painel do provider (VNC console) |

## Passo 4 — Após operação

Se operação foi não-trivial (deploy, atualização de pacotes, mudança de DNS, hardening):

1. Atualizar `~/code/clientes/<cliente>/docs/tasks/vps-setup/README.md` com data + ação
2. Atualizar `docs/CONTEXT.md` se mudou estado de algum domínio
3. Se descobriu padrão novo (gotcha do cliente, fix recorrente) → adicionar em **🆘 Quando algo quebra** do README

## Hard rules

1. **Nunca mexer em DNS de email** sem confirmação explícita do Juan + checklist + backup do estado atual. MX, SPF, DKIM, DMARC, *_domainkey, smtp/mail/imap CNAMEs → intocáveis.
2. **Nunca executar `apt upgrade -y` sem confirmar com Juan primeiro** — pode requerer reboot, pode quebrar.
3. **Nunca rodar `rm -rf` em `/var/www/` ou `/etc/`** — sempre listar antes (`ls`), confirmar caminho.
4. **Nunca trocar credenciais sem atualizar README + Keychain + 1Password do Juan**.
5. **Nunca commitar passwords/keys** em repo de cliente. Refs em README, dados em Keychain/1Password.
6. **Sempre validar Caddyfile** (`caddy validate`) antes de reload — config inválida derruba TUDO.
7. **Sempre testar SSH key auth** após mudanças em sshd_config — se quebrar, painel do provider é o único acesso restante.

## Output esperado

Ao final de qualquer operação não-trivial, output em formato:

```
✅ <cliente> — <operação> — <data>

Estado:
- <serviço 1>: status
- <serviço 2>: status

Mudanças:
- <o que foi feito>

Próximo:
- <ação sugerida ou "nada">
```