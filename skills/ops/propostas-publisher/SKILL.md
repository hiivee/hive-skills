---
layer: hive
---

# Propostas Publisher Skill

Publica propostas comerciais no servidor do Juan Hub de forma automatizada.

## Como Usar

```
/propostas-publisher [cliente] [acao]
```

## Ações

- **publish** `[cliente]` `[path]` — Publica proposta no servidor
  - Exemplo: `/propostas-publisher publish rg-maquinas "/Users/juan/code/.../proposta.html"`

- **list** — Lista todas as propostas publicadas
- **preview** `[cliente]` — Visualiza a proposta no browser
- **delete** `[cliente]` — Remove uma proposta

## Fluxo Completo

1. Localizar o arquivo no computador local
2. Verificar qual versão é a mais recente (por data de modificação)
3. Criar pasta no servidor se necessário: `/var/www/juan-hub/public/propostas/[cliente]/`
4. Fazer upload do arquivo via scp
5. Retornar URL final

## Estrutura de Pastas

```
local: ~/code/juan/reports-hub/public/propostas/[cliente]/
servidor: /var/www/juan-hub/public/propostas/[cliente]/
URL: https://hub.juancarlo.com.br/propostas/[cliente]/
```

## Modelo de Proposta

O arquivo deve seguir o sistema de propostas em:
`~/code/juan/reports-hub/public/propostas/_componentes/PROPOSAL-SYSTEM.md`

Para criar uma proposta nova:
1. Ler o PROPOSAL-SYSTEM.md
2. Copiar o template base
3. Personalizar com logo/cores do cliente
4. Publicar via esta skill