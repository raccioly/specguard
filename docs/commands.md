# Commands Reference

SpecGuard v0.5.0 — 13 commands, zero dependencies.

## The AI Loop

```
diagnose (identify + fix)  →  AI executes  →  guard (verify)
```

`diagnose` is the primary command. `guard` is the CI gate.

---

## Primary Commands

### `specguard diagnose` (alias: `dx`)

**The AI orchestrator.** Runs all validators, maps every failure to an AI fix prompt, outputs a remediation plan.

```bash
npx specguard diagnose                # Human-readable remediation plan
npx specguard diagnose --format json  # Structured for automation
npx specguard diagnose --format prompt # Raw AI prompt (all issues combined)
```

**JSON output includes:**
- `issues[]` — severity, validator, message, fix command
- `fixCommands[]` — unique commands to run
- `score` — current CDD maturity score
- `grade` — letter grade (A+ to F)

### `specguard guard`

**Identify issues.** Validate project against canonical docs. Use for CI gates and pre-commit hooks.

```bash
npx specguard guard                   # Text output
npx specguard guard --format json     # Structured JSON
npx specguard guard --verbose         # Show all check details
```

**Exit codes:** `0` (pass), `1` (errors), `2` (warnings)

When issues are found, guard outputs: `Run specguard diagnose to get AI fix prompts.`

**JSON output includes:**
```json
{
  "project": "my-app",
  "profile": "standard",
  "status": "WARN",
  "passed": 37,
  "total": 40,
  "validators": [
    { "name": "Structure", "status": "pass", "passed": 8, "total": 8, "errors": [], "warnings": [] }
  ]
}
```

### `specguard score`

**CDD maturity score** (0-100) with category breakdown.

```bash
npx specguard score                   # Visual bar chart
npx specguard score --format json     # Structured JSON
npx specguard score --tax             # Documentation tax estimate
```

**`--tax` output:**
```
📋 Documentation Tax Estimate
─────────────────────────────────
Tracked docs:        7 files
Active profile:      standard
Est. maintenance:    ~5 min/week
Tax-to-value ratio:  LOW
```

**Grades:** A+ (95+), A (80+), B (65+), C (50+), D (30+), F (<30)

---

## Setup Commands

### `specguard init`

**Initialize CDD documentation** from templates.

```bash
npx specguard init                           # Full CDD (standard profile)
npx specguard init --profile starter         # Minimal: ARCHITECTURE + CHANGELOG
npx specguard init --profile enterprise      # Everything + strict validators
npx specguard init --dir /path/to/project    # Specify directory
npx specguard init --skip-prompts            # No AI prompt output
```

**Profiles:**

| Profile | Docs Created | Validators |
|---------|-------------|------------|
| `starter` | ARCHITECTURE, CHANGELOG, AGENTS, DRIFT-LOG | structure, docsSync, changelog |
| `standard` | All 5 canonical + tracking | Most validators (default) |
| `enterprise` | All docs | All validators + freshness |

### `specguard generate`

**Reverse-engineer docs from existing code.** Scans your codebase and creates pre-filled documentation.

```bash
npx specguard generate
npx specguard generate --dir /path/to/project
```

**Detects:** Next.js, React, Vue, Angular, Express, Fastify, Hono, Django, FastAPI, SvelteKit, and more.

### `specguard audit`

**Scan and report** which CDD documents exist, are missing, or need attention.

```bash
npx specguard audit
```

---

## AI Integration Commands

### `specguard fix`

**Find issues and generate AI fix instructions.**

```bash
npx specguard fix                    # Human-readable issue list
npx specguard fix --format json      # Machine-readable for VS Code/CI
npx specguard fix --format prompt    # AI-ready prompt
npx specguard fix --auto             # Create missing skeleton files
```

### `specguard fix --doc <name>`

**Generate a deep AI research prompt** for a specific document.

```bash
npx specguard fix --doc architecture
npx specguard fix --doc data-model
npx specguard fix --doc security
npx specguard fix --doc test-spec
npx specguard fix --doc environment
```

**Output includes:** TASK, PURPOSE, RESEARCH STEPS (what to grep/read), WRITE THE DOCUMENT (expected sections).

### `specguard agents`

**Generate agent-specific config files** from AGENTS.md.

```bash
npx specguard agents
npx specguard agents --list
```

---

## DevOps Commands

### `specguard ci`

**Single command for CI/CD pipelines.** Runs guard + score internally (no subprocess).

```bash
npx specguard ci                              # Basic check
npx specguard ci --threshold 70               # Fail below score 70
npx specguard ci --threshold 80 --fail-on-warning  # Strict mode
npx specguard ci --format json                # JSON for GitHub Actions
```

### `specguard hooks`

**Install git hooks** for automatic validation.

```bash
npx specguard hooks              # Install all hooks
npx specguard hooks --list       # Show installed hooks
npx specguard hooks --remove     # Remove hooks
```

**Hooks installed:**
- `pre-commit` → runs `specguard guard`
- `pre-push` → runs `specguard score` with threshold
- `commit-msg` → validates conventional commit format

### `specguard watch`

**Live watch mode** — re-runs guard on file changes.

```bash
npx specguard watch              # Watch and re-run guard
npx specguard watch --auto-fix   # Also output AI fix prompts on failure
```

### `specguard badge`

**Generate shields.io badges** for README.

```bash
npx specguard badge
npx specguard badge --format json
```

### `specguard diff`

**Show gaps** between documentation and actual codebase.

```bash
npx specguard diff
```

---

## Global Flags

| Flag | Description |
|------|-------------|
| `--dir <path>` | Project directory (default: current directory) |
| `--format <type>` | Output format: `text` (default), `json`, `prompt` |
| `--verbose` | Show detailed output |
| `--profile <name>` | Compliance profile: `starter`, `standard`, `enterprise` |
| `--tax` | Show documentation tax estimate (with `score`) |
| `--auto-fix` | Output AI fix prompts on failure (with `watch`) |
| `--skip-prompts` | Suppress AI prompts after init |
| `--auto` | Auto-fix issues (with `fix` command) |
| `--doc <name>` | Target specific document (with `fix` command) |
| `--threshold <n>` | Minimum score for CI pass (with `ci` command) |
| `--fail-on-warning` | Fail CI on warnings (with `ci` command) |
| `--force` | Overwrite existing files |
| `--help` | Show help |
| `--version` | Show version |
