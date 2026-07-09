#!/usr/bin/env node
/**
 * HonKit livereload rebuilds contact.html without our post-build hook.
 * Watch _book/support/contact.html and re-inject the form script when missing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(docsRoot, '_book', 'support', 'contact.html');
const injectScript = path.join(__dirname, 'inject-contact-script.mjs');
const port = process.env.DOCS_PORT || '19999';

let injectTimer;

function scheduleInject() {
  clearTimeout(injectTimer);
  injectTimer = setTimeout(() => {
    if (!fs.existsSync(htmlPath)) return;
    spawn(process.execPath, [injectScript], { cwd: docsRoot, stdio: 'inherit' });
  }, 200);
}

fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.watch(path.dirname(htmlPath), (_event, filename) => {
  if (filename === 'contact.html') scheduleInject();
});

spawn('npx', ['honkit', 'serve', '--port', port], {
  cwd: docsRoot,
  stdio: 'inherit',
  shell: true,
});
