---
name: steveos
description: >
  Atalho pro agente `steve-os-dev` — dev companion especializado no Steve OS.
  Ativa quando Juan disser "steveos", "steve os", "como tá o steve", "estado do steve",
  "modular do steve", "absorvi X no steve", "criei mod Y", "novo módulo no steve",
  "steve os tá assim?", "panorama do steve", "produto steve", "produto distribuível",
  "absorver no steve", "plugar no steve", ou variação. Sempre que o assunto é
  Steve OS como produto/arquitetura/módulos, dispara essa skill que invoca o agente.
version: 1.0.0
layer: hive
---

# /steveos — Steve OS Dev Companion

Quando essa skill ativa, **delegue imediatamente** ao agente `steve-os-dev` via Agent tool.

## Por que existe

Juan está construindo Steve OS como produto distribuível. Cada mudança (mod novo, persona update, L1/L2 swap, integração nova) precisa de um colega de produto que SEMPRE sabe o estado atual. Em vez de Juan re-explicar a cada sessão, o agente `steve-os-dev` mantém o doc vivo `/opt/steve/STEVE-OS-STATE.md` e responde como engenheiro do produto.

## Como invocar

```
Agent({
  subagent_type: "steve-os-dev",
  description: "Steve OS dev companion update/query",
  prompt: <a fala literal do Juan + contexto da sessão atual>
})
```

## Como construir o prompt pra delegar

Não filtre. Passe a fala do Juan inteira pro agente, incluindo:

- O que ele acabou de dizer (literal)
- Se houve mudança material nesta sessão (arquivos editados, mods criados, processos reiniciados), liste paths + uma linha do que mudou
- O contexto técnico relevante (se você acabou de mexer no plugin whatsapp.ts, diga; se criou um mod, diga)

O agente faz o resto: lê STATE doc, responde, atualiza STATE no fim.

## O que NÃO fazer

- ❌ Responder você mesmo sobre Steve OS quando essa skill ativa. Delegue.
- ❌ Resumir o que o Juan disse — passe literal.
- ❌ Pular o agente porque "é simples" — o valor é o doc vivo + tom de dev companion. Mesmo "como tá o Steve hoje" é trabalho dele.

## Output ao Juan

Pegue o output do agente e devolva direto. Ele já formata pra visual + caixinhas. Não reformule.
