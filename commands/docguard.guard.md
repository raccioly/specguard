---
description: Run DocGuard guard validation — check project documentation quality against CDD standards
---

# DocGuard Guard — Documentation Quality Gate

Run the DocGuard CLI to validate all documentation against Canonical-Driven Development standards.

## What to do

1. Run the guard command:
```bash
npx docguard-cli guard
```

2. Review the output. Each validator reports ✅ (pass) or ❌ (fail):
   - **Structure**: Required CDD files exist
   - **Doc Sections**: Canonical docs have required sections
   - **Drift**: Code deviations logged in DRIFT-LOG.md
   - **Test-Spec**: Tests match TEST-SPEC.md rules
   - **Security**: No hardcoded secrets
   - **Spec-Kit**: Spec quality validation (FR-IDs, sections)
   - **Doc-Quality**: Readability and writing quality

3. If any checks fail, run `docguard diagnose` for a remediation plan.

4. All checks must pass before committing. Exit code 0 = pass, 1 = fail, 2 = warnings only.
