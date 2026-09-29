// Заметки GitHub Release: раздел версии из CHANGELOG.md + дифф значений токенов с прошлым тегом.
//   node scripts/release-notes.mjs v0.4.0 > notes.md
// Раздел «Токены», вписанный `npm run release:version`, из CHANGELOG не дублируется — дифф считаем заново между тегами.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const tag = process.argv[2];
if (!/^v\d+\.\d+\.\d+/.test(tag ?? '')) {
  console.error('Использование: node scripts/release-notes.mjs v<версия>');
  process.exit(1);
}
const version = tag.slice(1);

let section = '';
if (existsSync('CHANGELOG.md')) {
  const log = readFileSync('CHANGELOG.md', 'utf8');
  const start = log.indexOf(`## ${version}\n`);
  if (start !== -1) {
    const next = log.indexOf('\n## ', start + 1);
    section = log
      .slice(start, next === -1 ? undefined : next)
      .split('\n')
      .slice(1)
      .join('\n');
    section = section.split('\n### Токены')[0].trim();
  }
}

// Тег может ещё не существовать (сухой прогон) — тогда сравниваем с текущей ревизией
let to = tag;
try {
  execFileSync('git', ['rev-parse', '--verify', '--quiet', `${tag}^{commit}`], { stdio: 'ignore' });
} catch {
  to = 'HEAD';
}
const tokens = execFileSync('node', ['scripts/tokens-changelog.mjs', '--to', to], { encoding: 'utf8' });

const install = `### Подключение

- **iOS (SPM):** \`https://github.com/indiekola/Yeet-Design-System\`, версия \`${version}\` (Up to Next Major).
- **Android (GitHub Packages):** \`implementation("design.yeet:yeet-design-system:${version}")\`, репозиторий \`https://maven.pkg.github.com/indiekola/Yeet-Design-System\` — см. README, раздел «Релизы».`;

console.log([section || '_Нет записей Changesets для этой версии._', tokens.trim(), install].join('\n\n'));
