---
description: Review documentation quality — identify improvements and suggest fixes based on CDD and spec-kit standards
---

# DocGuard Review — Documentation Quality Analysis

Analyze the project's documentation quality and suggest specific improvements.

## What to do

1. Run the full diagnostic:
```bash
npx docguard-cli diagnose
```

2. Run the scoring engine:
```bash
npx docguard-cli score
```

3. For each issue found, analyze the root cause:
   - **Missing sections**: Check which mandatory sections are absent from canonical docs
   - **Low readability**: Identify overly complex sentences or passive voice
   - **Drift**: Find `// DRIFT:` comments in code not logged in DRIFT-LOG.md
   - **Stale docs**: Compare doc modification dates against code changes
   - **Spec quality**: Verify specs have FR-IDs, SC-IDs, and Given/When/Then scenarios

4. Suggest specific improvements for each issue. Quote the relevant section and propose the fix.

5. Prioritize fixes by impact:
   - 🔴 HIGH: Missing docs, security issues, broken traceability
   - 🟡 MEDIUM: Low readability, missing sections, stale content
   - 🟢 LOW: Minor formatting, missing badges, metadata sync

6. After making changes, re-run `npx docguard-cli guard` to verify improvements.
