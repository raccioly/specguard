/**
 * Init Command — Initialize CDD documentation from templates
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { c } from '../specguard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = resolve(__dirname, '../../templates');

export function runInit(projectDir, config, flags) {
  console.log(`${c.bold}🏗️  SpecGuard Init — ${config.projectName}${c.reset}`);
  console.log(`${c.dim}   Directory: ${projectDir}${c.reset}\n`);

  const created = [];
  const skipped = [];

  // Map template files to their destinations
  const fileMappings = [
    { template: 'ARCHITECTURE.md.template', dest: 'docs-canonical/ARCHITECTURE.md' },
    { template: 'DATA-MODEL.md.template', dest: 'docs-canonical/DATA-MODEL.md' },
    { template: 'SECURITY.md.template', dest: 'docs-canonical/SECURITY.md' },
    { template: 'TEST-SPEC.md.template', dest: 'docs-canonical/TEST-SPEC.md' },
    { template: 'ENVIRONMENT.md.template', dest: 'docs-canonical/ENVIRONMENT.md' },
    { template: 'AGENTS.md.template', dest: 'AGENTS.md' },
    { template: 'CHANGELOG.md.template', dest: 'CHANGELOG.md' },
    { template: 'DRIFT-LOG.md.template', dest: 'DRIFT-LOG.md' },
  ];

  for (const mapping of fileMappings) {
    const destPath = resolve(projectDir, mapping.dest);
    const templatePath = resolve(TEMPLATES_DIR, mapping.template);

    if (existsSync(destPath)) {
      skipped.push(mapping.dest);
      console.log(`  ${c.yellow}⏭️${c.reset}  ${mapping.dest} ${c.dim}(already exists)${c.reset}`);
      continue;
    }

    // Ensure directory exists
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    // Read template and write
    if (existsSync(templatePath)) {
      const content = readFileSync(templatePath, 'utf-8');
      // Replace template date placeholder with today's date
      const today = new Date().toISOString().split('T')[0];
      const processed = content.replace(/YYYY-MM-DD/g, today);
      writeFileSync(destPath, processed, 'utf-8');
      created.push(mapping.dest);
      console.log(`  ${c.green}✅${c.reset} Created: ${c.cyan}${mapping.dest}${c.reset}`);
    } else {
      console.log(
        `  ${c.red}❌${c.reset} Template not found: ${mapping.template}`
      );
    }
  }

  // Create .specguard.json if it doesn't exist
  const configPath = resolve(projectDir, '.specguard.json');
  if (!existsSync(configPath)) {
    const defaultConfig = {
      $schema: 'https://specguard.dev/schema/v0.1.json',
      projectName: config.projectName,
      version: '0.1',
      validators: {
        structure: true,
        docsSync: true,
        drift: true,
        changelog: true,
        architecture: false,
        testSpec: true,
        security: false,
        environment: true,
      },
    };
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf-8');
    created.push('.specguard.json');
    console.log(`  ${c.green}✅${c.reset} Created: ${c.cyan}.specguard.json${c.reset}`);
  } else {
    skipped.push('.specguard.json');
    console.log(`  ${c.yellow}⏭️${c.reset}  .specguard.json ${c.dim}(already exists)${c.reset}`);
  }

  // Install slash commands for AI agents — detect which agents are in use
  const commandsSourceDir = resolve(TEMPLATES_DIR, 'commands');
  if (existsSync(commandsSourceDir)) {
    const commandFiles = readdirSync(commandsSourceDir).filter(f => f.endsWith('.md'));

    // Detect which AI agent directories exist in the project
    const agentDirs = [
      { name: 'GitHub Copilot', path: '.github/commands' },
      { name: 'Cursor', path: '.cursor/rules' },
      { name: 'Google Gemini', path: '.gemini/commands' },
      { name: 'Claude Code', path: '.claude/commands' },
      { name: 'Antigravity', path: '.agents/workflows' },
    ];

    // Find which agent dirs already exist in the project
    const detected = agentDirs.filter(a =>
      existsSync(resolve(projectDir, a.path.split('/')[0])) // check parent dir exists
    );

    // If none detected, default to .github/commands (most universal)
    const targets = detected.length > 0
      ? detected
      : [{ name: 'GitHub (default)', path: '.github/commands' }];

    let totalCreated = 0;
    const installedLocations = [];

    for (const target of targets) {
      const destDir = resolve(projectDir, target.path);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      let dirCreated = 0;
      for (const file of commandFiles) {
        const destPath = resolve(destDir, file);
        if (!existsSync(destPath)) {
          const content = readFileSync(resolve(commandsSourceDir, file), 'utf-8');
          writeFileSync(destPath, content, 'utf-8');
          dirCreated++;
        }
      }

      if (dirCreated > 0) {
        totalCreated += dirCreated;
        installedLocations.push(`${target.path}/ (${target.name})`);
      }
    }

    if (totalCreated > 0) {
      created.push(`slash commands (${installedLocations.length} location(s))`);
      console.log(`  ${c.green}✅${c.reset} Installed ${c.cyan}slash commands${c.reset} for AI agents:`);
      for (const loc of installedLocations) {
        console.log(`     ${c.dim}→ ${loc}${c.reset}`);
      }
    } else {
      console.log(`  ${c.yellow}⏭️${c.reset}  Slash commands ${c.dim}(already installed)${c.reset}`);
    }
  }

  // Summary
  console.log(`\n${c.bold}  ─────────────────────────────────────${c.reset}`);
  console.log(`  ${c.green}Created:${c.reset} ${created.length} files`);
  if (skipped.length > 0) {
    console.log(`  ${c.yellow}Skipped:${c.reset} ${skipped.length} files (already exist)`);
  }

  console.log(`
  ${c.bold}Next steps:${c.reset}
  ${c.dim}The docs are skeleton templates — they need real content.${c.reset}
  ${c.dim}Your AI agent will write them. Just run:${c.reset}

  ${c.cyan}specguard fix --doc architecture${c.reset}  ${c.dim}← AI research prompt for each doc${c.reset}
  ${c.cyan}specguard fix --doc data-model${c.reset}
  ${c.cyan}specguard fix --doc security${c.reset}
  ${c.cyan}specguard fix --doc test-spec${c.reset}
  ${c.cyan}specguard fix --doc environment${c.reset}

  ${c.dim}Then verify:${c.reset} ${c.cyan}specguard guard${c.reset}
`);
}

