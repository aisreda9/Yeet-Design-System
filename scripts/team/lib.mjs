/**
 * Общее для командных скриптов: зоны, горячие и сгенерированные файлы из .github/team.json.
 * Этот же модуль читает CI (.github/workflows/team-overlap.yml), чтобы правила были в одном месте.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '../..');
export const config = JSON.parse(readFileSync(resolve(root, '.github/team.json'), 'utf8'));

/** Glob → RegExp: `**` — любые папки, `*` — часть имени без `/`. */
const toRegExp = (glob) =>
  new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*') + '$');

const compile = (list) => list.map(toRegExp);
const zoneRe = Object.entries(config.zones).map(([zone, globs]) => [zone, compile(globs)]);
const hotRe = compile(config.hot);
const genRe = compile(config.generated);

/** Первая подходящая зона файла (порядок в team.json важен: infra — последняя, общая). */
export const zoneOf = (file) => zoneRe.find(([, res]) => res.some((re) => re.test(file)))?.[0] ?? 'other';
export const zonesOf = (files) => [...new Set(files.map(zoneOf))].sort();
export const isHot = (file) => hotRe.some((re) => re.test(file));
export const isGenerated = (file) => genRe.some((re) => re.test(file));
