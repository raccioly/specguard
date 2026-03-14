---
description: "Reverse-engineer canonical documentation from existing codebase"
handoffs:
  - label: Validate Generated Docs
    agent: docguard.guard
    prompt: Validate generated documentation passes all checks
  - label: Review Quality
    agent: docguard.review
    prompt: Review quality of generated documentation
---

# DocGuard Generate

Scans your codebase and generates canonical documentation: ARCHITECTURE.md, DATA-MODEL.md, TEST-SPEC.md, SECURITY.md, ENVIRONMENT.md, and API-REFERENCE.md.

## User Input

$ARGUMENTS

## Steps

1. Run DocGuard generate on the current project:

```bash
npx --yes docguard-cli@latest generate $ARGUMENTS
```

2. Review the generated docs in `docs-canonical/`. Each document includes:
   - Structured sections based on industry standards
   - Data extracted from your actual codebase (routes, schemas, configs)
   - Standards citation footer referencing relevant specifications
   - DocGuard metadata headers for freshness tracking

3. Customize with `--doc <name>` to generate a specific document only.

## Generated Documents

| Document | Source | Standard |
|----------|--------|----------|
| ARCHITECTURE.md | Routes, configs, dependencies | arc42 / C4 Model |
| DATA-MODEL.md | Schema files, type definitions | C4 Component / ER |
| TEST-SPEC.md | Test files, test configs | ISO/IEC/IEEE 29119-3 |
| SECURITY.md | Auth modules, .gitignore, secrets | OWASP ASVS v4.0 |
| ENVIRONMENT.md | .env files, Docker, CI/CD configs | 12-Factor App |
| API-REFERENCE.md | Route handlers, OpenAPI specs | OpenAPI 3.1 |

## Flags

- `--doc <name>` — Generate a specific document only
- `--dir <path>` — Run on a different directory
