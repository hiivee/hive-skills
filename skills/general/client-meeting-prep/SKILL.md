---
name: client-meeting-prep
description: Prepare for an upcoming delivery/operational call with an existing client by running the 9-step prep workflow that proved out with Mathis Kennington 2026-05-04. Triggers on phrasings like "amanhã call com X", "tomorrow's call with X", "isso que ele vai querer amanhã", "prepara reunião pra X", "vou falar com X amanhã", or when a client audio/voice memo lands in docs/audios/. Use whenever the call has a delivery component (something needs to be set up, configured, or shipped). NOT for prospect/sales meetings — use sales-prep for those.
layer: hive
---

# Client Meeting Prep

Skill that orchestrates a 9-step prep workflow before a delivery call with an existing client. Output: client only has to provide credentials on the call; everything else is pre-staged. Validated end-to-end on Mathis Kennington's 2026-05-04 prep (sync system + 4 integration setups).

## When to invoke

Recognize these triggers and run the workflow:

| Trigger | Example |
|---|---|
| Explicit call mention | "amanhã 11h call com Mathis", "tomorrow's call with X" |
| Implicit prep ask | "isso que ele vai querer amanhã", "prepara reunião pra X", "vou alinhar com X amanhã" |
| Client audio in repo | New `.opus`/`.m4a`/`.mp3` in `docs/audios/` from a client |
| Client message with 3+ asks | Treat a multi-ask DM as a virtual call to prep for |

When in doubt, ask: "Is there a delivery/setup component to this call?" If yes, run. If it's pure conversation/strategy with no system to build, skip the skill.

## What this skill is NOT

- Not for sales/prospect meetings → use `sales-prep`
- Not for one-off bugfixes that don't need credentials from client
- Not for internal Juan-only work

---

## The 9-step workflow

Execute in order. Each step compounds. Don't skip — partial prep makes the call worse than no prep.

### Step 1 — Capture client's actual asks

If audio:
```bash
ffmpeg -i "<audio-file>" -ar 16000 -ac 1 /tmp/audio.wav -y
whisper /tmp/audio.wav --model small --language pt --output_format txt --output_dir /tmp
```
(Use `--language en` if client speaks English.)

If text/message: re-read at least twice, extract verbatim asks as a numbered list.

Write findings into the prep doc location (next step).

### Step 2 — Diagnose current state

SSH the client's VPS (alias from `~/.claude/clientes-access.md` or `docs/tasks/vps-setup/README.md`). Check:
```bash
pm2 list
systemctl --no-pager
df -h /
git status
git log --oneline -10
```

Identify gaps between what client thinks is set up and what actually is. Write findings into the prep doc as a "Diagnostic" section.

**Frame all findings positive** — never "broken/dead/bug" in client-facing copy. Use "tightened up", "rebuilt properly", "improved reliability". Juan rule.

### Step 3 — Research unknowns in parallel

For each integration/tool/topic the client mentioned that has unknowns, dispatch one general-purpose agent with WebSearch:
```
Agent({
  description: "Research <topic>",
  subagent_type: "general-purpose",
  prompt: "Research <topic> for <use case>. Context: <2 sentences>. Answer these questions: 1)... 2)... Don't write code. Cite URLs. Under 500 words.",
  run_in_background: true
})
```

Run 3-4 in parallel (single message, multiple Agent calls). They finish in ~2-3 min concurrent vs 10+ min serial.

While agents research, do step-1 capture or scoping work that doesn't depend on their output.

### Step 4 — Per-topic research docs

