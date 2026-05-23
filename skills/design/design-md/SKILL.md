---
name: design-md
description: Modular themeable design system for every HTML document. Use whenever generating ANY human-facing HTML — reports, dashboards, proposals, visual explainers, client materials. Produces self-contained HTML built from a semantic component kit, themed by DESIGN.md, with an embedded live theme picker. Triggers — "gera HTML", "relatório visual", "report", "dashboard", "proposta", "documento visual", "página", any request to visualize a system/architecture/data, or when output is non-trivial and human-facing.
layer: l1
---

# design-md — HTML é o novo Markdown

Todo HTML humano-facing nasce **temável, self-contained, montado de componentes**. Não cospe HTML cru com cor hardcoded — monta do kit, veste com tema.

## Quando usar (regra de medium)

| Output | Formato |
|---|---|
| Humano-facing, não-trivial (report, arquitetura, dashboard, proposta, explicação de sistema) | **HTML via design-md** |
| Trivial (sim/não, 1 número, lista curta) | texto/markdown plano — não super-formatar |
| Agente→agente, versionamento, specs internas | markdown |

Lição Salesforce: não transformar resposta simples em UI. Match complexity to information.

## Como gerar um HTML temável

1. **Estrutura:** `<html data-theme="<tema>">`. Escolher o tema default via `ai-pick.md`.
2. **`<head>`:** inline o conteúdo de `dist/design-md.css` num `<style>`. Carrega contrato + kit + os 5 temas.
3. **Body:** montar com classes do kit (`.dm-*`) — NUNCA cor/fonte hardcoded, só `var(--dm-*)`.
4. **Picker:** antes de `</body>`, inline `picker.js` num `<script>`. Ele injeta o seletor no canto.
5. Self-contained: tudo inline, zero dep externa. Abre em qualquer lugar.

`bin/new-doc.mjs <slug>` scaffolda um HTML já montado.

## Contrato de CSS-vars (a espinha)

Todo tema implementa, todo componente só consome:

```
--dm-bg --dm-surface --dm-surface-2 --dm-line
--dm-ink --dm-ink-2 --dm-ink-3
--dm-accent --dm-accent-2 --dm-accent-soft --dm-on-accent
--dm-good --dm-warn --dm-bad
--dm-font-display --dm-font-body --dm-font-mono
--dm-radius --dm-shadow --dm-grad
```

## Kit de componentes (`kit/core.css`)

`.dm-doc .dm-wrap` · `.dm-eyebrow` · `.dm-h1/.dm-h2/.dm-h3` · `.dm-lead` · `.dm-card` · `.dm-banner`(`.ok/.warn/.bad`) · `.dm-harness` · `.dm-layer` · `.dm-grid`(`.g2/.g3`) · `.dm-table` · `.dm-pill` · `.dm-flow/.dm-step` · `.dm-pre` · `.dm-footer`

## Temas (`themes/<nome>/DESIGN.md`)

`white-editorial` `dark-hub` `brand-v4` `claude-warm` `linear-mono` · `_corpus/` = 71 specs de marca (referência).

Tema novo: `cp -r themes/_template themes/<nome>`, editar `DESIGN.md`, rodar `node compile.mjs`. Modular — sempre dá pra somar.

## Cliente

Mandar link `?theme=<tema>&lock=1` → cliente vê travado no tema escolhido, sem picker.

## Comandos

```
node compile.mjs            # DESIGN.md de todos os temas → dist/design-md.css
node compile.mjs <tema>     # recompila 1 tema
node bin/new-doc.mjs <slug> # scaffold de HTML temável
node bin/retrofit.mjs <f>   # injeta design-md num HTML existente
```

## Princípios

- Self-contained sempre. Zero dep externa.
- Cor/fonte só via `var(--dm-*)`. Hardcode = bug.
- Match complexity — trivial não vira HTML.
- DESIGN.md é a fonte. CSS é compilado.
