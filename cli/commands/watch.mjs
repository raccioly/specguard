/**
 * Watch Command — Live mode that watches for file changes and re-runs guard
 * 
 * Like `jest --watch` but for CDD compliance.
 * Uses Node.js fs.watch (zero dependencies).
 */

import { watch as fsWatch, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { c } from '../specguard.mjs';
import { runGuard } from './guard.mjs';

const DEBOUNCE_MS = 500;
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'coverage',
  '.cache', '__pycache__', '.venv', 'vendor', '.turbo',
]);
const WATCH_EXTS = new Set([
  '.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.jsx', '.py',
]);

export function runWatch(projectDir, config, flags) {
  console.log(`${c.bold}👁️  SpecGuard Watch — ${config.projectName}${c.reset}`);
  console.log(`${c.dim}   Directory: ${projectDir}${c.reset}`);
  console.log(`${c.dim}   Watching for changes... (Ctrl+C to stop)${c.reset}\n`);

  // Run guard immediately on start
  runGuardQuiet(projectDir, config, flags);

  // Collect directories to watch
  const watchDirs = collectWatchDirs(projectDir);
  console.log(`${c.dim}   Watching ${watchDirs.length} directories${c.reset}\n`);

  let debounceTimer = null;
  let lastChange = '';

  for (const dir of watchDirs) {
    try {
      fsWatch(dir, { persistent: true }, (eventType, filename) => {
        if (!filename) return;
        const ext = extname(filename);
        if (!WATCH_EXTS.has(ext)) return;

        const changePath = relative(projectDir, resolve(dir, filename));
        if (changePath === lastChange) return; // skip duplicates
        lastChange = changePath;

        // Debounce — wait for rapid saves to settle
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`\n${c.dim}   Changed: ${c.cyan}${changePath}${c.reset}`);
          runGuardQuiet(projectDir, config, flags);
          lastChange = '';
        }, DEBOUNCE_MS);
      });
    } catch {
      // Some directories may not be watchable
    }
  }

  // Keep process alive
  process.on('SIGINT', () => {
    console.log(`\n${c.dim}   Watch stopped.${c.reset}\n`);
    process.exit(0);
  });
}

function runGuardQuiet(projectDir, config, flags) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${c.dim}   [${timestamp}] Running guard...${c.reset}`);

  try {
    runGuard(projectDir, config, { ...flags, format: 'text' });
  } catch {
    // Guard may throw on critical errors
    console.log(`${c.red}   Guard failed — check output above${c.reset}`);
  }
}

function collectWatchDirs(rootDir) {
  const dirs = [rootDir];

  function walk(dir) {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (IGNORE_DIRS.has(entry)) continue;
        if (entry.startsWith('.')) continue;

        const fullPath = resolve(dir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            dirs.push(fullPath);
            walk(fullPath);
          }
        } catch { /* skip unreadable */ }
      }
    } catch { /* skip unreadable */ }
  }

  // Always watch docs-canonical explicitly
  const docsDir = resolve(rootDir, 'docs-canonical');
  if (existsSync(docsDir) && !dirs.includes(docsDir)) {
    dirs.push(docsDir);
  }

  walk(rootDir);
  return dirs;
}
