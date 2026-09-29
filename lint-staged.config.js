// pre-commit (lefthook → lint-staged). Ничего не переформатирует в уже существующих файлах:
// в src/** параллельно работают другие сессии, массовый Prettier дал бы конфликты у всех (#59).
// - ESLint и stylelint — без --fix: ошибка останавливает коммит, предупреждения — нет;
// - Prettier --write — только для файлов, которые коммит добавляет впервые.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const added = () =>
  new Set(
    execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=A', '-z'], { encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
      .map((f) => path.resolve(f)),
  );

const quote = (files) => files.map((f) => JSON.stringify(f)).join(' ');

const prettierNew = (files) => {
  const fresh = added();
  const list = files.filter((f) => fresh.has(path.resolve(f)));
  return list.length ? [`prettier --write --ignore-unknown ${quote(list)}`] : [];
};

export default {
  '*.{ts,tsx,js,mjs}': (files) => [`eslint --no-warn-ignored ${quote(files)}`, ...prettierNew(files)],
  '*.css': (files) => [`stylelint --allow-empty-input ${quote(files)}`, ...prettierNew(files)],
  '*.{json,md,mdx,yml,yaml}': prettierNew,
};
