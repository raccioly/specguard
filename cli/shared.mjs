/**
 * Shared constants for DocGuard CLI — colors, profiles, version.
 * Extracted from docguard.mjs to break circular dependencies.
 * All commands import from here instead of docguard.mjs.
 */

// ── Colors (ANSI escape codes, zero deps) ──────────────────────────────────
export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// ── Compliance Profiles ───────────────────────────────────────────────────
export const PROFILES = {
  starter: {
    description: 'Minimal CDD — just architecture + changelog. For side projects and prototypes.',
    requiredFiles: {
      canonical: [
        'docs-canonical/ARCHITECTURE.md',
      ],
      agentFile: ['AGENTS.md', 'CLAUDE.md'],
      changelog: 'CHANGELOG.md',
      driftLog: 'DRIFT-LOG.md',
    },
    validators: {
      structure: true,
      docsSync: true,
      drift: false,
      changelog: true,
      architecture: false,
      testSpec: false,
      security: false,
      environment: false,
      freshness: false,
    },
  },
  standard: {
    description: 'Full CDD — all 5 canonical docs. For team projects.',
    // Uses the defaults — no overrides needed
  },
  enterprise: {
    description: 'Strict CDD — all docs, all validators, freshness enforced. For regulated/enterprise projects.',
    validators: {
      structure: true,
      docsSync: true,
      drift: true,
      changelog: true,
      architecture: true,
      testSpec: true,
      security: true,
      environment: true,
      freshness: true,
    },
  },
};

// ── .docguardignore Support ───────────────────────────────────────────────
import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

/**
 * Load ignore patterns from .docguardignore (like .gitignore).
 * Returns a function that checks if a relative path should be ignored.
 *
 * Format: one pattern per line, # comments, blank lines skipped.
 * Supports simple glob: * (any chars), ** (any path segments).
 *
 * @param {string} projectDir - Project root
 * @returns {(relPath: string) => boolean} - Returns true if file should be ignored
 */
export function loadIgnorePatterns(projectDir) {
  const ignorePath = resolve(projectDir, '.docguardignore');
  if (!existsSync(ignorePath)) return () => false;

  let content;
  try { content = readFileSync(ignorePath, 'utf-8'); } catch { return () => false; }

  const patterns = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => {
      // Convert glob to regex:
      // ** → match any path segments
      // * → match any chars except /
      // . → literal dot
      const escaped = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '§§')     // temp placeholder
        .replace(/\*/g, '[^/]*')
        .replace(/§§/g, '.*');
      return new RegExp(`^${escaped}$|/${escaped}$|^${escaped}/|/${escaped}/`);
    });

  return (relPath) => patterns.some(regex => regex.test(relPath));
}
