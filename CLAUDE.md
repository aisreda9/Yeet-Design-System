# Yeet Design System — правила для Claude

Дизайн-система приложения YeetStyle. Полная спецификация — `DESIGN.md`, процесс QA — `design/QA.md`, структура — `README.md`.

## Инварианты
- Источник правды — Figma `1LAkot5WySMWhwiiFJqJ0e`, страница **Design System 2.0 (Claude)** `942:5666`, коллекция **«Yeet DS 2.0»**. Оригинальные страницы и коллекция «Yeet Design System» — только чтение.
- Значения токенов — только в `tokens/tokens.json` → `npm run tokens`. Сгенерированные файлы руками не правятся.
- Слои `tokens → atoms → molecules → organisms → templates → pages`; импорт только вниз и через `index.tsx` слоя. В компонентах — только семантические и компонентные токены, без hex и `--yeet-*`.
- Тексты — на «ты», без родовых окончаний (`DESIGN.md` §8).
- Любой компонент: Figma + код + story (Playground, варианты, «В флоу») + `src/docs/registry.ts` + `design/figma-specs.json` + Light/Dark.

## Проверки
`npm run typecheck` · `npm run contrast` · `npm run build-storybook && npm run qa` · `npm run flow-diff`

## Команда
Задачи крупнее одной правки — через `/ds-team <задача>` (`.claude/skills/ds-team/SKILL.md`), агенты в `.claude/agents/ds-*.md`.
