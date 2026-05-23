---
name: carrossel-de-clientes
description: |
  ⭐ STAR SKILL — Pipeline white-label de carrosséis Instagram hiperrealistas para QUALQUER cliente. Nano Banana PRO (face ref real do cliente) + tipografia editorial on-brand renderizada via Playwright. Parametrizado por cliente via clients/<slug>/brand.json — billing isolado por chave Google do cliente. Multiplica o pipeline validado do carousel-juan pra Mathis, NF, Austin, e qualquer cliente novo.

  Triggers: "gera carrossel pro <cliente>", "carrossel de cliente", "post viral pro <cliente>", "/carrossel-de-clientes <cliente> <tema>", "novo cliente carrossel".
layer: hive
---

# /carrossel-de-clientes — Pipeline White-Label de Carrossel

> ⭐ **STAR SKILL** — núcleo de monetização. Mesmo pipeline, N clientes. Cada cliente = pasta `clients/<slug>/` com brand + faces + billing isolado. Filosofia Hub-as-meta-product: incremento e vendo.

Skill derivada do `carousel-juan` (validado 14/05/2026, aprovação "ACHEI MUITO FODA, SENSACIONAL"). Diferença: **genérica e parametrizada** — zero hardcode de marca, tudo vem de `clients/<slug>/brand.json`.

## Modelo de negócio (por que essa skill é estrela)

```
carousel-juan        →  pipeline pessoal Juan (intocada, referência de qualidade)
carrossel-de-clientes →  MESMO pipeline, white-label, 1 preset por cliente
                          ├ nf-digital-sales/   (Hugo · dark+neon · billing NF)
                          ├ mathis-kennington/  (Fraunces+ember · billing Mathis)
                          └ _template/          (cp -r pra cliente novo)
```

Cliente novo = `cp -r clients/_template clients/<slug>` + editar `brand.json` + dropar face refs + logo. Zero código novo. Plug-and-pay pattern.

## Stack técnica

| Camada | Tecnologia | Custo |
|---|---|---|
| **Heros** | Gemini `nano-banana-pro-preview` (image multi-ref) | ~$0.04-0.05 / imagem |
| **Composição** | HTML+CSS injetado com tokens do `brand.json` | grátis |
| **Render** | Playwright headless Chromium → PNG 1080×1350 @2x | grátis |
| **Total** | 6 slides | ~$0.30 / carrossel |

Billing roda na `google_api_key` dentro do `brand.json` do cliente — **consumo bate no cartão DELE**.

## Estrutura

```
~/.claude/skills/carrossel-de-clientes/
├ SKILL.md                       ← este doc
├ pipeline/
│   ├ gen_hero.sh                ← gera 1 hero via Nano Banana PRO (lê brand.json)
│   ├ render.mjs                 ← Playwright → 6 slides 1080×1350
│   └ template-base.html         ← layout HTML, tokens substituídos do brand.json
├ clients/
│   ├ _template/                 ← starter pra cliente novo
│   │   ├ brand.json             ← schema vazio comentado
│   │   ├ faces/                 ← face refs do protagonista
│   │   └ logos/                 ← logos do cliente
│   ├ nf-digital-sales/
│   │   ├ brand.json             ← NF: dark+magenta+cyan, voz "dono pra dono", Hugo
│   │   ├ faces/hugo-1.jpg
│   │   └ logos/nf-colorido.png · nf-branco.png · nf-preto.png
│   └ mathis-kennington/         ← (futuro: importar de carousel-mathis na VPS dele)
└ runs/
    └ <cliente>-<slug>/          ← output: heros/ + carousel.html + slides/
```

## brand.json — schema

```jsonc
{
  "client": "NF Digital Sales",
  "slug": "nf-digital-sales",
  "google_api_key": "AIza...",            // chave do CLIENTE — billing isolado
  "protagonist": { "name": "Hugo", "face_refs": ["faces/hugo-1.jpg"], "look": "..." },
  "tokens": {
    "canvas": "#0A0E14", "accent1": "#E5197F", "accent2": "#1BA7DD",
    "text": "#FFFFFF", "muted": "#9AA4B2"
  },
  "type": {
    "headline": { "family": "Archivo Black", "import": "...", "transform": "uppercase" },
    "kicker":   { "family": "Inter", "weight": 800 },
    "body":     { "family": "Inter", "weight": 500 }
  },
  "logo": "logos/nf-colorido.png",
  "voice": { "anchor": ["dono pra dono", "respiramos food service 24/7"], "tone": "direto, agressivo-comercial, social proof pesado" },
  "categories": ["ESTRATÉGIAS", "DEPOIMENTOS", "DICA: PROCESSOS", "BLACK FRIDAY"]
}
```

## Pipeline (zero a renderizado)

```bash
cd ~/.claude/skills/carrossel-de-clientes
CLIENT=nf-digital-sales
SLUG=dono-que-nao-dorme

# 1. Escreve cenas (6 linhas: label|prompt-cena-SEM-texto) em runs/$CLIENT-$SLUG/scenes.txt
# 2. Gera 6 heros (lê google_api_key + face_refs do brand.json do cliente)
./pipeline/gen_hero.sh $CLIENT $SLUG

# 3. Monta runs/$CLIENT-$SLUG/carousel.html (copia template-base.html, injeta copy + tokens)
# 4. Renderiza
node pipeline/render.mjs $CLIENT $SLUG
# saída: runs/$CLIENT-$SLUG/slides/slide-01..06.png (1080×1350 @2x)
```

## Regras visuais inegociáveis (herdadas do carousel-juan)

1. **História contínua** — 6 frames de 1 filme, não 6 capas isoladas
2. **Hierarquia** — S1 + S6 peso máximo (cover), S2-S5 editorial reduzido
3. **1 imagem ÚNICA por slide** — nunca reaproveitar hero
4. **Hiper-realismo** — Nano Banana PRO + face ref HD real do protagonista, preservar rosto exato
5. **On-brand do CLIENTE** — tokens/fontes/voz SEMPRE do brand.json, nunca brand do Juan
6. **CTA slide final** — comment trigger ou ação clara, na voz do cliente
7. **Tipografia gigante mas legível** — headline 64-104pt
8. **Bottom 35-40% do hero mais escuro** — espaço pra overlay tipográfico
9. **Reportar custo** a cada batch (billing do cliente)
10. **Logo do cliente** discreto no rodapé + selo de categoria (padrão do feed dele)

## Cliente novo (plug-and-play)

```bash
cp -r clients/_template clients/<slug>
# editar clients/<slug>/brand.json (cores, fontes, voz, google_api_key DELE)
# dropar faces/<protagonista>.jpg + logos/<logo>.png
# pronto — pipeline descobre sozinho
```

## Histórico

- **2026-05-16** — skill criada. Derivada de carousel-juan. Primeiro preset: nf-digital-sales (Hugo). Validação: carrossel "O dono que não dorme".