For each agent result, write a doc at `docs/tasks/<call-slug>/0N-<topic>.md` with sections:
- **Verdict** (the recommendation in 1 line)
- **Why** (decision rationale)
- **Architecture** (how it fits into client's stack)
- **Implementation files (planned)** (paths, units, scripts)
- **Open items for client** (the questions for the call)
- **Sources** (cited URLs)

200-400 lines each is fine. These are operator-facing, not client-facing.

### Step 5 — Master README dashboard

`docs/tasks/<call-slug>/README.md` with:
- Phase status table (✅ DONE, 🟡 NEXT, ⏳ PLANNED, 🔴 BLOCKED)
- Architecture overview (ASCII diagram is sufficient)
- Suggested call agenda with minute breakdown
- Recommended ship order (post-call sequence)
- Consolidated open questions

### Step 6 — Pre-install on client VPS

Anything that doesn't need client credentials, install now via SSH:
- Language runtimes (`uv`, latest Node, Python venvs)
- MCP servers (`workspace-mcp` etc.)
- CLI tools (`plaud`, etc.)
- Directories with correct permissions
- Systemd unit files dropped in `/etc/systemd/system/` but **NOT** enabled (services with missing creds will fail and pollute logs)

Stage scripts in repo so a single installer activates everything once creds arrive. The installer should detect which credentials are present and enable only those services. Idempotent. Re-runnable.

### Step 7 — Client-facing handoff doc

`docs/tasks/<call-slug>/05-<client>-handoff.md`. Structure:

1. **What's already done — no action needed** (checkmark list, builds confidence)
2. **The N logins** — one section per credential, each isolated
   - For each: Why · You do · You give me · What I do with it
3. **Final activation** — 1 command on VPS
4. **Restart command** — `systemctl restart <services>`
5. **Verification checklist** — Telegram pings or curl tests with expected output

Tone: positive, plain English, no jargon unless immediately translated.

### Step 8 — Paste-ready prompt for client's Claude Code

`docs/tasks/<call-slug>/06-<client>-prompt.md`. A prompt the client copy-pastes into their Claude Code. Tells their Claude:
- Read `05-<client>-handoff.md` first
- Walk one section at a time, ask for confirmation before next
- "I am not technical, explain in plain English"
- "Don't guess on errors — check the doc first"
- After all sections, run the activator + restart + verification

Three delivery options for the prompt: paste in messaging app, read on call, drop in client's repo.

### Step 9 — Visual hero diagram (non-technical client)

`docs/tasks/<call-slug>/flow.html`. Single-page HTML using client's design system (read `<repo>/design-system/tokens.css` or fall back to Hive defaults).

Sections:
- Hero with one-line tagline
- "Old way / This setup" framing the shift positively
- Topology diagram (hub-and-spoke or async-flow, NOT linear — Juan feedback 2026-05-04)
- Async scenarios (3 short stories showing same flow from different starting points)
- 3 columns: habits / already automated / possible to add
- Activation steps as final CTA

Open in browser locally to verify before commit.

### Step 10 — Progress message to client (call eve)

Two-column structure for the eve-of-call status update:
```
What I already did this week:
  ✅ ...
  ✅ ...

What's left for tomorrow — depends only on you:
  🟡 ...
  🟡 ...
```

Include concrete count if impressive ("906 lines of planning", "5 docs, 3 commits"). Pointers to the 1-2 docs they need (or skip and Claude walks them through). Sign off with call time.

### Step 11 — Call-day message (morning of)

On the morning of the call (or moments before), send a tight 6-line activation message. This format was validated with Mathis 2026-05-05 — he explicitly asked for it to be the default.

```
<Client first name> — <greeting>.

<One-line context: when to do this>:

  run prompts/<orchestrator-name>

<One sentence what it does>. <Time estimate>, one step at a time,
asks before each.

Optional read: <path/to/plain-english-explainer.md>

<Juan's first name>
```

Hard constraints:
- Six lines max + sign-off. No bullets. No fluff. No "just" / "feel free to" / "let me know".
- One command, exactly. The client copy-pastes that line; no decisions.
- The orchestrator at `prompts/<name>.md` does the rest (see Step 6 — pre-installed aparato + Step 8 — paste-ready prompts evolved into a `prompts/` folder convention with one master `start.md` orchestrator that chains the per-step prompts).
- Time estimate must be honest. Underpromising creates "is this stuck" anxiety.
- Plain-text sign-off, no brand blocks.

Reference example (Mathis 2026-05-05):
```
Mathis — good morning.

When we open today, paste this in Claude Code on your Mac:

  run prompts/start

Claude walks the rest: Mac sync, the four logins (Google, Fathom,
Plaud), couple imports, final check. ~25 min, one step at a time,
asks before each.

Optional read: docs/HOW-IT-WORKS-FOR-MATHIS.md

Juan
```

### Step 11 — Commit + push

```bash
git add docs/ infra/ bin/ couples/<as-applicable>/
git commit -m "feat(<area>): pre-install <client> VPS aparato + handoff docs (N logins)"
git push
```

If client's VPS is also a clone of the same repo, SSH and `git pull` on their side too — keeps Mac/VPS/GitHub in sync (per `feedback_client_meeting_prep_pattern` in memory).

---

## Anti-patterns

- **Don't skip parallel research** — serial agent dispatching wastes 5+ min
- **Don't merge research + handoff into one doc** — different audiences
- **Don't ask client to do steps Claude could pre-do via SSH** — call is for credential collection, not package installs
- **Don't enable services with missing credentials** — logs pollute, debugging gets harder
- **Don't write em-dashes in client-facing copy** (Juan rule)
- **Don't claim "fixed/broken"** — frame as upgrades/improvements
- **Don't generate the visual diagram before the architecture is decided** — wasted iteration

---

## Reference: Mathis Kennington 2026-05-04 prep (template)

Files this pattern produced:
```
docs/tasks/sync-mac-vps/
├── README.md
├── flow.html
docs/tasks/integrations-research/
├── README.md
├── 01-fathom-webhook.md
├── 02-gmail-google-mcp.md
├── 03-playbook-automation.md
├── 04-plaud.md
├── 05-mathis-handoff.md
└── 06-mathis-prompt.md
infra/systemd/                # pre-staged units (3 services)
infra/scripts/                # pre-staged routing scripts
bin/install-integrations.sh   # idempotent activator
```

Total prep output: ~1500 lines of planning across 8 docs, 5 commits, ~3 hours of Juan/Claude time. Call scope shrunk to 4 logins + 1 command + 5 verification pings (~20 min).

---

## Output

Standard skill output to Juan after running:

```
✅ Prep complete for <client> call <date>.

Created:
  - docs/tasks/<slug>/README.md            (master dashboard + agenda)
  - docs/tasks/<slug>/0N-<topic>.md       (N research docs)
  - docs/tasks/<slug>/05-<client>-handoff.md (4 logins)
  - docs/tasks/<slug>/06-<client>-prompt.md  (paste-ready)
  - docs/tasks/<slug>/flow.html            (visual hero)
  - infra/<staged-files>                  (pre-installed)
  - bin/install-<area>.sh                 (activator)

Pre-installed on VPS: <list>
Pending only on client: <N logins>

Message to send: <inline>
```
