// Prettier только для НОВЫХ файлов ветки (добавленных относительно базы) — старые не переформатируем,
// чтобы не ломать параллельную работу в src/** (#59). Без --strict сообщает и выходит с 0.
//   node scripts/format-check.mjs [--base origin/main] [--strict]
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'origin/main';
const strict = args.includes('--strict');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });

const added = git('diff', '--name-only', '--diff-filter=A', '-z', `${base}...HEAD`).split('\0').filter(Boolean);
if (!added.length) {
  console.log(`format-check: новых файлов относительно ${base} нет`);
  process.exit(0);
}

let unformatted = [];
try {
  execFileSync('npx', ['prettier', '--list-different', '--ignore-unknown', ...added], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
} catch (e) {
  if (e.status !== 1) throw e; // 1 — есть неотформатированные, 2 — ошибка Prettier
  unformatted = e.stdout.split('\n').filter(Boolean);
}

const gh = !!process.env.GITHUB_ACTIONS;
for (const f of unformatted) {
  console.log(gh ? `::warning file=${f}::Новый файл не по Prettier — npx prettier --write ${f}` : `✗ ${f}`);
}
console.log(`format-check: ${added.length} новых файлов, не по Prettier — ${unformatted.length}`);
process.exit(strict && unformatted.length ? 1 : 0);
