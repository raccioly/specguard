---
description: AI-driven documentation repair — research codebase, generate content, validate against CDD standards
handoffs:
  - label: Verify Fixes
    agent: docguard.guard
    prompt: Run guard to verify all fixes pass
  - label: Check Score Improvement
    agent: docguard.score
    prompt: Show score improvement after fixes
---

# DocGuard Fix — AI-Assisted Documentation Repair

Generate or repair canonical documentation by researching the actual codebase.

## What to do

1. **Identify what needs fixing**:
```bash
npx docguard-cli diagnose
```

2. **For a specific document**, generate a research-aware fix prompt:
```bash
npx docguard-cli fix --doc architecture
npx docguard-cli fix --doc security
npx docguard-cli fix --doc test-spec
npx docguard-cli fix --doc data-model
npx docguard-cli fix --doc environment
```

3. **Execute the research workflow** from the generated prompt:
   - Read actual code files (not just filenames)
   - Map module structure and dependencies
   - Extract real data structures and schemas
   - Identify actual auth mechanisms and security patterns

4. **Write documentation with real content**:
   - Use actual file paths, module names, dependency names
   - Include working command examples
   - Use positive language (IEEE 830: "MUST use" not "MUST NOT avoid")
   - Ensure Flesch-Kincaid grade level 8-10

5. **Include metadata header** in every canonical doc:
```markdown
<!-- docguard:version X.X.X -->
<!-- docguard:status active -->
<!-- docguard:last-reviewed YYYY-MM-DD -->
```

6. **Validate the fix** (iterate up to 3 times):
```bash
npx docguard-cli guard
```

7. If the project uses Spec Kit, align with spec-kit templates:
   - `spec.md`: User Scenarios, Requirements (FR-IDs), Success Criteria (SC-IDs)
   - `plan.md`: Summary, Technical Context, Project Structure
   - `tasks.md`: Phased breakdown (Phase 1, 2, 3+), Task IDs (T001+)

## Important

- Never use placeholder content — every section must reference real code
- Back up before overwriting — use `.bak` files or `safeWrite()`
- Log deviations in DRIFT-LOG.md with `// DRIFT: reason`
