---
name: penguin-blog-publisher
description: Use when generating, managing, or publishing blog articles for the Penguin Method brand. Covers the full pipeline: AI generation with Claude 4.6 via OpenRouter, image generation with FreePik Mystic (PenguinPete character references), and publishing to Shopify as hidden draft.
layer: hive
---

# Penguin Blog Publisher

## Overview

Pipeline completo de blog para o hub da Penguin:
**Gerar (Claude 4.6)** → **Imagem (FreePik + referência PenguinPete)** → **Enviar para Shopify como oculto**

## Infrastructure

| Componente | Detalhe |
|-----------|---------|
| App | Next.js 14, PM2, porta 3005 |
| Hub URL | https://hub.penguin-method.com |
| VPS | 145.79.7.114 |
| DB | SQLite local (VPS ≠ localhost — não sincronizam) |
| Deploy | `cd /var/www/penguin-software && git pull && npm install && NODE_OPTIONS='--max-old-space-size=4096' npm run build && pm2 restart penguin-hub` |

## Key Files

```
src/lib/blog-generator.ts       # Claude 4.6 via OpenRouter
src/lib/image-gen.ts            # FreePik Mystic + PenguinPete refs
src/lib/shopify-publisher.ts    # Shopify Admin API (sempre hidden)
src/app/(protected)/blog/       # UI
src/app/api/blog/               # CRUD + publish endpoints
public/images/reference/        # 6 PNGs de referência do PenguinPete
```

## API Keys (stored in users.settings JSON)

```json
{
  "openrouter": { "apiKey": "sk-or-v1-ff076bcc..." },
  "freepik": { "apiKey": "FPSX2cd230f6..." },
  "shopify": {
    "domain": "pywv3a-be.myshopify.com",
    "accessToken": "shpat_ce74cfbde...",
    "blogId": "103334641921"
  }
}
```

Configurar no VPS via node:
```bash
ssh root@145.79.7.114
cd /var/www/penguin-software
node -e "
const db = require('better-sqlite3')('penguin.db');
const user = db.prepare('SELECT * FROM users LIMIT 1').get();
const settings = JSON.parse(user.settings);
settings.shopify = { domain: '...', accessToken: '...', blogId: '...' };
db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(JSON.stringify(settings), user.id);
console.log('OK');
"
```

## Shopify Blogs Available

| Blog | ID |
|------|----|
| AI Companion | 103460471041 |
| Anxiety & Mental Health | 103334641921 |
| Anxiety & Sleep | 103440777473 |
| Holistic Healing | 103419281665 |
| TMS Therapy | 103402176769 |

## Blog Status Flow

```
draft → [usuário clica Enviar] → review (Shopify hidden) → [aprovação manual no Shopify] → published
```

**REGRA CRÍTICA:** Artigos são SEMPRE enviados como `published: false` para o Shopify. Nunca publicar como visível. Mohamed/time aprova manualmente.

## Image Generation (FreePik Mystic)

```
POST https://api.freepik.com/v1/ai/mystic
GET  https://api.freepik.com/v1/ai/mystic/{taskId}  ← polling
```

**PenguinPete refs** — 3 imagens de referência em `strength: 0.85`:
```
hub.penguin-method.com/images/reference/freepik__a-highquality-3d-render-of-cute-cartoon-penguin-pe__73921.png
hub.penguin-method.com/images/reference/freepik__a-full-scene-3d-render-of-a-cute-animated-penguin-__73918.png
hub.penguin-method.com/images/reference/freepik__wide-environmental-shot-of-penguinpete-adorable-fl__73920.png
```

Aspect ratios válidos: `social_post_4_5`, `widescreen_16_9` (NÃO `landscape_16_9`)

## Blog HTML Structure (Penguin Style)

```html
<article class="blog-article">
  <p>Hook emocional de 1-2 frases.</p>
  <p>Intro contextualizando o problema...</p>

  <h2>Título da Seção</h2>
  <p>Conteúdo...</p>
  <ul><li>Item com insight</li></ul>
  <blockquote>Citação ou dado de pesquisa...</blockquote>

  <!-- Repetir 4-5 seções h2 -->

  <aside class="cta-inline">
    <h3>CTA Title</h3>
    <p>Texto persuasivo curto</p>
    <a href="https://penguin-method.com">Explore Now →</a>
  </aside>

  <h2>Conclusion</h2>
  <p>Fechamento com recapitulação e call-to-action.</p>
</article>
```

## API Endpoints

```
GET    /api/blog                    # Listar artigos
POST   /api/blog                    # Criar artigo
PATCH  /api/blog/[id]               # Atualizar
DELETE /api/blog/[id]               # Deletar
POST   /api/blog/[id]/publish       # Enviar para Shopify (sempre hidden)
POST   /api/blog/generate           # Gerar com AI
POST   /api/blog/[id]/generate-image # Gerar imagem FreePik
```

## Regenerar Imagem para Artigo Existente

Via API:
```bash
curl -X POST https://hub.penguin-method.com/api/blog/1/generate-image \
  -H "Cookie: auth=..."
```

Ou via Node no VPS para artigos sem imagem:
```bash
node -e "
const r = await fetch('http://localhost:3005/api/blog/1/generate-image', {
  method: 'POST',
  headers: { cookie: 'auth=SEU_COOKIE' }
});
console.log(await r.json());
"
```

## Common Issues

| Problema | Causa | Fix |
|---------|-------|-----|
| Imagens não aparecem em localhost | SQLite não sincroniza (VPS ≠ local) | Ver em prod |
| FreePik aspect_ratio error | `landscape_16_9` não existe | Usar `widescreen_16_9` |
| 404 no hub | Nginx sites-enabled desatualizado | `cp sites-available/apps.conf sites-enabled/apps.conf && nginx -s reload` |
| Artigo publicado como visível | Bug crítico — checar published: false | Ambos route.ts e shopify-publisher.ts têm hardcoded `published: false` |
