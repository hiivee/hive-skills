---
name: painel-controle-projeto
description: Painel de controle vivo de projeto/produto do Juan. Cockpit denso, escaneável, no padrão brand v4.1, com 8 abas (Visão · Trabalho · Arquitetura · Decisões · Monetização · Integrações · Status · Materiais · Próximos). NÃO é landing — é sistema de controle. Toda ação no projeto atualiza o painel. Triggers — "painel de controle", "cockpit do <projeto>", "abre painel do X", "atualiza painel", "cria painel pra Y", "painel-controle-projeto".
when_to_use: Quando Juan pedir um painel/cockpit pra controlar lançamento ou estado vivo de produto/projeto. Ou quando algo muda materialmente num projeto que JÁ tem painel — atualiza o painel imediatamente sem ele pedir.
layer: hive
---

# Painel de Controle de Projeto — Skill

> **Filosofia.** Cada produto/projeto do Juan tem um painel HTML denso que serve como single-source-of-truth visual do estado de lançamento. Toda decisão, mudança, novo material vira atualização do painel. NÃO é landing.

## Quando ATIVAR esta skill (proativamente, sem Juan pedir)

1. **Decisão estratégica tomada** → atualizar aba "Decisões"
2. **Material novo gerado** (sketch, diagrama, landing page, doc) → atualizar aba "Materiais"
3. **Marco completado** (motor rodando, deploy, primeiro cliente) → mover de "Falta" pra "Pronto" + atualizar progress bar
4. **Mudança de pricing / monetização** → atualizar aba "Monetização"
5. **Bloqueador descoberto / resolvido** → atualizar aba "Status real"
6. **Nova fase planejada** → atualizar aba "Próximos passos"

## Onde os painéis vivem

```
/var/www/juan-hub/public/reports/<projeto>-cockpit/index.html
```

URL pública: `https://hub.juancarlo.com.br/reports/<projeto>-cockpit/`

**Referência canônica:** `/var/www/juan-hub/public/reports/steve-os-cockpit/index.html`
(criado 2026-05-08 — usar como template ao criar painel novo)

## Estrutura padrão (8 abas)

| Aba | Conteúdo |
|---|---|
| **Visão** | O que é em 1 frase + 6 pilares + 2 ICPs + promessa central |
| **Trabalho** | A decisão load-bearing — o que o produto FAZ no dia (3 opções com ROI) + 5 jobs concretos + modos de operação |
| **Arquitetura** | Fluxo visual (camadas) + Engine vs Soul + tabela "onde tá tudo" |
| **Decisões** | DO/DON'T — 10 cristalizadas vs 10 cortadas |
| **Monetização** | 3 planos lado-a-lado + projeção conservadora + regra de subida |
| **Integrações** | LLMs · canais · ferramentas · infra (cards densos) |
| **Status real** | PM2 ao vivo + ✅ Pronto + 🟡 Falta + 🔴 Bloqueio (checklists densos) |
| **Materiais** | Apps rodando + workflows HTML + sketches/gallery + docs canônicos |
| **Próximos passos** | 4 weeks blocks (cada com 5 itens) + critérios de pronto + perguntas em aberto |

## Padrão visual — brand v4.1 obrigatório

- Light theme (white #fff, ink #1d1d1f)
- Inter dominante, **Lora italic em accent words** (`<em>` em h1/h2 nas keywords)
- **Juan Infinity gradient** (`#B0FFDC → #BBF1FF → #60A5FA`) único accent
- Apple blue `#0071e3` só em links
- Grayscale 95% restraint
- JetBrains Mono em eyebrows uppercase 0.16em

## Padrão de densidade (NÃO landing)

- Hero 60px padding (não 140px), h1 24-32px (não 96px)
- Stats em strip inline (não cards 120px alto)
- Cards 18px padding (não 36px)
- Tabelas 9px padding por linha
- Tab click **NÃO** scrolla pro topo — mantém posição
- Sem footer pesado, sem fade animations

Ver: `~/.claude/projects/-root/memory/feedback_dashboards_dense_not_landing.md`

## Workflow ao criar painel novo

1. **Inventariar materiais** do projeto (`find` sketches, landings, diagramas, docs canônicos)
2. **Validar URLs** com `curl -sI` antes de colocar
3. **Copiar template** do steve-os-cockpit
4. **Adaptar** as 8 abas pro projeto específico
5. **Publicar** em `/var/www/juan-hub/public/reports/<projeto>-cockpit/index.html`
6. **Validar** `curl -sI https://hub.juancarlo.com.br/reports/<projeto>-cockpit/` retorna 200
7. **Entregar link clicável** ao Juan
8. **Salvar referência** no MEMORY do projeto: `project_<projeto>_cockpit.md`

## Workflow ao ATUALIZAR painel existente

1. Identificar a aba afetada (Decisões? Materiais? Status?)
2. Edit cirúrgico — só a section que mudou
3. Se mexeu em status de fase, atualizar **também** a progress bar `<div class="progress-fill" style="width:XX%">` no hero
4. Validar HTTP 200
5. Mencionar no chat: "atualizei aba X com Y"

## Painéis ativos (registry)

| Projeto | Painel | Criado |
|---|---|---|
| Steve OS | https://hub.juancarlo.com.br/reports/steve-os-cockpit/ | 2026-05-08 |
| _(adicionar conforme criar)_ | | |

## Anti-padrões

- ❌ Criar painel pra projeto trivial (regra: só vale a pena se tem 3+ frentes paralelas)
- ❌ Esquecer de atualizar quando algo muda — desatualizado vira ruído
- ❌ Adicionar abas que duplicam outras (cada aba tem job único)
- ❌ Hero gigante / padding generoso / animações landing-style
- ❌ Esquecer materiais — gallery de imagens é o que faz o painel parecer vivo
