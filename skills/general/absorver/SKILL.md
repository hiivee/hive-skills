---
name: absorver
description: Absorve novas tecnologias, repos, skills, hooks, MCPs, padrões — analisa o que pode entrar no sistema do Juan (CLAUDE.md, Hub, Steve OS, Cockpit, clientes, monetização) e documenta em docs/absorcoes/. Triggers — "absorve", "absorver", "absorva isso", "estuda esse repo", "o que dá pra agregar", "o que dá pra puxar", "absorção", "incrementa do que tem aqui", URL de GitHub repo, link de tutorial/post solto. Filosofia — Hub é meta-produto vivo, cada tecnologia foda vira parte do sistema. Multiplier mindset.
layer: hive
---

# /absorver — Absorção de tecnologia no sistema do Juan

Filosofia (CLAUDE.md global, seção "Hub — Meta-Produto Vivo"):
> "Tudo que é tecnologia nova que eu vejo no GitHub, no YouTube — eu pego, baixo, agrego no meu sistema. Cada um vai ter um sistema. É o novo aplicativo. (...) A gente está incrementando e vendendo, incrementando e vendendo." — Juan, 07/05/2026

`/absorver` é a porta canônica desse processo. Não é resumo de conteúdo — é mapeamento pra ação no sistema vivo.

---

## Quando ativar

- Juan diz: "absorve", "absorver", "absorva", "estuda esse repo", "o que dá pra agregar disso", "o que dá pra puxar daqui", "incrementa".
- Juan manda um link de GitHub repo, tutorial, post, vídeo, screenshot de tool.
- Juan compartilha uma ideia/tecnologia nova sem pedir explicitamente — **assumir absorção** se for material denso (repo, framework, MCP, skill set).

NÃO ativar se for:
- Pergunta rápida ("o que é X?") sem material denso atrás
- Bug fix, refactor local, conversa operacional
- Conteúdo já absorvido (checar `docs/absorcoes/` primeiro)

---

## Fluxo

### 1. Captura

Identifica o input:
- **GitHub repo** → `git clone --depth 1 <url> /tmp/<slug>`
- **URL solta** (post, doc) → ler com `mcp__jina-reader__*` se disponível, senão WebFetch
- **Repo local / pasta** → ler direto
- **Ideia descrita** → buscar referências, cristalizar

### 2. Exploração estruturada

Pra repo: explorar TODAS as pastas (não amostra rasa). Mapear:
- O que é o produto/projeto (1 frase)
- Stack
- Componentes do tipo: `agents/`, `commands/`, `skills/`, `hooks/`, `rules/`, `mcp-servers.json`, `settings.json`, `package.json`
- Sinais de qualidade: docs, testes, manutenção recente, padrões internos

### 3. Mapeamento → ativos do Juan

Pra **cada peça absorvível**, perguntar contra os 8 ativos:

| Ativo | Pergunta |
|---|---|
| **CLAUDE.md global** | Vira regra/princípio que muda como opero? |
| **Hub (juan-hub)** | Vira feature, página, painel, integração? |
| **Steve OS** | Vira capability do brain (L1/L2), distribuição, identidade-por-cliente? |
| **Empresa Cockpit** | Vira bloco, setor, ou template white-label? |
| **Cockpit pessoal** | Vira tmux session, thread, atalho? |
| **Skills/Commands/Hooks/Agents** (`~/.claude/`) | Instalar? Adaptar? Substitui algo existente? |
| **MCPs** | Adicionar? Vale o token cost? Substitui WebFetch/Grep? |
| **Cliente / Monetização** | Quem dos clientes ativos (Mathis · Austin · Jessica · Adriano · Jinx · Dynamis) ganha valor disso? Vira upsell Steve OS? Vira projeto novo? |

Pra cada match, classificar:
- **Camada** (1 = caixa rápido projeto · 2 = upsell Steve OS · 3 = plug-and-pay recurring)
- **Tier** (T1 = absorver agora · T2 = considerar · T3 = registrar e dormir · T4 = rejeitar com motivo)

