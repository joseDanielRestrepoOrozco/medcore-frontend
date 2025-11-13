#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const patterns = [
  'http://localhost:',
  ':5173',
  'window.location.origin',
  'axios.create({ baseURL:',
  'fetch("http'
];

let any = false;
for (const p of patterns) {
  const res = spawnSync('rg', ['-n', '-F', p, 'src'], { stdio: 'inherit' });
  if (res.status === 0) any = true;
}
if (!any) {
  console.log('[check:urls] No absolute URLs detected.');
}
