# Test Specification

<!-- specguard:version 0.3.0 -->
<!-- specguard:status active -->
<!-- specguard:last-reviewed 2026-03-12 -->

> SpecGuard is a zero-dependency CLI tool. No E2E tests needed.

| Metadata | Value |
|----------|-------|
| **Status** | ![Status](https://img.shields.io/badge/status-active-brightgreen) |
| **Project Type** | CLI |
| **Test Framework** | `node:test` (built-in) |
| **Test Files** | `tests/` |

---

## Test Categories

| Category | Framework | Location | Run Command |
|----------|-----------|----------|-------------|
| Unit | node:test | tests/ | `npm test` |
| CLI Integration | node:test | tests/ | `npm test` |

> **No E2E tests needed** — this is a CLI tool with no UI. CLI integration tests
> validate commands end-to-end via Node.js subprocess execution.

## Coverage Rules

| Metric | Target | Current |
|--------|:------:|:-------:|
| Command Coverage | 100% | 100% (8/8 commands) |
| Validator Coverage | 80% | 100% (10/10 validators) |
| Flag Coverage | 80% | 100% |

## Source-to-Test Map

| Source File | Test File | Status |
|------------|-----------|:------:|
| `cli/specguard.mjs` | `tests/cli.test.mjs` | ✅ |
| `cli/commands/audit.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/init.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/guard.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/score.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/diff.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/generate.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/agents.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/commands/hooks.mjs` | `tests/commands.test.mjs` | ✅ |
| `cli/validators/structure.mjs` | `tests/validators.test.mjs` | ✅ |

## Critical CLI Flows

| # | Flow | Test File | Status |
|---|------|-----------|:------:|
| 1 | `specguard audit` | `tests/commands.test.mjs` | ✅ |
| 2 | `specguard init` | `tests/commands.test.mjs` | ✅ |
| 3 | `specguard guard` | `tests/commands.test.mjs` | ✅ |
| 4 | `specguard score` | `tests/commands.test.mjs` | ✅ |
| 5 | `specguard score --format json` | `tests/commands.test.mjs` | ✅ |
| 6 | `specguard generate` | `tests/commands.test.mjs` | ✅ |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.3.0 | 2026-03-12 | @raccioly | Real tests, project-type-aware spec |
| 0.1.0 | 2026-03-12 | SpecGuard Generate | Auto-generated (corrected) |