### 4. Documentação — `docs/absorcoes/`

Criar arquivo: `/var/www/juan-hub/docs/absorcoes/YYYY-MM-DD-<slug>.md`

Atualizar índice: `/var/www/juan-hub/docs/absorcoes/README.md`

Template do arquivo da absorção: ver `references/template.md`.

Status flag (no frontmatter):
- 🔵 **IDENTIFIED** — Mapeado, não toquei nada ainda
- 🟡 **IMPLEMENTING** — Em execução agora
- ✅ **IMPLEMENTED** — Já tá vivo no sistema
- ⚪ **REJECTED** — Avaliado, não vale (motivo no doc)
- 🟠 **DEFERRED** — Boa, mas depende de bottleneck X primeiro

### 5. Output pro Juan (na conversa)

Sempre nessa ordem:

1. **TL;DR** (1 frase): "Repo X = Y. N peças absorvíveis."
2. **Tabela** das peças com Tier/Camada/Ação imediata
3. **Próximos 1-3 atos concretos** (não "considerar X" — "instalar Y agora", "adicionar Z no CLAUDE.md", "abrir task em docs/tasks/<slug>")
4. **Link** pro doc de absorção criado
5. **Multiplier question** (1-3, formato cofounder): qual peça destrava 10× downstream?

NÃO produzir parágrafos longos. Tabela + bullets. Visual.

---

## Anatomia do doc de absorção

```markdown
---
status: 🔵 IDENTIFIED
date: 2026-MM-DD
source: <url ou origem>
absorvedor: claude-opus-4-7
---

# <Nome> — Absorção

> 1 frase do que é + por que importa pra Juan.

## O que tem dentro

- Bullet do que o repo/tech entrega
- Stack
- Sinais de qualidade

## Mapa de absorção

| # | Peça | Tier | Camada $ | Ativo do Juan | Ação |
|---|---|---|---|---|---|
| 1 | ... | T1 | C1 | CLAUDE.md | adicionar regra X |
| 2 | ... | T1 | C2 | Steve OS | instalar hook Y |
| 3 | ... | T2 | — | MCPs | considerar adicionar |
| 4 | ... | T4 | — | — | rejeitar (motivo) |

## Implementação

### Pra fazer agora (T1)
- [ ] Ato 1 com path/comando concreto
- [ ] Ato 2

### Backlog (T2)
- [ ] ...

### Rejeitado (T4)
- ❌ X — motivo

## Multiplier
- O que isso destrava 10×: ...
- Trade-off: ...
- Próxima decisão: ...

## Histórico
- YYYY-MM-DD: criado, status IDENTIFIED
```

---

## Regras inegociáveis

1. **NUNCA** absorver sem documentar — se Juan disser "absorve" e eu não criar o doc em `docs/absorcoes/`, falhei.
2. **SEMPRE** mapear contra os 3 níveis de monetização — caixa rápido, upsell Steve OS, plug-and-pay. Toda absorção tem que ter linha de $.
3. **Tier 1 = ato hoje**. Não criar T1 sem ação executável imediata (path, comando, edit concreto).
4. **Repo grande**: explorar COMPLETO (todas as pastas) — regra do CLAUDE.md global.
5. **Conflito com algo existente**: chamar fora. Ex: "claude-forge tem `continuous-learning-v2`, Juan já tem — não duplicar, comparar versões e escolher".
6. **Cliente match**: sempre que uma peça serve cliente específico, nomear o cliente. "Vira upsell Mathis", não "vira upsell pra clientes".
7. **Output visual**: tabela > parágrafo. Sempre.

---

## Referências

- `references/template.md` — template do doc de absorção
- `/var/www/juan-hub/docs/absorcoes/README.md` — índice vivo das absorções
- CLAUDE.md global, seção "Filosofia do Hub — Meta-Produto Vivo"
- CLAUDE.md global, seção "Modelo de Negócio (3 camadas)"