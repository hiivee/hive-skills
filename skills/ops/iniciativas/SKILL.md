---
name: iniciativas
description: Triagem on-demand de iniciativas e ideias do Juan. Lê docs/tasks/*/README.md + docs/BACKLOG.md + git log de cada repo, classifica por status (bloqueadas, NEXT paradas, PLANNED esquecidas, backlog maduro) e sugere próxima ação. Ativa quando Juan pedir "iniciativas", "o que tá parado", "triagem", "o que eu devo retomar", "como tão meus projetos", "radar de projetos", ou quando rodar /iniciativas.
layer: hive
---

# Iniciativas — Triagem On-Demand

Mostra o estado real das iniciativas do Juan — o que tá parado, o que tá bloqueado, o que tá maduro pra promover do backlog, o que tá saudável. Sem automação, sem cron: só roda quando ele pede.

## Quando usar

- Juan rodou `/iniciativas` explicitamente
- Juan perguntou "o que tá parado?", "meus projetos?", "radar", "como tão minhas iniciativas?"
- Juan falou "me ajuda a organizar os projetos" ou equivalente
- Início de semana ou sessão de planejamento

## Quando NÃO usar

- Pra tarefas táticas do dia (isso é `/status-rapido` ou `/hub-status`)
- Pra finanças ou operações do Hub (isso é `/hub-status`)
- Pra capturar ideia nova (só append em `docs/BACKLOG.md` diretamente)

## Detecção de contexto

Primeiro, detecta onde está sendo invocado:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
PWD_PATH=$(pwd)
```

**Modo REPO** — se `$REPO_ROOT` não vazio:
- Varre só o repo atual: `docs/tasks/*/README.md` + `docs/BACKLOG.md`

**Modo WORKSPACE** — se `$PWD_PATH` for `~/code/juan` ou subpasta sem git:
- Lê `~/code/juan/CONTEXT.md` → lista de repos
- Itera cada repo ativo (🟢 ou 🟡) e varre seu `docs/tasks/` + `docs/BACKLOG.md`

Se ambíguo, perguntar: "Quer triagem só deste repo ou cross-workspace?"

## Varredura

Pra cada repo:

1. **Tasks ativas** — `find docs/tasks -name README.md -type f`
   - Extrair status da tabela de fases (✅ DONE · 🟡 NEXT · ⏳ PLANNED · 🔴 BLOCKED)
   - Extrair título (primeira `# ...`)
   - Última atividade: `git log -1 --format=%ar docs/tasks/<slug>/`

2. **Backlog** — `cat docs/BACKLOG.md` se existir
   - Ideias que NÃO têm `→ #promoted`
   - Data de quando foi adicionada

3. **Cross-ref (opcional, só se fizer sentido)** — mencionar se o slug aparece em `git log --all --oneline | grep <slug>` (indica que tá sendo trabalhado embutido sem ter README atualizado)

## Classificação

Produzir estas categorias, nessa ordem:

### 🔴 BLOQUEADAS (ação: destravar)
Tasks com status 🔴 BLOCKED em qualquer fase. Listar + motivo + próxima ação pra destravar.

### 🟡 NEXT paradas > 7 dias (ação: retomar ou arquivar)
Tasks com fase marcada 🟡 NEXT mas `git log` mostra > 7 dias de inatividade.

### ⏳ PLANNED sem movimento > 21 dias (ação: promover ou arquivar)
Tasks com fase ⏳ PLANNED mas README não foi atualizado há mais de 3 semanas. Candidato a "deveria virar NEXT agora ou morrer".

### 💡 BACKLOG maduro (ação: promover pra task)
Entradas em `BACKLOG.md` que têm > 14 dias E/OU foram mencionadas em commits sem virar task formal (`git log --all --grep <palavra>`). Candidato a promover pra `docs/tasks/<slug>/`.

### ✅ SAUDÁVEIS
Tasks com 🟡 NEXT e atividade nos últimos 7 dias. Só lista nome + data, sem comentário.

## Formato de output

```
📍 reports-hub (N iniciativas · M ideias no backlog)

🔴 BLOQUEADAS
• <task-slug> — <motivo do bloqueio> (parada há <X dias>)
  → próxima ação: <sugestão>

🟡 NEXT paradas
• <task-slug> — <fase NEXT> parada há <X dias>
  → próxima ação: <sugestão>

⏳ PLANNED esquecidas
• <task-slug> — criada há <X dias>, zero movimento
  → promover pra NEXT, arquivar, ou manter?

💡 BACKLOG maduro
• <ideia> — <X dias> no parking lot
  → promover pra docs/tasks/<slug>/ ou deixar?

✅ SAUDÁVEIS (<N>)
• <task> (<última atividade>)
• ...

---
🎯 Recomendação do dia:
<1-2 frases curtas apontando QUAL retomar/arquivar AGORA>
```

Se em modo WORKSPACE, repetir o bloco acima pra cada repo, e adicionar resumo cross-repo no final:

```
📊 CROSS-WORKSPACE

Total: X iniciativas ativas, Y bloqueadas, Z ideias maduras no backlog
Mais parado: <repo> (<última atividade>)
Mais ativo: <repo> (<última atividade>)

🎯 Foco sugerido esta semana: <repo> — retomar <task>
```

## Tom

- Direto, 1ª pessoa plural ("nossa", "vamos"), sem enrolação
- Não julgue ("tá parado há muito") — observe ("parada há 14 dias")
- Sugira ação concreta, nunca "precisamos priorizar" genérico
- Se tem muita coisa parada, não esconda — o valor é justamente mostrar a realidade

## Convenções que este skill respeita

- **Filesystem-first**: só lê `docs/tasks/*/README.md` e `docs/BACKLOG.md`. Não mexe em DB, não chama API.
- **Zero writes por default**: só leitura. Se Juan pedir "arquiva X" ou "promove Y do backlog", AÍ edita.
- **Não substitui** `/hub-status` (ops) nem `/status-rapido` (dia a dia).

## Limitações conhecidas (V1)

- Não cruza com Hub DB (projects/actions). V2 pode adicionar.
- Parse da tabela de fases é heurístico — se template diferir muito do `juan-palestrante/README.md`, pode perder info.
- CONTEXT.md é manual. V2 pode auto-gerar via `git log` scan.
