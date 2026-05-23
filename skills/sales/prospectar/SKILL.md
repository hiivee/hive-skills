---
name: prospectar
description: Pipeline completo de prospecção B2B. Ativa quando pedir pra prospectar leads, enriquecer dados, gerar landing pages, ou disparar outreach via WhatsApp. Orquestra scraping + AI analysis + landing page + deploy + WhatsApp queue.
layer: hive
---

# Prospectar — Pipeline B2B de Prospecção

Pipeline end-to-end para prospectar leads B2B via Google Places → enriquecer com IA → gerar proposta personalizada → enviar via WhatsApp.

## Quando Ativar

- "prospecta leads de [nicho] em [cidade]"
- "enriquece os leads pendentes"
- "gera as landing pages"
- "dispara o outreach"
- "prospecção completa"
- "/prospectar [ação]"

## Pipeline

```
STEP 1: Enriquecer leads (scrape site + AI analysis)
         POST /api/leads/enrich { leadIds: [...] }
         ↓
STEP 2: Gerar landing pages (HTML self-contained)
         POST /api/leads/landing-page { leadIds: [...] }
         ↓
STEP 3: Deploy landing pages ao VPS
         rsync -avz public/propostas/leads/ root@195.200.2.16:/var/www/juan-hub/public/propostas/leads/
         ↓
STEP 4: Enfileirar outreach WhatsApp
         POST /api/leads/outreach { action: "enqueue", leadIds: [...] }
         ↓
STEP 5: Processar fila (cron automático ou manual)
         POST /api/leads/outreach { action: "process", maxToSend: 3 }
```

## Ações

Parse $ARGUMENTS para determinar ação:

### `enrich [leadId|all-pending]`
```bash
# Single
curl -s -X POST http://localhost:3001/api/leads/enrich -H 'Content-Type: application/json' -d '{"leadId": ID}'

# All pending
curl -s 'http://localhost:3001/api/leads?enrichment_status=pending' | python3 -c "import json,sys; data=json.load(sys.stdin); ids=[l['id'] for l in data.get('leads',data if isinstance(data,list) else [])]; print(json.dumps(ids))"
# Then POST with leadIds array
```

### `landing [leadId|all-enriched]`
```bash
curl -s -X POST http://localhost:3001/api/leads/landing-page -H 'Content-Type: application/json' -d '{"leadId": ID}'
```

### `deploy`
```bash
rsync -avz public/propostas/leads/ root@195.200.2.16:/var/www/juan-hub/public/propostas/leads/
```
URL final: `https://hub.juancarlo.com.br/propostas/leads/{slug}/`

### `queue [leadId|all-ready]`
```bash
curl -s -X POST http://localhost:3001/api/leads/outreach -H 'Content-Type: application/json' -d '{"action": "enqueue", "leadIds": [ID1, ID2]}'
```
Validações: lead precisa de phone + personalized_message.

### `send [maxToSend]`
```bash
curl -s -X POST http://localhost:3001/api/leads/outreach -H 'Content-Type: application/json' -d '{"action": "process", "maxToSend": 3}'
```
Limites: 25/dia, horário comercial (09-18 SP, seg-sex), delay 30-120s.

### `stats`
```bash
curl -s http://localhost:3001/api/leads/outreach
```
Retorna: total, queued, sent, failed, today_sent, daily_limit, is_business_hours.

### `full [leadIds]`
Pipeline completo: enrich → landing → deploy → queue. Execute cada step em sequência.

## Infraestrutura

| Arquivo | Função |
|---------|--------|
| `src/lib/lead-enrichment.ts` | Scrape website + AI analysis (Gemini Flash) |
| `src/lib/landing-page-generator.ts` | HTML template com Hive branding |
| `src/lib/outreach.ts` | WhatsApp queue (Baileys) |
| `src/app/api/leads/enrich/route.ts` | API enrichment |
| `src/app/api/leads/landing-page/route.ts` | API landing page |
| `src/app/api/leads/outreach/route.ts` | API outreach (GET/POST/DELETE) |
| `src/lib/cron.ts` | Cron: */30 9-17 seg-sex processa fila |

## Rate Limits

- Enrichment: 2s entre scrapes (Playwright)
- WhatsApp: 30-120s delay aleatório entre envios
- Max 25 novos contatos/dia
- Só horário comercial (09-18 São Paulo, seg-sex)
- Mensagens únicas (IA-generated, não template)

## Lead Data

Campos no DB (`leads` table):
- **Básicos:** name, phone, email, website, city, niche, address
- **Google:** rating, review_count, place_id, score
- **Enrichment:** enrichment_data (JSON), enrichment_status, personalized_message
- **Landing:** landing_page_url, landing_page_slug
- **Outreach:** outreach_status, sent_at, last_contacted

## Landing Page Template

Seções: Hero (logo lead) → Conexão Local → Quem Somos (Juan + Hive stats) → Análise (pain points + audit) → Soluções IA → Social Proof (nicho) → Metodologia → CTA (WhatsApp + Calendly) → P.S.

Branding: Navy #0a0a0a, Lime #d4fe5f, Inter font.
Logo: smart background detection (for-dark/for-light/neutral).
