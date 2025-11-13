#!/usr/bin/env node
/*
  AutoDoc: Inserta comentarios JSDoc en español antes de funciones y componentes React.
  Uso: npm run annotate:comments
  Idempotente: omite si ya existe un bloque que empieza con "/** AutoDoc".
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const exts = new Set(['.ts', '.tsx']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function hasAutoDocAbove(lines, i) {
  const prev = Math.max(0, i - 1);
  return /\/\*\*\s*AutoDoc/.test(lines[prev] || '');
}

function insertFileBanner(lines, fileRel) {
  if (lines[0] && lines[0].includes('@file')) return lines;
  const banner = [
    '/**',
    ` * @file ${fileRel}`,
    ' * Descripción: TODO — añade una breve descripción del módulo.',
    ' */',
    '',
  ];
  return [...banner, ...lines];
}

function makeDocBlock(kind, name) {
  return [
    '/** AutoDoc',
    ` * ${kind}: ${name}`,
    ' * Descripción: TODO — describe el propósito y responsabilidades.',
    ' * Props: TODO — documenta propiedades si aplica.',
    ' */',
  ];
}

function annotate(content, file) {
  const rel = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');
  const lines = content.split(/\r?\n/);
  let out = insertFileBanner(lines, rel);

  // patrones básicos
  const patterns = [
    { re: /^export\s+default\s+function\s+(\w+)\s*\(/, kind: 'Componente/Función' },
    { re: /^export\s+function\s+(\w+)\s*\(/, kind: 'Función' },
    { re: /^const\s+(\w+)\s*:\s*React\.[A-Za-z0-9_<>?,\s]+=?\s*=?\s*\(/, kind: 'Componente' },
    { re: /^const\s+(\w+)\s*=\s*\(/, kind: 'Función' },
    { re: /^function\s+(\w+)\s*\(/, kind: 'Función' },
  ];

  // recorre e inserta por encima cuando aplique
  for (let i = 0; i < out.length; i++) {
    const line = out[i];
    for (const p of patterns) {
      const m = line.match(p.re);
      if (m && !hasAutoDocAbove(out, i)) {
        const name = m[1];
        const block = makeDocBlock(p.kind, name);
        out.splice(i, 0, ...block);
        i += block.length; // salta lo insertado
        break;
      }
    }
  }
  return out.join('\n');
}

function run() {
  const files = walk(ROOT);
  let changed = 0;
  for (const f of files) {
    try {
      const src = fs.readFileSync(f, 'utf8');
      const out = annotate(src, f);
      if (out !== src) {
        fs.writeFileSync(f, out, 'utf8');
        changed++;
      }
    } catch (e) {
      console.error('[AutoDoc] Error en', f, e.message);
    }
  }
  console.log(`[AutoDoc] Archivos actualizados: ${changed}`);
}

run();

