---
name: carousel-juan
description: |
  Gera carrosséis Instagram virais hiperrealistas no estilo Juan Carlo / Hive Technology — Nano Banana PRO + Big Tech founders compostos via multi-ref + tipografia editorial Bricolage Grotesque + brand v4.1. Suporta vídeos via Veo 3.1 e publish via upload-post.com.
  
  Triggers: "carrossel pra IG", "post viral foda", "carrossel founder story", "gera reel", "publica no IG via Steve".
layer: hive
---

# /carousel-juan — Pipeline de Carrossel Viral

Skill validada 14/05/2026 via 4 iterações com Juan Carlo. Resultado final: carrossel "evidence story" (6 slides) com aprovação "ACHEI MUITO FODA, SENSACIONAL".

## Stack técnica

| Camada | Tecnologia | Custo aprox |
|---|---|---|
| **Imagens (heros)** | Gemini `nano-banana-pro-preview` API (multi-ref image) | $0.04-0.05 / imagem |
| **Vídeos (reels)** | Gemini `veo-3.1-generate-preview` (Standard) OR `veo-3.1-fast-generate-preview` (Fast) | $0.40/seg OR $0.15/seg |
| **Composição** | HTML+CSS · brand v4.1 (Bricolage Grotesque + Lora italic + Inter + JetBrains Mono) | gratuito |
| **Render** | Playwright headless Chromium → PNG 1080×1350 @ 2x | gratuito |
| **Publish** | upload-post.com API (IG/TikTok/X/LinkedIn/YouTube cross-poster) | $0 (sua key) |

**Total típico de 1 carrossel completo:** ~$0.30 (6 imagens Nano Banana)
**Total carrossel + 1 reel 8s Standard:** ~$3.50
**Total carrossel + 6 reels 8s Standard:** ~$20

## API keys necessárias (já em `~/.claude/api-keys.md`)

- `GEMINI_API_KEY` — Google AI Studio (cobre Nano Banana + Veo)
- `UPLOAD_POST_TOKEN` — JWT upload-post.com (username "juan", IG conectado @juanncarllo)

## Filosofia visual aprendida com Juan (regras inegociáveis)

1. **História contínua** — não 6 capas isoladas, é 1 filme em 6 frames
2. **Hierarquia visual** — S1 + SN cover (peso máximo), S2-S(N-1) editorial (peso reduzido)
3. **1 imagem ÚNICA por slide** — nunca reaproveitar
4. **Hiper-realismo** — Nano Banana PRO + foto real Juan HD + multi-ref Big Tech
5. **NUNCA mencionar nome de cliente** publicamente (Mathis/Austin/Jessica/etc) — confidencialidade
6. **Comment trigger CTA** sempre no slide final ("Comment STEVE/AGENT/X for breakdown")
7. **Tipografia GIGANTE** mas legível (Bricolage Grotesque 64-104pt + Lora italic accent)
8. **Brand v4.1** — mint #7DFFD4 + gold #FFE15C + dark canvas
9. **Twitter card overlay** opcional em S1 (juanncarllo verified)
10. **Brand strip rodapé**: @handle + PASSA PRO LADO mint CTA

## Arquivos do skill

```
~/.claude/skills/carousel-juan/
├ SKILL.md              ← este doc
├ prompts/
│   └ library.md        ← prompts validados por slide tipo
├ templates/
│   ├ carousel-evidence.html  ← layout HTML brand v4.1 referência
│   └ render.mjs              ← Playwright renderer
├ scripts/
│   ├ gen_hero.sh             ← gera 1 hero via Nano Banana PRO
│   ├ gen_hero_duo.sh         ← gera hero com 2 refs (Juan + Big Tech)
│   ├ gen_veo.py              ← gera vídeo 8s via Veo 3.1
│   └ publish.sh              ← posta via upload-post.com
└ refs/
    ├ juan-hero.png            ← foto Juan HD (preserva face)
    ├ sam_altman.jpg
    ├ elon_musk.jpg
    └ dario_amodei.jpg
```

## Pipeline padrão (de zero a publicado)

```bash
# 1. Define copy + cenas (markdown source-of-truth)
nano my-post-spec.md

# 2. Gera 6 heros em paralelo via Nano Banana PRO
./scripts/gen_hero.sh slide1 "scene description" my-post-spec.md
./scripts/gen_hero_duo.sh slide3 sam_altman.jpg "scene description"
# (3 minutos pra 6 imagens em paralelo)

# 3. Renderiza HTML+CSS overlays via Playwright
node templates/render.mjs my-post-spec.md
# (gera slides/slide-0[1-6].png 1080×1350 @ 2x)

# 4. Zipar + caption
zip -j post.zip slides/*.png
# manual: redigir caption + hashtags

# 5. Publicar via upload-post.com
./scripts/publish.sh post.zip "Caption text" instagram

# 6. (opcional) Gerar reels acompanhantes via Veo
./scripts/gen_veo.py heros/ev-1-hook.png "video prompt"
```

## upload-post.com API

