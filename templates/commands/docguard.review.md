---
description: Review documentation quality — identify drift, coverage gaps, and improvements
handoffs:
  - label: Fix Issues
    agent: docguard.fix
    prompt: Fix the documentation issues identified in the review
  - label: Run Guard
    agent: docguard.guard
    prompt: Validate all checks pass after review
---

# /docguard.review — Review Documentation vs Code

You are an AI agent reviewing documentation quality and detecting drift between docs and code.

## Step 1: Run Diagnostics

```bash
npx docguard-cli diagnose
npx docguard-cli diff
npx docguard-cli score
```

Read all output. Identify where documentation no longer matches the codebase.

## Step 2: Semantic Analysis (Beyond CLI)

For each canonical doc, verify alignment with actual code:

| Analysis | What to Check |
|----------|--------------|
| Architecture ↔ Code | Components in ARCHITECTURE.md exist as real modules |
| Data Model ↔ Code | Schemas in DATA-MODEL.md match actual implementations |
| Security Claims | Auth mechanisms in SECURITY.md match actual code |
| Test Coverage | Critical flows in TEST-SPEC.md have actual test files |
| Terminology | Same concepts named consistently across all docs |

## Step 3: Update Stale Docs

For each stale or drifted document:
1. Read the relevant source code files
2. Update the specific section that changed
3. Update the `docguard:last-reviewed` date to today
4. If the change is intentional drift, add an entry to DRIFT-LOG.md
5. Add entry to CHANGELOG.md under [Unreleased]

## Step 4: Verify

```bash
npx docguard-cli guard
npx docguard-cli score
```

Report findings, changes made, and the final score.
