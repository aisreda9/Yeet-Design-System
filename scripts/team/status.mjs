/**
 * Кто сейчас над чем работает: активные ветки на origin, их зоны и пересечения с текущей веткой.
 *
 *   npm run team            подробно: каждая ветка, её зоны и файлы-пересечения
 *   npm run team -- --brief коротко (так его запускает SessionStart-хук)
 *
 * Работает только на git: видит всё, что запушено. Поэтому правило команды — пушить рано.
 */
import { execFileSync } from 'node:child_process';
import { config, root, zonesOf, isHot, isGenerated } from './lib.mjs';

const brief = process.argv.includes('--brief');
const git = (...args) => {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }).trim(); }
  catch { return null; }
};
const lines = (s) => (s ? s.split('\n').filter(Boolean) : []);

const fetched = git('fetch', '--quiet', '--prune', 'origin') !== null;
const base = `origin/${config.base}`;
if (git('rev-parse', '--verify', '--quiet', base) === null) {
  console.log(`Команда: нет ${base} — не с чем сравнить (нет сети или ветка не скачана).`);
  process.exit(0);
}

const current = git('rev-parse', '--abbrev-ref', 'HEAD');
const mine = new Set([
  ...lines(git('diff', '--name-only', `${base}...HEAD`)),
  ...lines(git('diff', '--name-only', 'HEAD')),
  ...lines(git('ls-files', '--others', '--exclude-standard')),
]);