```bash
TOK=$(grep "UPLOAD_POST" ~/.claude/api-keys.md | head -1 | awk -F'`' '{print $2}')

# Carousel IG (multiple photos)
curl -X POST -H "Authorization: Apikey $TOK" \
  -F "user=juan" \
  -F "title=Caption text + #hashtags" \
  -F "platform[]=instagram" \
  -F "photos[]=@slide-01.png" \
  -F "photos[]=@slide-02.png" \
  -F "photos[]=@slide-03.png" \
  -F "photos[]=@slide-04.png" \
  -F "photos[]=@slide-05.png" \
  -F "photos[]=@slide-06.png" \
  https://api.upload-post.com/api/upload_photos

# Reel (video)
curl -X POST -H "Authorization: Apikey $TOK" \
  -F "user=juan" \
  -F "title=Caption" \
  -F "platform[]=instagram" -F "platform[]=tiktok" \
  -F "video=@reel-24s.mp4" \
  https://api.upload-post.com/api/upload
```

**Schedule:** upload-post.com não suporta scheduled_at nativo. Para agendar, usar cron job na VPS:
```cron
0 11 * * * /root/.claude/skills/carousel-juan/scripts/publish.sh /var/www/juan-hub/public/carousels/v4-evidence-story/evidence-carousel.zip "..." instagram
```

## Veo 3.1 video generation

```python
# scripts/gen_veo.py
# Cinemático 8s vertical 9:16 com audio · $3.20 Standard / $1.20 Fast
# Image-to-video: passar hero PNG como first frame
# Suporta lastFrame param (transitions entre cenas) — preview only
```

## Capítulos narrativos validados (templates)

### Template "Evidence Story" (validado 14/05)
- S1 HOOK: "Essa semana meu agente fez X coisas que ninguém faz"
- S2 CASO 1 BUILD: ambiente premium + produto se construindo no ar
- S3 CASO 1 FAN-OUT: founder central + N contatos + ribbons mint/cyan
- S4 CASO 1 RESULT: BUILD COMPLETE + numbers
- S5 CASO 2 CONSENT: split frame server crisis + WhatsApp APPROVE
- S6 CTA: cliente premium + AGENT confirmation + comment trigger

### Template "Hero's Journey" (alternativo)
- S1 SETUP: founder origin (humble beginning)
- S2 BROKEN WORLD: pain point genérico audience
- S3 INCITING: Juan + Big Tech founder (Sam/Dario/Elon)
- S4 JOURNEY: Juan + Big Tech founder building together
- S5 RECEIPTS: numbers floating around Juan
- S6 INVITATION: close-up + extended hand + Anthropic asterisk + CTA

## Custos referência (Maio 2026)

| Output | Modelo | Custo |
|---|---|---|
| 1 hero image (Nano Banana PRO) | gemini-2.5-flash-image / nano-banana-pro-preview | $0.04 |
| 1 reel 8s Standard | veo-3.1-generate-preview | $3.20 |
| 1 reel 8s Fast | veo-3.1-fast-generate-preview | $1.20 |
| 1 reel 8s Light | veo-3.1-light-generate-preview | $0.40 |
| 1 carrossel completo (6 slides) | nano-banana-pro × 6 + render | ~$0.30 |
| 1 carrossel + 3 reels Standard | + Veo Standard × 3 | ~$10 |
| Publish via upload-post | post per platform | grátis (sua key) |

## Tom de copy aprendido

✅ Funciona:
- "BR founder. $0 raised. Closing US for $30k."
- "Eu estava chillando. O produto se construía no ar."
- "Built on Claude. Sold to founders who raised 100×."
- "Não é Notion. Não é Slack. É um agente Claude vivendo na sua VPS."

❌ Não funciona:
- "I sleep, the agent closes" (genérico, fraco)
- "2 anos atrás eu codava sozinho em Curitiba" (lógica do post não funciona)
- Menção literal de nome de cliente (confidencialidade)
- 8 slides (muito longo — 6 é o sweet spot)

## Lições aprendidas (correções do Juan)

1. **"Tá rabisco demais"** — sketches têm que ser CLEAN line art, não doodle infantil
2. **"Todos parecem capa"** — alternar peso visual cover ↔ editorial entre slides
3. **"Estranho, não é foda"** — primeira versão sempre vai estar — itere rápido com 3-4 variações
4. **"Não pode falar nome de cliente"** — NUNCA Mathis/Austin/Jessica publicamente
5. **"Cliente está bem nada a ver"** — gerar persona high-status premium (CEO 40-55, suit, premium office)
6. **"Não é hiper-realista"** — usar Nano Banana PRO (não Flash) + foto HD da pessoa
7. **"Likeness mais forte"** — Veo Standard (não Fast) + negativePrompt: "different face"
8. **"Conta uma história contínua"** — narrativa hero's journey ou caso real, não fragmentos
9. **"1 imagem POR slide"** — nunca reaproveitar entre slides
10. **"Sempre me fala o custo"** — reportar gasto API a cada batch

---

**Validado por Juan 14/05/2026 04:14 BRT:** "ACHEI MUITO FODA, SENSACIONAL!"
