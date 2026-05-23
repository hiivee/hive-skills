---
layer: hive
---

# Update Agents Guide

Automatically updates the Penguin agents guide page (`/agents/guide`) to reflect the current system state.

## Trigger

Use this skill:
- After modifying any agent-related code (`src/lib/agents/`, `src/app/api/agents/`)
- After adding/removing/modifying agents in `src/components/agents/agent-profiles.ts`
- After changing agent communication, triggers, or webhooks in `src/lib/agents/communication.ts`
- After modifying approval engine in `src/lib/agents/approval-engine.ts`
- After changing thinking pulse, synapse, or memory logic
- After modifying data gatherers in `src/lib/agents/data-gatherers.ts`
- After adding new webhook handlers in `src/app/api/webhooks/`
- When the user says "update guide", "atualiza guide", or "sync guide"

## Target File

`src/app/(protected)/agents/guide/page.tsx`

## What to Update

The guide page has 8 tabs. Check each for accuracy:

### 1. Overview Tab
- **Agent count**: Must match total agents in `FIXED_ORDER` from `agent-profiles.ts`
- **AI vs Direct split**: Count agents in `AI_AGENTS` set vs those not in it
- **Pulse frequency**: Must match actual cron interval in `src/lib/agents/cron-schedules.ts` or `instrumentation.ts`
- **Cost estimate**: Update if provider or model changes
- **Pipeline steps**: Must reflect current execution flow (cron + webhooks → gather → similarity → AI → execute)

### 2. Agents Tab
- **`AI_AGENTS` set**: Must include all agents that use AI calls (currently: master, cmo, cto, coo, sales, tasks, seo, competitor, ads, crm, customer_service)
- **Provider text**: Must match current AI provider (currently: "Gemini 2.5 Flash (primary)")
- Cards auto-populate from `AGENT_PROFILES` — just verify the AI/Direct classification is correct

### 3. Memory Tab
- Tier counts, TTLs, and descriptions from `src/lib/agents/memory.ts`
- Memory injection limits from `buildMemoryContext()`

### 4. Thinking Pulse Tab
- Frequency (currently: every 2 hours)
- Similarity threshold (currently: 85%)
- Batch size and delay
- Agent count in processing details

### 5. Communication Tab
- Message types and priorities from `src/lib/agents/communication.ts`
- Cross-agent awareness description

### 6. Triggers & Webhooks Tab
- **Webhook topics**: Must match `TOPIC_MAP` in `src/app/api/webhooks/shopify/route.ts`
- **Trigger chains**: Must match `TRIGGER_CHAINS` in `src/lib/agents/communication.ts`
- **Approval feedback**: Must match `notifyAgentOfApproval()` in `src/lib/agents/approval-engine.ts`
- **Executive auto-refresh**: Must match stale detection in `src/lib/agents/data-gatherers.ts`

### 7. Notifications Tab
- Channel types from notification system
- Routing logic

### 8. Synapse Tab
- **Sharing map**: Must match actual cross-agent sharing patterns
- Pipeline frequency (currently: daily at 3:30 AM)
- Include C-levels in sharing map

## Procedure

1. Read `src/components/agents/agent-profiles.ts` — get FIXED_ORDER count and agent list
2. Read `src/lib/agents/communication.ts` — get TRIGGER_CHAINS array
3. Read `src/app/api/webhooks/shopify/route.ts` — get TOPIC_MAP (if it exists)
4. Read `src/lib/agents/approval-engine.ts` — check approval notification logic
5. Read `src/lib/agents/data-gatherers.ts` — check executive refresh and available gatherers
6. Compare against current guide page content
7. Apply targeted edits only where data is outdated
8. Run `npx tsc --noEmit` to verify no TypeScript errors introduced

## Key Constants to Keep in Sync

| Source File | Constant | Guide Location |
|------------|----------|---------------|
| `agent-profiles.ts` | `FIXED_ORDER.length` | Overview stat card, header subtitle |
| `agent-profiles.ts` | agent IDs | AgentsTab `AI_AGENTS` set |
| `communication.ts` | `TRIGGER_CHAINS` | TriggersTab chains list |
| `webhooks/shopify/route.ts` | `TOPIC_MAP` | TriggersTab webhook topics |
| `approval-engine.ts` | `APPROVAL_AGENTS` | TriggersTab approval section |
| `data-gatherers.ts` | `EXECUTIVE_SUB_AGENTS` | TriggersTab executive refresh |
| `memory.ts` | `SHARING_MAP` (synapse) | SynapseTab sharing map |