const now = Date.now();
// Порог «брошенной» ветки: без коммитов дольше staleHours (TEAM.md §3 п. 7). staleDays — старое поле, запасное.
const staleHours = config.staleHours ?? (config.staleDays != null ? config.staleDays * 24 : 4);
const branches = lines(git('for-each-ref', '--format=%(refname:short)|%(committerdate:unix)|%(subject)', 'refs/remotes/origin'))
  .map((l) => { const [ref, ts, ...s] = l.split('|'); return { ref, name: ref.replace(/^origin\//, ''), days: (now / 1000 - Number(ts)) / 86400, subject: s.join('|') }; })
  .filter((b) => b.ref !== base && b.ref !== 'origin/HEAD' && b.ref !== 'origin' && b.name !== current)
  // уже влитые в базу ветки — не активны
  .filter((b) => git('merge-base', '--is-ancestor', b.ref, base) === null)
  .map((b) => {
    const files = lines(git('diff', '--name-only', `${base}...${b.ref}`));
    const overlap = files.filter((f) => mine.has(f));
    return { ...b, files, zones: zonesOf(files), overlap, stale: b.days * 24 > staleHours };
  })
  .sort((a, b) => a.days - b.days);

const age = (d) => (d < 1 / 24 ? 'меньше часа назад' : d < 1 ? `${Math.round(d * 24)} ч назад` : `${Math.round(d)} дн назад`);
const out = [];
out.push(`## Команда: активные ветки относительно ${config.base}${fetched ? '' : ' (без fetch — данные могут быть старыми)'}`);
out.push(`Ты на ветке \`${current}\`, твои зоны: ${mine.size ? zonesOf([...mine]).join(', ') : '— (изменений пока нет)'}`);

if (!branches.length) out.push('Других активных веток нет.');
for (const b of branches) {
  const stale = b.stale ? ` · ⚠ брошена (нет коммитов > ${staleHours} ч, не в лимите зоны — можно вытеснить с пометкой в issue)` : '';
  out.push(`- \`${b.name}\` · ${age(b.days)} · зоны: ${b.zones.join(', ') || '—'} · «${b.subject}»${stale}`);
  if (b.overlap.length) out.push(`  ↳ пересечение с тобой: ${b.overlap.map((f) => `\`${f}\``).join(', ')}`);
  if (!brief) {
    const hot = b.files.filter(isHot);
    const gen = b.files.filter(isGenerated);
    if (hot.length) out.push(`  ↳ горячие файлы: ${hot.join(', ')}`);
    if (gen.length) out.push(`  ↳ сгенерированные: ${gen.join(', ')}`);
  }
}

// Реальный конфликт, а не просто общий файл: пробный мерж без рабочего дерева (git merge-tree)
const conflictFiles = (a, b) => {
  try { execFileSync('git', ['merge-tree', '--write-tree', '--name-only', a, b], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }); return []; }
  catch (e) {
    if (e.status !== 1) return null;
    // формат --name-only: id дерева, имена файлов с конфликтом, пустая строка, сообщения
    const [, ...rest] = String(e.stdout ?? '').split('\n');
    const names = rest.slice(0, rest.indexOf('') < 0 ? rest.length : rest.indexOf(''));
    return [...new Set(names)].slice(0, 4);
  }
};

// Ветки, которые не сливаются с main: их владелец подтягивает main до всего остального
const stuck = branches.map((b) => ({ b, files: conflictFiles(base, b.ref) })).filter((x) => x.files && x.files.length);
if (stuck.length) {
  out.push('', `Не сливаются с ${config.base} — владелец подтягивает ${config.base} и решает конфликт у себя:`);
  for (const { b, files } of stuck) out.push(`- \`${b.name}\` (отстаёт на ${lines(git('rev-list', '--count', `${b.ref}..${base}`)).join('')} коммитов): ${files.join('; ')}`);
}

// Пересечения между чужими ветками: общий файл ≠ конфликт. Показываем только реальные конфликты;
// остальные — коротко, счётчиком (порядок мержа важен, но переделывать нечего).
const stuckNames = new Set(stuck.map((x) => x.b.name));
const real = [], soft = [];
for (let i = 0; i < branches.length; i++)
  for (let j = i + 1; j < branches.length; j++) {
    const shared = branches[i].files.filter((f) => branches[j].files.includes(f));
    if (!shared.length) continue;
    if (stuckNames.has(branches[i].name) || stuckNames.has(branches[j].name)) { soft.push(shared.length); continue; }
    const c = conflictFiles(branches[i].ref, branches[j].ref);
    if (c && c.length) real.push(`- \`${branches[i].name}\` × \`${branches[j].name}\`: ${c.join('; ')}`);
    else soft.push(shared.length);
  }
if (real.length) out.push('', 'Конфликтуют между собой (мержить по очереди, второй вливает main):', ...real);
if (soft.length) out.push('', `Ещё ${soft.length} пар веток трогают общие файлы, но сливаются без конфликта.`);

// Лимиты из team.json: перегруженные зоны и слишком широкие ветки
const limits = config.limits;
if (limits) {
  // Брошенные ветки лимит зоны не занимают (TEAM.md §7 п. 2), ширину ветки проверяем у всех
  const all = [...branches, ...(mine.size ? [{ name: `${current} (ты)`, zones: zonesOf([...mine]) }] : [])];
  const warns = [];
  for (const z of limits.limitedZones ?? []) {
    const inZone = all.filter((b) => !b.stale && b.zones.includes(z));
    if (inZone.length > limits.maxBranchesPerZone)
      warns.push(`- зона \`${z}\`: ${inZone.length} веток при лимите ${limits.maxBranchesPerZone} (${inZone.map((b) => b.name).join(', ')}) — новую не начинай, встань в очередь в issue`);
  }
  for (const b of all) {
    const zs = b.zones.filter((z) => z !== 'other');
    if (zs.length > limits.maxZonesPerBranch) warns.push(`- ветка \`${b.name}\` затрагивает ${zs.length} зон (${zs.join(', ')}) при лимите ${limits.maxZonesPerBranch} — разрежь на PR`);
  }
  if (warns.length) out.push('', 'Лимиты (TEAM.md §7):', ...warns);
}

out.push('', 'Правила: TEAM.md. Прежде чем начать — возьми задачу (issue) и не заходи в чужие зоны без договорённости в issue/PR.');
console.log(out.join('\n'));
