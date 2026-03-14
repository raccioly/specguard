---
description: Show CDD maturity score — comprehensive documentation health assessment with category breakdown
---

# DocGuard Score — CDD Maturity Assessment

Calculate and display the project's Canonical-Driven Development maturity score.

## What to do

1. Run the scoring engine:
```bash
npx docguard-cli score
```

2. For JSON output (CI/CD integration):
```bash
npx docguard-cli score --format json
```

3. Interpret the results:

   | Grade | Score | Meaning |
   |-------|-------|---------|
   | A+ | 95-100 | Exemplary — production-grade documentation |
   | A | 85-94 | Strong — minor improvements possible |
   | B | 70-84 | Good — some gaps to address |
   | C | 50-69 | Fair — significant documentation debt |
   | D | 30-49 | Poor — major gaps in documentation |
   | F | 0-29 | Critical — documentation infrastructure missing |

4. Focus on the category breakdown:
   - **Structure** (25%): Do required files exist?
   - **Doc Quality** (20%): Readability, completeness, sections
   - **Testing** (15%): Test coverage documentation
   - **Security** (10%): Security documentation
   - **Environment** (10%): Environment variable documentation
   - **Drift** (10%): Deviation tracking
   - **Changelog** (5%): Change log maintenance
   - **Architecture** (5%): Architecture documentation

5. Prioritize improvements by category weight — fixing Structure issues has the highest impact.
