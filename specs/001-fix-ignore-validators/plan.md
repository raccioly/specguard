# Implementation Plan: Fix Ignore System & Validator Consistency

**Branch**: `001-fix-ignore-validators` | **Date**: 2026-03-17 | **Spec**: [spec.md](file:///Users/ricardoaccioly/.gemini/canonical-spec-kit/specs/001-fix-ignore-validators/spec.md)
**Input**: Feature specification from `/specs/001-fix-ignore-validators/spec.md`

## Summary

DocGuard v0.9.9 has 9 bugs rooted in validators each maintaining private file-walking functions with hardcoded ignore lists. The fix creates a shared ignore utility (`shared-ignore.mjs`), wires all 4 affected validators through it, aligns scorer with guard results, and improves detection quality for false positives. Constitution Principle IV is updated to explicitly allow shared infrastructure imports.

## Technical Context

**Language/Version**: JavaScript (ES Modules), Node.js 18+  
**Primary Dependencies**: None (zero NPM deps — constitution constraint)  
**Storage**: N/A (filesystem scanning only)  
**Testing**: `node:test` + `node:assert`  
**Target Platform**: CLI (cross-platform Node.js)  
**Project Type**: CLI tool  
**Constraints**: Zero runtime dependencies, all validators must remain pure functions

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LLM-First, CLI-Second | ✅ PASS | No UI impact |
| II. Zero NPM Dependencies | ✅ PASS | All changes use Node built-ins only |
| III. Documentation as Source of Truth | ✅ PASS | Spec-kit docs created first |
| IV. Validator Isolation | ✅ PASS | **Updated to v1.1.0** — shared infrastructure explicitly allowed. No validator imports another validator. |
| V. AI as Author, CLI as Orchestrator | ✅ PASS | No doc generation changes |
| VI. Safe Writes | ✅ PASS | No file write operations affected |
| VII. Spec Kit Extension Compliance | ✅ PASS | Feature uses spec-kit workflow |

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-ignore-validators/
├── spec.md              # Feature specification (done)
├── plan.md              # This file
└── tasks.md             # Task breakdown (next step)
```

### Source Code (repository root)

```text
cli/
├── shared.mjs              # Existing shared constants (unchanged)
├── shared-ignore.mjs       # NEW — unified ignore filter utility
├── validators/
│   ├── security.mjs        # MODIFY — use shared ignore + placeholder exclusions
│   ├── todo-tracking.mjs   # MODIFY — use shared ignore + fix ROADMAP matching
│   ├── docs-diff.mjs       # MODIFY — filter node_modules + use testPattern
│   └── architecture.mjs    # MODIFY — use shared ignore for config.ignore
├── commands/
│   └── score.mjs           # MODIFY — fix testing scorer + align security scorer
└── docguard.mjs            # MODIFY — merge testPatterns into config

tests/
└── commands.test.mjs       # MODIFY — add ignore filter tests
```

**Structure Decision**: Single-project CLI structure. All changes are within existing `cli/` and `tests/` directories. One new shared module (`shared-ignore.mjs`) added.

## Technical Design

### Shared Ignore Utility (`shared-ignore.mjs`)

```js
// Glob-to-regex conversion (same algorithm as loadIgnorePatterns in shared.mjs)
// Supports: exact paths, * (any chars except /), ** (any path segments)
export function buildIgnoreFilter(patterns = []) → (relPath) => boolean

// Combines global ignore + validator-specific ignore
export function shouldIgnore(relPath, config, validatorKey) → boolean
```

The `shouldIgnore` function checks:
1. `config.ignore` (global, always checked)
2. `config[validatorKey]` when provided (e.g., `config.securityIgnore`)

### Security Validator Changes

- Add `shouldIgnore(relPath, config, 'securityIgnore')` check in `walkDir` callback
- Add post-match filtering for known-safe patterns:
  - Skip if match string contains `EXAMPLE` (case-insensitive)
  - Skip if source line contains `placeholder=`
  - Skip if source line contains `example:` (OpenAPI)

### TODO-Tracking Changes

- Thread `config` parameter through `findTodos()` and `findTestFiles()`
- Add `shouldIgnore(relPath, config, 'todoIgnore')` check
- Fix ROADMAP matching: check full TODO text + file location context (not just 30-char substring)

### Docs-Diff Changes

- Use `config.testPattern` / `config.testPatterns` for test file discovery instead of hardcoded dir list
- Apply ignore filter to exclude `node_modules/` paths from results

### Scorer Alignment

- `calcTestingScore()`: Scan `config.testPatterns` globs for test presence; also check backend/**/\_\_tests\_\_/ pattern
- `calcSecurityScore()`: Run `validateSecurity()` inline and deduct points if findings exist (commands CAN compose validators per constitution v1.1.0)
- `getSuggestion('testing')`: Context-aware — don't suggest "Add tests/ directory" when co-located tests exist

### Config Loading Changes

- In `loadConfig()`: normalize `testPattern` (string) → `testPatterns` (array) for internal consistency
- Backward compatible: `testPattern: "foo"` becomes `testPatterns: ["foo"]`

## Complexity Tracking

No constitution violations. All changes align with updated Principle IV (v1.1.0).
