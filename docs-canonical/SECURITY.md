# Security

<!-- specguard:version 0.4.0 -->
<!-- specguard:status active -->
<!-- specguard:last-reviewed 2026-03-13 -->

| Metadata | Value |
|----------|-------|
| **Status** | ![Status](https://img.shields.io/badge/status-active-brightgreen) |
| **Version** | `0.4.0` |

---

## Overview

SpecGuard is a **local CLI tool** that runs entirely on the user's machine. It reads project files from the filesystem and produces terminal output. It makes **no network requests**, requires **no authentication**, and stores **no credentials**.

## Authentication

| Method | Provider | Scope |
|--------|---------|-------|
| **None required** | N/A | SpecGuard is a local-only CLI tool. No auth is needed. |

SpecGuard operates purely on the local filesystem. It does not communicate with any server, API, or cloud service.

## Authorization

| Role | Permissions | Notes |
|------|-----------|-------|
| **User** (local machine) | Full access — read/write project files | SpecGuard runs with the permissions of the user invoking it |
| **CI Pipeline** | Read-only (guard, score, ci commands) | CI typically only runs validation, not init/generate |
| **AI Agent** | Depends on AI agent permissions | AI agents run SpecGuard via terminal — they inherit the user's or CI's permissions |

There is no RBAC system. SpecGuard inherits filesystem permissions from the calling process.

## Secrets Management

| Secret | Storage | Used By | Notes |
|--------|---------|---------|-------|
| **None** | N/A | N/A | SpecGuard requires no API keys, tokens, or credentials |

### What SpecGuard Does NOT Do

- Does **not** read `.env` files for its own use (it checks if your project has one)
- Does **not** make HTTP requests to any API
- Does **not** store any data outside the project directory
- Does **not** require `sudo` or elevated permissions

## Security Boundaries

| Boundary | Trusted | Untrusted |
|----------|---------|-----------|
| **File reads** | Project files within `projectDir` | SpecGuard only reads files within the project directory and its own templates |
| **File writes** | `specguard init`, `specguard generate`, `specguard hooks` | Only writes to `docs-canonical/`, root docs, `.specguard.json`, `.git/hooks/` |
| **Child processes** | `git log`, `git diff` (freshness validator) | Only executes `git` commands with safe flags (no mutations) |
| **User input** | CLI arguments parsed by the entry point | No user input is passed to `exec()` unsanitized |

## Command Safety Levels

| Command | Reads Files | Writes Files | Runs Git | Risk |
|---------|------------|-------------|----------|------|
| `audit` | ✅ | ❌ | ❌ | None |
| `guard` | ✅ | ❌ | ✅ (read-only) | None |
| `score` | ✅ | ❌ | ❌ | None |
| `diff` | ✅ | ❌ | ✅ (read-only) | None |
| `fix` | ✅ | ❌ | ❌ | None |
| `ci` | ✅ | ❌ | ✅ (read-only) | None |
| `badge` | ✅ | ❌ | ❌ | None |
| `init` | ✅ | ✅ Creates docs | ❌ | Low — creates new files only, never overwrites |
| `generate` | ✅ | ✅ Creates docs | ❌ | Low — creates new files only, never overwrites |
| `hooks` | ✅ | ✅ Writes `.git/hooks/` | ❌ | Low — writes executable git hooks |

## Supply Chain

| Category | Status |
|----------|--------|
| **npm dependencies** | **Zero** — SpecGuard has no `node_modules` |
| **Runtime dependencies** | Node.js ≥ 18, `git` (optional, for freshness checks) |
| **Transitive dependencies** | None |
| **Known vulnerabilities** | None — no dependency tree to audit |

The zero-dependency architecture is a deliberate security decision: no supply chain = no supply chain attacks.

## .gitignore Audit

SpecGuard's own `.gitignore` excludes:

| Pattern | Purpose |
|---------|---------|
| `node_modules/` | npm packages (dev dependencies only — test runner) |
| `.env` | Environment files (not used, but excluded as best practice) |

## Security Rules Checklist

- [x] No secrets stored in code
- [x] No `.env` files committed
- [x] No hardcoded credentials
- [x] No network requests made by the CLI
- [x] No user input passed to `exec()` unsanitized
- [x] All file writes are opt-in (init, generate, hooks commands only)
- [x] Git commands are read-only (`git log`, `git diff`)
- [x] Zero npm dependencies eliminates supply chain risk

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.4.0 | 2026-03-13 | SpecGuard Team | Complete rewrite — documented zero-auth model, command safety levels, supply chain posture |
| 0.1.0 | 2026-03-13 | SpecGuard Generate | Auto-generated skeleton |
