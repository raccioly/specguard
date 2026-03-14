---
description: Generate AI prompts to fix specific documentation issues identified by DocGuard
---

# DocGuard Fix — AI-Assisted Documentation Repair

Generate targeted fix prompts for specific documentation issues.

## What to do

1. First, identify what needs fixing:
```bash
npx docguard-cli diagnose
```

2. Generate fix prompts for specific documents:
```bash
# Fix a specific canonical doc
npx docguard-cli fix --doc architecture
npx docguard-cli fix --doc security
npx docguard-cli fix --doc test-spec
npx docguard-cli fix --doc data-model
npx docguard-cli fix --doc environment
```

3. The fix command generates a detailed AI prompt. Read the prompt and execute its instructions:
   - It will reference the project's actual code structure
   - It will list specific sections to add or update
   - It will include examples aligned with the project's tech stack

4. After fixing, verify the improvement:
```bash
npx docguard-cli guard
```

5. If the project uses Spec Kit, ensure specs align with spec-kit templates:
   - `spec.md` must have: User Scenarios, Requirements (FR-IDs), Success Criteria (SC-IDs)
   - `plan.md` must have: Summary, Technical Context, Project Structure
   - `tasks.md` must have: Phased breakdown (Phase 1, 2, 3+), Task IDs (T001+)

## Important

- Never overwrite existing documentation without creating a `.bak` backup
- Use `--force` only when explicitly instructed by the user
- Log any deviations from canonical docs in DRIFT-LOG.md with `// DRIFT: reason`
