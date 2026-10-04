/**
 * Порядок «Pages / Экраны флоу» (#174): копирует список из src/docs/flow-order.ts в storySort `.storybook/preview.tsx`
 * (Storybook читает storySort статически — только литерал, без импортов).
 *   node scripts/flow-order.mjs          — переписать блок между маркерами flow-order в preview.tsx
 *   node scripts/flow-order.mjs --check  — ошибка, если preview отстал от списка или история Pages не в списке (и наоборот)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const { FLOW_ORDER, FLOW_STORY_ORDER } = await import(join(root, 'src/docs/flow-order.ts'));

const errors = [];

// 1. Список ↔ истории: имена историй `Pages/Экраны флоу` из src/pages/*.stories.tsx
const pagesDir = join(root, 'src/pages');
const actual = new Map();
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.stories.tsx'))) {
  const src = readFileSync(join(pagesDir, file), 'utf8');
  if (!src.includes("title: 'Pages/Экраны флоу'")) continue;
  for (const m of src.matchAll(/export const \w+: Story = \{\s*name: '([^']+)'/g))
    actual.set(m[1], file.replace('.stories.tsx', ''));
}
const listed = new Map();
for (const r of FLOW_ORDER)
  for (const s of r.stories) {
    if (listed.has(s)) errors.push(`дубль в flow-order.ts: «${s}»`);
    listed.set(s, r.row);
  }
for (const [name, file] of actual) {
  if (!listed.has(name)) errors.push(`история не в flow-order.ts: «${name}» (${file}.stories.tsx)`);
  else if (listed.get(name) !== file) errors.push(`«${name}» в ряду ${listed.get(name)}, а файл — ${file}.stories.tsx`);
}
for (const name of listed.keys()) if (!actual.has(name)) errors.push(`в flow-order.ts нет такой истории: «${name}»`);

// 2. preview.tsx между маркерами
const previewPath = join(root, '.storybook/preview.tsx');
const preview = readFileSync(previewPath, 'utf8');
const re = /([ \t]*)\/\/ flow-order:start[^\n]*\n[\s\S]*?\/\/ flow-order:end/;
const m = preview.match(re);
if (!m) errors.push('в .storybook/preview.tsx нет маркеров // flow-order:start … // flow-order:end');
else {
  const pad = m[1];
  const lines = FLOW_STORY_ORDER.map((s) => `${pad}  ${JSON.stringify(s).replace(/^"|"$/g, "'")},`);
  const block = `${pad}// flow-order:start — копия src/docs/flow-order.ts, править там и запускать node scripts/flow-order.mjs\n${pad}[\n${lines.join('\n')}\n${pad}],\n${pad}// flow-order:end`;
  const next = preview.replace(re, block);
  if (next !== preview) {
    if (check)
      errors.push('.storybook/preview.tsx отстал от src/docs/flow-order.ts: запусти node scripts/flow-order.mjs');
    else {
      writeFileSync(previewPath, next);
      console.log('preview.tsx: storySort обновлён');
    }
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`flow-order: ${FLOW_ORDER.length} рядов, ${FLOW_STORY_ORDER.length} историй — ок`);
