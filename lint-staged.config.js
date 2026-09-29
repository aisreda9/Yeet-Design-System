// pre-commit (lefthook → lint-staged). Ничего не переформатирует в уже существующих файлах:
// в src/** параллельно работают другие сессии, массовый Prettier дал бы конфликты у всех (#59).
// - ESLint и stylelint — без --fix: ошибка останавливает коммит, предупреждения — нет;
// - Prettier --write — только для файлов, которые коммит добавляет впервые.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Коммит слияния (git merge origin/main) несёт чужие файлы: «добавленные» в нём — это новые файлы из main.
// Их не форматируем и не линтуем здесь — это уже сделал CI того PR.
const merging = (() => {
  try {
    return existsSync(execFileSync('git', ['rev-parse', '--git-path', 'MERGE_HEAD'], { encoding: 'utf8' }).trim());
  } catch {
    return false;
  }
})();

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

// Пустой список задач — lint-staged пропускает группу (пустой конфиг он не принимает)
const unlessMerging = (tasks) => (files) => (merging ? [] : tasks(files));

export default {
  '*.{ts,tsx,js,mjs}': unlessMerging((files) => [`eslint --no-warn-ignored ${quote(files)}`, ...prettierNew(files)]),
  '*.css': unlessMerging((files) => [`stylelint --allow-empty-input ${quote(files)}`, ...prettierNew(files)]),
  '*.{json,md,mdx,yml,yaml}': unlessMerging(prettierNew),
};
