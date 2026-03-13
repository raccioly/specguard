# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-03-12

### Added
- **`specguard score`** — Weighted CDD maturity score (0-100) with bar charts, grades A+ through F, and improvement suggestions
- **`specguard diff`** — Compares canonical docs against actual code (routes, entities, env vars, tech stack, tests)
- **`specguard agents`** — Auto-generates agent-specific config files for Cursor, Copilot, Cline, Windsurf, Claude Code, and Gemini
- **`specguard generate`** — Reverse-engineer canonical docs from existing codebase (auto-detects 15+ frameworks, 8+ databases, 6 ORMs)
- **Freshness validator** — Uses git commit history to detect stale documentation
- **Full document type registry** — All 16 CDD document types known with required/optional flags and descriptions
- `--format json` flag for CI/CD pipeline integration
- `--fix` flag for auto-creating missing files from templates
- `--force` flag for overwriting existing files
- `--agent <name>` flag for targeting a specific AI agent
- 8 new templates: KNOWN-GOTCHAS, TROUBLESHOOTING, RUNBOOKS, VENDOR-BUGS, CURRENT-STATE, ADR, DEPLOYMENT, ROADMAP
- ROADMAP.md for the SpecGuard project itself
- Specguard metadata headers (`specguard:version`, `specguard:status`, `specguard:last-reviewed`) on all templates

### Changed
- Audit command now shows ALL 16 document types grouped by category (canonical, implementation, agent, tracking)
- Audit command explains each document's purpose inline
- Config now includes `documentTypes` with required/optional classification and descriptions

### Fixed
- Diff command false positives — entity extraction no longer picks up table headers like "metadata", "tbd", "cascade"

## [0.1.0] - 2026-03-12

### Added
- Initial release of SpecGuard CLI
- `specguard audit` — Scan project, report documentation status
- `specguard init` — Initialize CDD docs from professional templates
- `specguard guard` — Validate project against canonical documentation
- 9 validators: structure, doc-sections, docs-sync, drift, changelog, test-spec, environment, security, architecture
- 8 core templates: ARCHITECTURE, DATA-MODEL, SECURITY, TEST-SPEC, ENVIRONMENT, AGENTS, CHANGELOG, DRIFT-LOG
- Stack-specific configs: Next.js, Fastify, Python, generic
- Zero dependencies — pure Node.js
- GitHub CI workflow (Node 18/20/22 matrix)
- MIT license
- CDD Standard (STANDARD.md)
- CDD Philosophy (PHILOSOPHY.md)
- Competitive comparisons (COMPARISONS.md)
- GitHub issue templates (bug report, feature request)
