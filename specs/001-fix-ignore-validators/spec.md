# Feature Specification: Fix Ignore System & Validator Consistency

**Feature Branch**: `001-fix-ignore-validators`  
**Created**: 2026-03-17  
**Status**: Draft  
**Input**: User description: "Fix 9 bugs in DocGuard v0.9.9 — non-functional ignore globs, node_modules scanning, scorer/guard inconsistencies, placeholder false positives, and ROADMAP TODO matching"

## User Scenarios & Testing

### User Story 1 - Config Ignore Globs Work (Priority: P1)

As a developer using DocGuard on an enterprise project, I configure `securityIgnore`, `todoIgnore`, and `ignore` arrays in `.docguard.json` to suppress known false positives. I expect guard to honor these settings and not flag files I've explicitly excluded.

**Why this priority**: This is the core blocker — without working ignore globs, guard always returns exit code 1 (FAIL), making CI/CD integration impossible. 3 of the 9 bugs stem from this single root cause.

**Independent Test**: Run `docguard guard` on a project with `securityIgnore` and `todoIgnore` configured. Ignored files must not appear in results.

**Acceptance Scenarios**:

1. **Given** `.docguard.json` contains `securityIgnore: ["backend/src/__tests__/**"]`, **When** `docguard guard` runs, **Then** files matching that glob are not flagged by the security validator
2. **Given** `.docguard.json` contains `securityIgnore: ["src/components/settings/tabs/AwsStorageTab.tsx"]` (exact path), **When** `docguard guard` runs, **Then** that exact file is not flagged
3. **Given** `.docguard.json` contains `todoIgnore: ["packages/cdk/**"]`, **When** `docguard guard` runs, **Then** TODOs in `packages/cdk/bin/environments.ts` are not reported
4. **Given** `.docguard.json` contains `ignore: ["example_settlement"]`, **When** `docguard guard` runs, **Then** the architecture validator does not flag circular dependencies inside `example_settlement/`
5. **Given** `docs-diff` validator scans for test files, **When** `docguard guard` runs, **Then** files inside `node_modules/` are never counted as test files

---

### User Story 2 - Scorer Reflects Actual Project State (Priority: P2)

As a developer, I expect `docguard score` to accurately reflect my project's testing and security posture. Projects with co-located `__tests__/` directories (Jest/Vitest convention) and E2E tests in `e2e/` should get full testing marks. Security score should align with guard's actual findings.

**Why this priority**: Misleading scores erode trust in the tool. A project scoring 100% on security while guard reports 10 security failures is contradictory.

**Independent Test**: Run `docguard score --format json` on a project with co-located tests and `TEST-SPEC.md` passing 44/44. Testing score should be ≥ 85%. Security score should be < 100% if guard reports security findings.

**Acceptance Scenarios**:

1. **Given** a project with tests in `backend/src/*/__tests__/` and `e2e/`, **When** `docguard score` runs, **Then** testing score is ≥ 85%
2. **Given** `testPatterns: ["backend/**/__tests__/**/*.test.ts", "e2e/**/*.spec.ts"]` in config, **When** `docguard score` runs, **Then** both patterns are recognized as valid test locations
3. **Given** guard reports 10 security findings, **When** `docguard score` runs, **Then** security score is < 100%
4. **Given** `testPattern` (singular) is configured, **When** using `testPatterns` (plural array), **Then** the singular form still works for backward compatibility

---

### User Story 3 - Fewer False Positives (Priority: P3)

As a developer, I should not be flagged for clearly safe patterns: AWS example placeholder keys (`AKIAIOSFODNN7EXAMPLE`), HTML `placeholder="..."` attributes, OpenAPI `example:` blocks, or TODOs that are already tracked in `ROADMAP.md`.

**Why this priority**: False positives create noise and teach developers to ignore warnings. Better detection quality improves signal-to-noise ratio.

**Independent Test**: Create a file with `AKIAIOSFODNN7EXAMPLE` in a placeholder attribute. Guard should not flag it. Add a TODO that's already in ROADMAP.md with file location — guard should not report it as untracked.

