#!/usr/bin/env node
/**
 * Local docs preview for Windows-friendly localhost binding.
 * HonKit's built-in `serve` binds 0.0.0.0 which can fail with EACCES on some Windows setups.
 */

import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, watch } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bookDir = join(root, '_book');
const host = process.env.DOCS_HOST || '127.0.0.1';
const port = Number(process.env.DOCS_PORT || 8766);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function build() {
  console.log('Building docs...');
  execSync('npx honkit build', { cwd: root, stdio: 'inherit' });
}

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  let filePath = normalize(join(bookDir, pathname.replace(/^\//, '')));

  if (!filePath.startsWith(bookDir)) return null;

  if (pathname.endsWith('/')) {
    filePath = join(filePath, 'index.html');
  } else if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  } else if (!extname(filePath) && existsSync(`${filePath}.html`)) {
    filePath += '.html';
  }

  return existsSync(filePath) ? filePath : null;
}

function startServer() {
  const server = createServer((req, res) => {
    const filePath = resolveFile(req.url || '/');

    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  });

  server.on('error', error => {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use. Try: DOCS_PORT=${port + 1} npm run serve`);
      process.exit(1);
    }
    throw error;
  });

  server.listen(port, host, () => {
    console.log(`Docs preview: http://${host}:${port}/`);
    console.log('Watching .md files — save to rebuild. Press Ctrl+C to quit.');
  });
}

let buildTimer;
function scheduleBuild() {
  clearTimeout(buildTimer);
  buildTimer = setTimeout(() => {
    try {
      build();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }, 400);
}

function shouldRebuild(filename) {
  if (!filename) return false;
  if (filename.includes('node_modules') || filename.startsWith('_book')) return false;
  return /\.(md|json|ya?ml)$/i.test(filename);
}

build();
startServer();

try {
  watch(root, { recursive: true }, (_event, filename) => {
    if (shouldRebuild(filename)) scheduleBuild();
  });
} catch {
  watch(root, (_event, filename) => {
    if (shouldRebuild(filename)) scheduleBuild();
  });
}

