#!/usr/bin/env node
/**
 * HonKit does not inject book.json "javascript" into HTML. Append the contact
 * form handler to the built contact page only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(docsRoot, '_book', 'support', 'contact.html');
const scriptTag = '<script src="../javascript/support-contact-form.js"></script>';

if (!fs.existsSync(htmlPath)) {
  console.warn('inject-contact-script: contact.html not found, skipping');
  process.exit(0);
}

let html = fs.readFileSync(htmlPath, 'utf8');

if (html.includes('support-contact-form.js')) {
  console.log('inject-contact-script: already present');
  process.exit(0);
}

html = html.replace('</body>', `    ${scriptTag}\n</body>`);
fs.writeFileSync(htmlPath, html);
console.log('inject-contact-script: added support-contact-form.js to contact.html');
