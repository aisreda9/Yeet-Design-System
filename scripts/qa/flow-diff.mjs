/**
 * Сверка экранов Storybook с флоу Figma по текстовым якорям (design/figma-flows.json).
 * node scripts/qa/flow-diff.mjs [slug ...] [--tol=2] [--strict]
 * Требует собранный storybook-static. Отчёт: qa/out/flow-diff.md. --strict — код выхода 1 при расхождениях.
 * Слаг без истории (или без `.y-screen`) — ошибка всегда: такой экран не сверен.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openStory, root, startStorybook, storyIndex } from './lib.mjs';

const args = process.argv.slice(2);
const tol = Number(args.find((a) => a.startsWith('--tol='))?.slice(6) ?? 2);
const strict = args.includes('--strict');
const only = args.filter((a) => !a.startsWith('--'));
const { frames, known = {} } = JSON.parse(readFileSync(join(root, 'design/figma-flows.json'), 'utf8'));
const unknown = only.filter((s) => !frames[s]);
if (unknown.length) { console.error(`Нет в design/figma-flows.json: ${unknown.join(', ')}`); process.exit(2); }

// Осознанные замены цветов (контраст AA): цвет флоу → цвет кода.
const colorAlias = { '777777': '6e6e6e', ff4230: 'cc291b' };

const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[«»"“”„]/g, '"').replace(/[\u00a0\s]+/g, ' ').trim();
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);

const sb = await startStorybook();
const page = await sb.browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });

const lines = ['# Сверка экранов с флоу Figma', '', `Допуск ${tol} px. Цвета ${Object.entries(colorAlias).map(([a, b]) => `#${a}→#${b}`).join(', ')} считаются совпадающими (контраст).`, ''];
let total = 0, bad = 0, missing = 0, accepted = 0;
const summary = [], noStory = [];
const storyIds = new Set(storyIndex().map((e) => e.id));

for (const [slug, frame] of Object.entries(frames)) {
  if (only.length && !only.includes(slug)) continue;
  const id = `pages-экраны-флоу--${slug}`;
  // Нет истории — явная ошибка, а не «не найдено N якорей»
  if (!storyIds.has(id)) { noStory.push(slug); summary.push(`${slug.padEnd(20)} нет истории ${id}`); lines.push(`## ${slug} (${frame.id})`, '', `**Ошибка:** истории \`${id}\` нет в Storybook — экран не сверен. Переименована или удалена история? Слаг в \`design/figma-flows.json\` = id истории.`, ''); continue; }
  await openStory(page, sb.origin, id);
  await page.waitForTimeout(150);
  const texts = await page.evaluate(() => {
    const screen = document.querySelector('.y-screen');
    if (!screen) return null;
    const o = screen.getBoundingClientRect();
    const hex = (c) => { const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('') : ''; };
    const out = [];
    const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      // Текстовый блок: поднимаемся через строчные элементы (ссылки, span) до блока — как текстовый слой Figma
      let el = n.parentElement;
      const inline = (e) => { const d = getComputedStyle(e).display; return d === 'inline' || (d === 'inline-block' && e.tagName === 'A'); };
      while (el.parentElement && el !== screen && inline(el)) el = el.parentElement;
      if (seen.has(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      // Диапазон только по тексту блока — без иконок и вложенных блоков
      const nodes = [];
      const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let t = w2.nextNode(); t; t = w2.nextNode()) {
        let p = t.parentElement;
        while (p !== el && inline(p)) p = p.parentElement;
        if (p === el && t.textContent.trim()) nodes.push(t);
      }
      const range = document.createRange();
      range.setStart(nodes[0], 0);
      range.setEnd(nodes.at(-1), nodes.at(-1).textContent.length);
      const r = range.getBoundingClientRect();
      const first = range.getClientRects()[0];
      if (!r.width || !first) continue;
      // Бокс Figma = строка с line-height; range даёт область глифов, поэтому поднимаем на половину интерлиньяжа
      const lh = parseFloat(cs.lineHeight) || first.height;
      push(el, nodes.map((c) => c.textContent.trim()).join(' '), r.left, first.top - (lh - first.height) / 2, r.width, cs);
    }
    function push(el, text, x, y, w, cs) {
      out.push({ text, x: x - o.left, y: y - o.top, w, size: parseFloat(cs.fontSize), slab: /slab/i.test(cs.fontFamily), color: hex(cs.color) });
    }
    // Поля ввода: значение или плейсхолдер
    for (const el of screen.querySelectorAll('input, textarea')) {
      const text = el.value || el.placeholder;
      if (!text || el.type === 'range' || el.type === 'checkbox' || el.type === 'radio') continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.43;
      const inner = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth);
      const top = el.tagName === 'TEXTAREA' ? r.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth) : r.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth) + (inner - lh) / 2;
      const color = el.value ? cs.color : getComputedStyle(el, '::placeholder').color;
      out.push({ text, x: r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth) - o.left, y: top - o.top, w: r.width, size: parseFloat(cs.fontSize), slab: /slab/i.test(cs.fontFamily), color: hex(color) });
    }
    return out;
  });
  if (!texts) { noStory.push(slug); summary.push(`${slug.padEnd(20)} нет .y-screen`); lines.push(`## ${slug} (${frame.id})`, '', `**Ошибка:** в истории \`${id}\` нет \`.y-screen\` — экран не сверен. Экран флоу собирается через \`Screen\`.`, ''); continue; }
  const used = new Set();
  const rows = [], okRows = [];
  let screenBad = 0;
  for (const [text, x, y, w, , size, fam, color] of frame.t) {
    total++;
    const t = norm(text);
    let best = null, score = 0;
    for (const [i, c] of texts.entries()) {
      if (used.has(i)) continue;
      const ct = norm(c.text);
      let s = sim(t, ct);
      if (s < 0.8 && t.length > 6 && (ct.startsWith(t) || t.startsWith(ct))) s = 0.8;
      // При равных текстах берём ближайший
      if (s > score || (s === score && best && Math.hypot(c.x - x, c.y - y) < Math.hypot(best.x - x, best.y - y))) { best = { ...c, i }; score = s; }
    }
    const reason = known[slug]?.[text];
    if (!best || score < 0.8) {
      if (reason) { accepted++; okRows.push(`| «${text}» | не найден | ${reason} |`); continue; }
      missing++; screenBad++; rows.push(`| «${text}» | — | не найден в Storybook |`); continue;
    }
    used.add(best.i);
    // Выравнивание текста в Figma неизвестно: берём лучшее из совпадения левого края, центра и правого края
    const dxs = [best.x - x, best.x + best.w / 2 - (x + w / 2), best.x + best.w - (x + w)];
    const dx = Math.round(dxs.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a))), dy = Math.round(best.y - y);
    const issues = [];
    if (Math.abs(dx) > tol) issues.push(`x ${dx > 0 ? '+' : ''}${dx}`);
    if (Math.abs(dy) > tol) issues.push(`y ${dy > 0 ? '+' : ''}${dy}`);
    if (Math.abs(best.size - size) > 0.5) issues.push(`кегль ${best.size}≠${size}`);
    if (best.slab !== (fam === 'S')) issues.push(best.slab ? 'Slab вместо Inter' : 'Inter вместо Slab');
    const fc = colorAlias[color] ?? color;
    if (best.color !== fc) issues.push(`цвет #${best.color}≠#${color}`);
    if (score < 1) issues.push(`текст «${best.text.trim().slice(0, 40)}»`);
    if (issues.length && reason) { accepted++; okRows.push(`| «${text}» | ${issues.join(', ')} | ${reason} |`); }
    else if (issues.length) { bad++; screenBad++; rows.push(`| «${text}» | ${x},${y} → ${Math.round(best.x)},${Math.round(best.y)} | ${issues.join(', ')} |`); }
  }
  summary.push(`${slug.padEnd(20)} ${screenBad ? `${screenBad}/${frame.t.length} расхождений` : 'ок'}`);
  lines.push(`## ${slug} (${frame.id})`, '');
  if (rows.length) lines.push('| Текст | Figma → Storybook | Расхождение |', '|---|---|---|', ...rows, '');
  else lines.push('Совпадает.', '');
  if (okRows.length) lines.push('Осознанные расхождения:', '', '| Текст | Расхождение | Причина |', '|---|---|---|', ...okRows, '');
}

await sb.close();
lines.splice(4, 0, `Итого якорей ${total}: расхождений ${bad}, не найдено ${missing}, осознанных ${accepted}.${noStory.length ? ` **Экранов без истории: ${noStory.length}** (${noStory.join(', ')}).` : ''}`, '');
mkdirSync(join(root, 'qa/out'), { recursive: true });
writeFileSync(join(root, 'qa/out/flow-diff.md'), lines.join('\n'));
console.log(summary.join('\n'));
console.log(`\nЯкорей ${total}: расхождений ${bad}, не найдено ${missing}, осознанных ${accepted}. Отчёт: qa/out/flow-diff.md`);
if (noStory.length) console.error(`Экраны без истории (не сверены): ${noStory.join(', ')}`);
if (noStory.length || (strict && (bad || missing))) process.exit(1);
