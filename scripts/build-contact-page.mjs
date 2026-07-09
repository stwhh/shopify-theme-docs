#!/usr/bin/env node
/**
 * Injects Forminit form ID into support/contact.md before HonKit build.
 * Set FORMINIT_FORM_ID in the environment or .docs/forminit.config.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..');
const templatePath = path.join(docsRoot, 'support', 'contact.md.template');
const outputPath = path.join(docsRoot, 'support', 'contact.md');
const configPath = path.join(docsRoot, 'forminit.config.json');

let formId = (process.env.FORMINIT_FORM_ID || '').trim();

if (!formId && fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    formId = String(config.form_id || '').trim();
  } catch {
    formId = '';
  }
}

if (!formId) {
  formId = 'YOUR_FORMINIT_FORM_ID';
}

const template = fs.readFileSync(templatePath, 'utf8');
const output = template.replaceAll('__FORMINIT_FORM_ID__', formId);
fs.writeFileSync(outputPath, output);
console.log(
  `Wrote ${path.relative(docsRoot, outputPath)} (Forminit form id: ${
    formId === 'YOUR_FORMINIT_FORM_ID' ? 'placeholder — set forminit.config.json' : 'configured'
  })`
);