**Acceptance Scenarios**:

1. **Given** a file contains `placeholder="AKIAIOSFODNN7EXAMPLE"`, **When** security scanner runs, **Then** it is NOT flagged (recognized as AWS docs example)
2. **Given** a file contains `password: 'password123'` inside an OpenAPI `example:` block, **When** security scanner runs, **Then** it is NOT flagged
3. **Given** `ROADMAP.md` contains a TODO entry with `Location: packages/cdk/bin/environments.ts:29`, **When** that exact TODO exists at that location, **Then** TODO-Tracking does NOT report it as untracked
4. **Given** a match contains the string `EXAMPLE` (case-insensitive), **When** security scanner evaluates it, **Then** it is skipped as a known placeholder

---

### Edge Cases

- What happens when `securityIgnore` contains an invalid glob pattern? → Should be silently skipped (warn in verbose mode)
- What happens when `testPatterns` is an empty array? → Fall back to auto-detection behavior
- What happens when both `testPattern` (string) and `testPatterns` (array) are set? → Merge them (array takes precedence, string is added to array)
- What happens when a TODO text partially matches ROADMAP.md but the file location is wrong? → Still flag as untracked (location must match)
- What happens when `ignore` patterns overlap with `securityIgnore`? → Both are applied (union)

## Requirements

### Functional Requirements

- **FR-001**: System MUST apply `securityIgnore` glob patterns before security scanning, filtering out matching files
- **FR-002**: System MUST apply `todoIgnore` glob patterns before TODO scanning, filtering out matching files
- **FR-003**: System MUST apply top-level `ignore` array to Architecture, Docs-Diff, and all validators that walk the file tree
- **FR-004**: System MUST never scan files inside `node_modules/` for Docs-Diff test file discovery
- **FR-005**: System MUST support `testPatterns` (array of strings) in `.docguard.json` alongside existing `testPattern` (string)
- **FR-006**: Scorer MUST deduct security points when the security validator reports findings
- **FR-007**: Scorer MUST detect co-located `__tests__/` directories under any configured source root (not just top-level `tests/` dir)
- **FR-008**: Security scanner MUST skip matches containing the string `EXAMPLE` (case-insensitive)
- **FR-009**: Security scanner MUST skip matches inside HTML `placeholder="..."` attributes
- **FR-010**: Security scanner MUST skip matches on lines containing `example:` (OpenAPI documentation)
- **FR-011**: TODO-Tracking MUST match TODO text AND file location when checking ROADMAP.md entries
- **FR-012**: Architecture validator MUST respect the `ignore` array from `.docguard.json`
- **FR-013**: System MUST provide a shared ignore utility module for consistent glob matching across all validators
- **FR-014**: Constitution Principle IV MUST be updated to clarify shared infrastructure is encouraged

### Key Entities

- **IgnoreFilter**: A reusable function that takes a relative file path and returns whether it should be skipped, built from glob patterns in config
- **ValidatorConfig**: The `.docguard.json` configuration object, now with `securityIgnore`, `todoIgnore`, `ignore`, `testPatterns` fields
- **SecretMatch**: A finding from the security scanner, now with additional context (is it a placeholder? is it in an example block?)

## Success Criteria

### Measurable Outcomes

- **SC-001**: `docguard guard` passes (exit code 0 or 2) on projects with properly configured ignore patterns — zero false-positive ERRORs from ignored files
- **SC-002**: Score and guard security results are directionally consistent — if guard reports security findings, score is < 100%
- **SC-003**: Testing score ≥ 85% for projects with co-located `__tests__/` directories and a passing TEST-SPEC.md
- **SC-004**: All 375 existing test lines continue to pass (`npm test`) — zero regressions
- **SC-005**: `AKIAIOSFODNN7EXAMPLE` and similar AWS doc placeholders produce zero security findings
- **SC-006**: TODOs documented in ROADMAP.md with file location are recognized as tracked
