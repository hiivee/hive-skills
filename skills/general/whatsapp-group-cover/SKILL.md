---
name: whatsapp-group-cover
description: Gera imagem 1080x1080 pra capa de grupo de WhatsApp com logo do cliente em cima e logo da Hive Technology embaixo, fundo preto. Use sempre que o Juan pedir "capa de grupo WhatsApp", "imagem pra grupo com cliente", "cover do grupo Hive + [cliente]", ou qualquer variacao (criar/gerar/fazer capa pra grupo WA do cliente X). Usado no inicio do processo de vendas da Hive, antes de mandar proposta, pra abrir grupo de diagnostico com o cliente.
layer: hive
---

# WhatsApp Group Cover — Hive × Cliente

Gera PNG 1080x1080 com:
- **Metade de cima:** logo do cliente (centralizado)
- **Metade de baixo:** logo da Hive Technology (centralizado)
- **Fundo preto** (`#000`)

## Quando usar

O Juan abre grupo de WhatsApp com o cliente logo no comeco do processo de vendas — antes da proposta, pra alinhar reunioes de diagnostico. A capa do grupo sinaliza a parceria Hive × Cliente. Esta skill gera essa capa.

## Inputs necessarios

1. **Nome do cliente** (ex: `"Vlad Halus"`, `"RG Maquinas"`)
2. **Logo do cliente** — ou caminho local (`.png`, `.svg`, `.jpg`) ou URL publica (site do cliente, favicon, etc)

Se o Juan nao passar um dos dois, perguntar antes de rodar. Nao inventar.

## Como executar

```bash
node /Users/juan/.claude/skills/whatsapp-group-cover/render.mjs \
  --client "Nome do Cliente" \
  --logo "<path-ou-URL>"
```

Opcionais:
- `--output <path>` — caminho custom do PNG (default: `/Users/juan/code/juan/reports-hub/public/wa-covers/<slug>/cover.png`)
- `--slug <slug>` — slug custom (default: kebab-case do `--client`)
- `--keep-html` — mantem o HTML intermediario pra debugar

## O que o script faz

1. Baixa o logo do cliente se for URL, ou le do disco
2. Inlina no template HTML (`assets/template.html`) — SVG inline, raster vira data URL base64
3. Inlina o logo da Hive (`assets/hive-logo.svg`) na metade de baixo
4. Abre no Playwright headless (1080x1080), tira screenshot PNG
5. Salva em `public/wa-covers/<slug>/cover.png` no reports-hub

Dependencia: usa o `playwright` instalado em `/Users/juan/code/juan/reports-hub/node_modules`. Se der erro dizendo que nao encontrou, rodar `cd /Users/juan/code/juan/reports-hub && npm install` antes.

## Output

O script imprime JSON com:
- `output` — caminho absoluto do PNG gerado
- `publicUrl` — URL publica se servido via hub (ex: `https://hub.juancarlo.com.br/wa-covers/vlad-halus/cover.png`)
- `slug` — slug usado

**Reportar ao Juan:** o caminho local (pra ele arrastar pro WhatsApp) e, se quiser compartilhar link, a URL publica.

## Exemplos

**Com logo local:**
```bash
node /Users/juan/.claude/skills/whatsapp-group-cover/render.mjs \
  --client "RG Maquinas" \
  --logo /Users/juan/Downloads/rg-logo.png
```

**Com logo via URL:**
```bash
node /Users/juan/.claude/skills/whatsapp-group-cover/render.mjs \
  --client "Vlad Halus" \
  --logo "https://vladhalus.com.br/logo.svg"
```

**Output custom:**
```bash
node /Users/juan/.claude/skills/whatsapp-group-cover/render.mjs \
  --client "Cliente X" \
  --logo /path/logo.png \
  --output ~/Desktop/capa.png
```

## Notas de design

- Fundo preto puro `#000` — Juan pediu explicitamente
- Cliente em cima = hierarquia (nunca parecer que a Hive e maior que o cliente), alinhado com a regra global do Juan pra propostas
- Divisor sutil (`#1f1f1f`, 1px) entre os dois lados — basicamente invisivel, so pra separar se os logos tiverem muito espaco em branco. Se o Juan pedir "sem divisor", editar o `assets/template.html` e remover o `<div class="divider">`
- Logo do cliente tem box de `720x360px` com `object-fit: contain` — funciona pra logos wide, tall, ou quadrados
- Logo da Hive tem `width: 560px` (aspect ratio 316:39 preservado, ~69px de altura)

## Se o resultado ficar ruim

Problemas comuns e como resolver:

- **Logo do cliente muito pequeno/grande:** ajustar `max-width`/`max-height` no CSS do `.client` em `assets/template.html`
- **Logo do cliente com cor escura em fundo preto (invisivel):** pedir ao Juan uma versao branca/light do logo, ou aplicar filtro `filter: invert(1) brightness(2)` na regra `.client img, .client svg` no template (so se o logo for monocromatico)
- **Logo do cliente sobre fundo branco (quadrado branco no PNG):** normal pra PNGs que nao tem transparencia. Ou pedir logo com fundo transparente, ou aceitar o quadrado branco sobre o preto
- **Skill falha a carregar playwright:** rodar `cd /Users/juan/code/juan/reports-hub && npm install`
