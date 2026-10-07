# Команда: как параллельные сессии Claude и боты работают, не мешая друг другу

Над репозиторием одновременно работают несколько чатов и ботов. Каждый в своей ветке, и **друг друга они видят только через GitHub**:
пока ветка не запушена, её не видит никто. Отсюда все правила ниже.

## 1. Каналы связи — где «разговаривают» агенты

| Канал                                     | Для чего                                                                                              | Кто пишет                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Issue** с меткой `task`                 | Одна задача = один issue. Там договорённость: кто берёт, какие зоны, что готово                       | Координатор создаёт, исполнитель отмечается               |
| **Draft PR**                              | Живой статус работы и финальная передача (handoff)                                                    | Исполнитель, сразу после первого коммита                  |
| **Issue «Координация»** (закреплён, #6)   | Замок Figma, объявления о больших изменениях горячих файлов, порядок мержа                            | Все                                                       |
| `npm run team`                            | Кто сейчас в каких ветках и зонах, где пересечения                                                    | Запускается сам в начале каждой сессии (SessionStart-хук) |
| Комментарий CI «Пересечения с другими PR» | Бот `team-overlap` на каждом PR показывает общие файлы с другими открытыми PR и ставит метки `zone:*` | Автоматически                                             |

Чат с человеком — не канал для других агентов: всё, что должен узнать следующий агент, пишется в issue или PR.

## 2. Роли

Одна сессия = одна роль. Роль пишется в первом сообщении в issue и в описании PR.

| Роль                                         | Зоны (`.github/team.json`)                                              | Отвечает за                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Координатор** (человек или ведущая сессия) | все, только чтение                                                      | Режет работу на issues без пересечений зон, решает порядок мержа, снимает зависшие замки |
| **Токены и платформы**                       | `tokens`                                                                | `tokens/tokens.json`, генератор, iOS/Android. Единственный, кто меняет значения токенов  |
| **Компоненты**                               | `atoms`, `molecules`, `organisms`, `motion` — лучше одна зона на сессию | Компоненты, их CSS и stories                                                             |
| **Экраны**                                   | `screens`                                                               | `src/pages`, `src/templates`, сверка с флоу                                              |
| **Figma-синхронизация**                      | Figma + `docs/registry.ts`                                              | Пишет в Figma под замком своей секции (см. §5)                                           |
| **Документация**                             | `docs`                                                                  | MDX, `DESIGN.md`, `README.md`                                                            |
| **QA и ревью**                               | `qa`                                                                    | Скрипты проверок, ревью чужих PR. Чужой код не правит — оставляет комментарии            |
| **Инфраструктура**                           | `infra`                                                                 | CI, `package.json`, Storybook, `.claude/`                                                |

Если задаче нужна чужая зона — договориться в issue (или отдать ту часть отдельным issue), а не править молча.

## 3. Жизненный цикл задачи

1. **Осмотреться.** Прочитать вывод `npm run team` (хук показывает его при старте), открытые PR и issues с `status:in-progress`.
2. **Взять задачу.** Найти issue `task` без исполнителя или создать его по шаблону «Задача». Отметиться комментарием:
   `🔒 Беру. Роль: <роль>. Ветка: <ветка>. Зоны: <зоны>.` и поставить метку `status:in-progress`.
   Если в тех же зонах уже кто-то работает — не начинать, написать в его issue/PR и выбрать другую задачу.
3. **Запушить рано.** После первого же коммита — `git push -u` и **draft PR** в `main` с `Closes #<issue>`.
   С этого момента твою работу видят `npm run team` и CI.
4. **Работать в своих зонах.** Маленькие коммиты, одна тема на PR. Горячие файлы (§4) — минимальными точечными правками.
5. **Перед каждым пушем:** `git fetch origin && git merge origin/main` (не rebase уже запушенной ветки),
   затем `npm run tokens` (если трогал токены), `npm run typecheck`, `npm run build-storybook`.
6. **Сдать работу.** В PR заполнить раздел «Передача»: что сделано, что нет, что проверить, что делать следующему. Снять `status:in-progress`, PR — Ready for review.
7. **Бросаешь задачу — освободи её.** Комментарий `🔓 Освобождаю: <почему, где остановился>`, снять метку. Ветка, где нет коммитов дольше `staleHours` (4 часа, `.github/team.json`), считается **брошенной**: `npm run team` помечает её `⚠ брошена` и не считает в лимите зоны (§7 п. 2). Её задачу можно вытеснить — комментарий в issue `⏏ Вытесняю брошенную <ветка>: <что беру>`, — или координатор переназначает. Вернулся — сначала посмотри, не занята ли зона.

## 4. Файлы, которые ломают параллельную работу

**Сгенерированные — руками не править никогда:** `src/tokens/tokens.generated.css`, `tokens/ios/YeetTokens.swift`, `tokens/android/YeetTokens.kt`.
При конфликте в них взять любую сторону и перегенерировать: `npm run tokens`.

**Горячие (реестры и общие файлы):** `tokens/tokens.json`, `src/docs/registry.ts`, `src/pages/Pages.stories.tsx`, `src/*/index.tsx`, `src/*/*.css`, `DESIGN.md`, `package.json`, `package-lock.json`.

- Добавлять, а не переставлять: новые записи — в конец своего блока, без переформатирования и сортировки чужих строк.
- Большая правка горячего файла (рефакторинг CSS слоя, переименование токенов) — сначала объявить в issue «Координация», и в это время никто другой этот файл не трогает.
- `package-lock.json` — только через `npm install`, при конфликте перегенерировать, не склеивать руками.
- Новый компонент — в свой файл (`src/molecules/account.tsx`), а не в конец общего модуля: меньше конфликтов.

## 5. Figma — один писатель на секцию

Figma не умеет в ветки и мерж: две сессии, одновременно пишущие в одно место, затирают друг друга. Поэтому замок берётся на **секцию** страницы Design System 0.2 (или на страницу целиком), а не на весь файл (решение владельца, #147).

- Писать в Figma (`use_figma` с изменениями) можно только держа **замок**: комментарий в issue «Координация»
  `🔒 Figma: <ветка>, <страница> → <секция>, что меняю` — например `🔒 Figma: claude/sheet-58, DS 0.2 → Organisms, варианты Sheet`
  или `🔒 Figma: claude/flow-12, DS 0.2 → Pages/Экраны флоу · Light, ряд Onboarding`. Вся страница — `<страница> → вся`.
  Закончил — `🔓 Figma: <страница> → <секция> свободна`.
- Две сессии могут писать одновременно в **разные** секции. В секцию под чужим замком не пишешь — ждёшь или договариваешься в «Координации».
- **Только под замком на весь файл** (`🔒 Figma: <ветка>, весь файл, что меняю`): правки переменных коллекции «Yeet DS 2.0» и перенос, переименование, добавление или удаление секций. Весь файл берётся, когда секционных замков других сессий нет; пока он держится, никто другой в Figma не пишет.
- **Лимит частоты Figma MCP:** одновременно с Figma работают не больше 2 сессий (писатели и читатели вместе), вызовы `mcp__Figma__*` — по одному, без параллельных. Третья ждёт.
- Читать Figma (скриншоты, метаданные, переменные) можно всем и всегда — в пределах лимита частоты.
- Оригинальные страницы YeetStyle 2.0 не трогать (это же проверяет хук `.claude/hooks/figma-guard.sh`).

## 6. Мерж

- База — `main` (ветка по умолчанию). Прямых пушей в неё нет, только PR.
- Порядок мержа выбирает координатор: сначала маленькие и базовые (токены → атомы → молекулы → организмы → экраны → документация).
- После мержа любого PR остальные подтягивают базу к себе (шаг 5 цикла) до своего следующего пуша.
- Зелёный CI (`QA Storybook`) обязателен.

## 7. Как резать работу, чтобы не сталкиваться

Роли остаются прежними; меняется единица работы.

1. **Одна задача = один компонент или семейство целиком** (например, «Sheet / Dialog / Overlay» или «OutfitPager»): токен, компонент, история, экран, эталоны — в одной ветке. Резать по слоям (отдельно «CSS организмов», отдельно «истории») нельзя: так все сходятся в одних файлах.
2. **Лимит веток на зону.** В `atoms`, `molecules`, `organisms`, `screens` — не больше 2 активных веток одновременно (`limits` в `.github/team.json`). Третья не стартует: в issue пишешь `⏳ Встаю в очередь за #<issue>` и берёшь другую задачу. `npm run team` показывает перегруз. Брошенная ветка (без коммитов дольше `staleHours`, §3 п. 7) место в лимите не занимает: можно стартовать, вытеснив её с пометкой в её issue.
3. **Ветка — не больше 3 зон.** Шире — режется на несколько PR по порядку мержа (§6). Исключение: механические правки по всему репозиторию (переименование, форматирование) — только по объявлению в «Координации».
4. **CSS — по компоненту.** Стили нового или заметно переписываемого компонента живут в своём файле рядом с ним (`src/organisms/sheet.css`), а не в общем `organisms.css`. Существующий общий файл дробится постепенно: тот, кто всё равно правит компонент, выносит его блок отдельным первым коммитом.
5. **QA только смотрит.** Ветка роли QA не правит `src/**` — находки уходят комментариями и issues владельцам зон. QA правит только `scripts/qa/**`, спеки, журнал и эталоны.
6. **Эталоны (`qa/baseline/*.png`, `design/figma-specs.json`, `design/figma-flows.json`).** Не пересобирать «на всякий случай»: обновляет тот, чья правка изменила вид, только для затронутых историй. Массовое обновление эталонов — отдельный PR QA после мержа остальных.
7. **Motion остаётся одной зоной** (`src/motion/**`): пока она маленькая, дробить её на «переходы» и «жесты» не нужно.

## 8. Linear and language

The owner watches and steers in Linear (workspace `etch-design`, team **Yeet**, key `YEET`, project «Yeet Design System 0.8», milestone «0.8.0 release»). Linear-side rules — the «How we work in Linear» document.

1. **GitHub is the source of truth.** Sync is **one-way: GitHub Issues → team Yeet**. PRs, lock comments (`🔒`/`🔓`/`⏏`), `zone:*` labels and #6 «Координация» are not synced. §1–7 are unchanged. If the sync interferes with the `team-overlap` bot or the Figma lock (extra labels on PRs, duplicate comments in #6), tell the owner in Linear right away — the sync will be turned off.
2. **`needs-owner`** (in Linear — **Needs founder**). Anything waiting on the owner's decision or manual steps is a `task` issue with this label. The text says what is needed, the options and **the default you keep working on**. Synced issues get GitHub's `needs-owner` label in Linear, but the owner's «Ждёт меня» view filters on **Needs founder** — add that label in Linear too.
3. **Owner answers live in Linear.** The owner replies in Russian in Linear comments; they do **not** come back to GitHub. Before working on such a task, read its Linear comments. Then record the decision in the GitHub issue in English, reply in Linear in English with a short Russian line, and remove `needs-owner` / Needs founder.
4. **No questions in the chat.** Regular ones — a `needs-owner` issue. Urgent ones (money, public, deletion) — the same label, stated clearly at the top of the issue.
5. **PRs:** the Linear ID in the PR title (`YEET-12: …`) and `Fixes YEET-12` in the body — Linear moves the status (In Review on open, Done on merge).
6. **Project status in Linear** (on track / at risk / off track) — on Fridays and at every release: what went or goes into 0.8.0, what waits on the owner, whether CI on `main` is red. The responder session posts it. Without Linear tools, the session leaves the update text in their PR «Handoff» and the next session with Linear access posts it.
7. **No cycles** — planning by project and milestones.
8. **Language.** GitHub and the repo — English only (issues, PRs, comments, commits, docs). Existing Russian text is translated gradually, open issues first; the rest of this file is translated when someone next edits a section. Linear — English with a «По-русски» block under the text; titles English only. Storybook/UI copy stays in the product language.
