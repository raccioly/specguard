# Task Breakdown: Fix Ignore System & Validator Consistency

**Feature**: `001-fix-ignore-validators`  
**Plan**: [plan.md](file:///Users/ricardoaccioly/.gemini/canonical-spec-kit/specs/001-fix-ignore-validators/plan.md)  
**Spec**: [spec.md](file:///Users/ricardoaccioly/.gemini/canonical-spec-kit/specs/001-fix-ignore-validators/spec.md)  
**Generated**: 2026-03-17

## Phase 1: Setup

- [x] T001 Update constitution Principle IV in `.specify/memory/constitution.md` — allow shared infrastructure imports
- [x] T002 Normalize `testPatterns` config handling in `cli/docguard.mjs` `loadConfig()` — merge `testPattern` string into `testPatterns` array

## Phase 2: Foundational — Shared Ignore Infrastructure

- [x] T003 Create shared ignore utility module at `cli/shared-ignore.mjs` with `buildIgnoreFilter()` and `shouldIgnore()` functions
- [x] T004 Add unit tests for `buildIgnoreFilter()` in `tests/commands.test.mjs` — exact paths, glob patterns, `**` wildcards

## Phase 3: User Story 1 — Config Ignore Globs Work (P1)

- [x] T005 [US1] Wire `securityIgnore` in `cli/validators/security.mjs` — import `shouldIgnore`, filter in walkDir callback
- [x] T006 [US1] Wire `todoIgnore` in `cli/validators/todo-tracking.mjs` — thread config through `findTodos()` and `findTestFiles()`, apply `shouldIgnore`
- [x] T007 [US1] Filter `node_modules` in `cli/validators/docs-diff.mjs` — apply ignore filter to `diffTests()` and `getFilesRecursive()`
- [x] T008 [US1] Wire `config.ignore` in `cli/validators/architecture.mjs` — filter in `buildImportGraph()` and `getFilesRecursive()`
- [x] T009 [US1] Add integration tests for `securityIgnore` and `todoIgnore` in `tests/commands.test.mjs`

## Phase 4: User Story 2 — Scorer Reflects Actual Project State (P2)

- [x] T010 [US2] Fix `calcTestingScore()` in `cli/commands/score.mjs` — detect co-located `__tests__/` under any root, use `testPatterns` config
- [x] T011 [US2] Align `calcSecurityScore()` in `cli/commands/score.mjs` — call `validateSecurity()` and deduct points on findings
- [x] T012 [US2] Fix `getSuggestion('testing')` — don't suggest "Add tests/ directory" when co-located tests or testPatterns exist
- [x] T013 [US2] Use `testPatterns` in `docs-diff.mjs` `diffTests()` — discover test files via configured patterns, not just top-level dirs

## Phase 5: User Story 3 — Fewer False Positives (P3)

- [x] T014 [P] [US3] Add placeholder/example exclusions to security scanner in `cli/validators/security.mjs` — skip EXAMPLE keys, `placeholder=`, `example:` blocks
- [x] T015 [P] [US3] Fix ROADMAP.md matching in `cli/validators/todo-tracking.mjs` — match full TODO text + file location, not just 30-char substring

## Phase 6: Polish & Verification

- [x] T016 Run existing test suite: `npm test` — verify zero regressions on all 375 test lines
- [x] T017 Run `docguard guard --verbose` on DocGuard itself — verify no new warnings/errors
- [x] T018 Update `CHANGELOG.md` with [Unreleased] entries for all bug fixes
- [x] T019 Update `DRIFT-LOG.md` if any constitution deviations remain

## Results

- **Tests**: 40/40 pass (33 existing + 7 new)
- **Guard**: 176/197 passed, 0 errors, 26 pre-existing warnings
- **Files changed**: 10 modified + 1 new + 3 spec-kit docs
