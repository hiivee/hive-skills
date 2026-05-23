---
layer: hive
---

# Generic Publisher Skill

Publica qualquer conteúdo HTML no servidor do Juan Hub.

## URL Final

```
https://hub.juancarlo.com.br/[tipo]-[nome]/
```

## Como Usar

```
/publish [tipo]-[nome] [path]
```

## Exemplos

```
/publish propostas-rg-maquinas
/public reports-vendas-abril
/public documentos-contrato-x
```

## Checklist Obrigatório (antes de publicar)

- [ ] Logo cliente em `assets/[nome]-logo.png` (maior, prominent)
- [ ] Logo Juan em `../../logo-juancarlo.svg` (menor, opacity 0.7, filter brightness)
- [ ] Verificar se logos estão renderizando no HTML
- [ ] Testar em mobile

## Estrutura de Arquivos

```
/public/[tipo]-[nome]/
├── index.html              (proposta principal)
├── apresentacao.html      (versão sem preço, pra call)
├── assets/
│   └── [nome]-logo.png  (logo do cliente)
└── _componentes/        (se precisar)
```

## Estrutura de Pastas

```
local: ~/code/juan/reports-hub/public/[tipo]-[nome]/
servidor: /var/www/juan-hub/public/[tipo]-[nome]/
URL: https://hub.juancarlo.com.br/[tipo]-[nome]/
```

## Tipos Suportados

- `propostas-` — Propostas comerciais
- `reports-` — Relatórios
- `documentos-` — Documentos
- `paginas-` — Páginas avulsas
- Qualquer outro tipo que você inventar

## Regras de Logos

1. **Logo cliente:** MAIOR, em `assets/[nome]-logo.png`, height ~44px
2. **Logo Juan:** MENOR, usar `../../logo-juancarlo.svg`, height ~22px, filter brightness(10), opacity 0.7
3. **Ordem:** Cliente &times; Juan (cliente vem primeiro)