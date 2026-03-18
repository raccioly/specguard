/**
 * Shared Ignore Utility — Unified file filtering for all validators.
 *
 * Provides consistent glob matching for config ignore arrays:
 *   - config.ignore        (global — all validators)
 *   - config.securityIgnore (security validator only)
 *   - config.todoIgnore     (TODO-tracking validator only)
 *
 * Supports exact paths AND glob patterns:
 *   - "src/foo.ts"           → exact match
 *   - "packages/cdk/**"      → match any file under packages/cdk/
 *   - "backend/src/__tests__/**" → match any file under that path
 *   - "*.test.ts"            → match files ending in .test.ts
 *
 * Zero NPM dependencies — pure Node.js built-ins only.
 */

/**
 * Convert a glob pattern to a RegExp.
 * Supports: * (any chars except /), ** (any path segments), . (literal dot).
 *
 * @param {string} pattern - Glob pattern
 * @returns {RegExp}
 */
function globToRegex(pattern) {
  const escaped = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '§§')     // temp placeholder for **
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*');
  // Match if the relative path:
  //   - equals the pattern exactly
  //   - ends with /pattern
  //   - starts with pattern/
  //   - contains /pattern/
  return new RegExp(`^${escaped}$|/${escaped}$|^${escaped}/|/${escaped}/`);
}

/**
 * Build a filter function from an array of glob patterns.
 * Returns a function that returns true if a relative path should be SKIPPED.
 *
 * @param {string[]} patterns - Glob patterns (from config.ignore, config.securityIgnore, etc.)
 * @returns {(relPath: string) => boolean} - true if file should be ignored
 */
export function buildIgnoreFilter(patterns = []) {
  if (!patterns || patterns.length === 0) return () => false;

  const regexes = patterns.map(p => globToRegex(p));
  return (relPath) => regexes.some(regex => regex.test(relPath));
}

/**
 * Check if a relative path should be ignored by BOTH
 * global ignore + validator-specific ignore.
 *
 * @param {string} relPath - Relative file path (e.g., "backend/src/__tests__/foo.test.ts")
 * @param {object} config - DocGuard config object
 * @param {string} [validatorKey] - Optional validator-specific key (e.g., 'securityIgnore', 'todoIgnore')
 * @returns {boolean} - true if file should be skipped
 */
export function shouldIgnore(relPath, config, validatorKey) {
  // Check global ignore
  if (config.ignore && config.ignore.length > 0) {
    const globalFilter = buildIgnoreFilter(config.ignore);
    if (globalFilter(relPath)) return true;
  }

  // Check validator-specific ignore
  if (validatorKey && config[validatorKey] && config[validatorKey].length > 0) {
    const validatorFilter = buildIgnoreFilter(config[validatorKey]);
    if (validatorFilter(relPath)) return true;
  }

  return false;
}
