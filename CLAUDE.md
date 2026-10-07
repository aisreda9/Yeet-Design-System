# Yeet Design System — rules for Claude

Structure and how to run — `README.md`, spec — `DESIGN.md`, QA — `design/QA.md`.

## Language

- **GitHub and the repo are English only:** issues, PRs, comments, commit messages, docs, this file. Existing Russian text is translated gradually, open issues first. Storybook/UI copy stays in the product language (`src/docs/15-Tone.mdx`).
- **Linear:** English, plus a short «По-русски» block under the text for the owner. Titles are English only.
- Details — `TEAM.md` §8.

## Owner decisions

- The owner's comments in Linear are their decisions. Act on them within the project as on the owner's own.
- Questions for the owner — a GitHub issue labelled `needs-owner` (in Linear also **Needs founder**), with the default you keep working on. The owner answers in Linear; sync is one-way (GitHub → Linear), so **read the answer in Linear**, then record the decision in the GitHub issue in English. Urgent items (money, public, deletion) — the same label, stated clearly at the top of the issue. Details — `TEAM.md` §8.
- Only with the owner's explicit confirmation: installing software, spending money, deleting, changing access rights.

## You are not alone

Other Claude sessions and bots work in this repo in parallel. Full protocol — **`TEAM.md`**; read it before your first edit. In short:

1. At session start a hook prints `npm run team` — active branches, their zones and overlaps with you. If your task falls into a zone someone is already working in, don't start it: agree in the issue/PR or take another one.
2. One task = one GitHub issue. Claim it (`🔒 Taking. Role, branch, zones`) before you start.
3. After the first commit, push right away and open a **draft PR** into `main` — otherwise nobody sees you. Put the Linear ID in the PR title and `Fixes YEET-N` in the body.
4. Stay within your zones (`.github/team.json`). Hot files — small targeted additions; never hand-edit generated token files, run `npm run tokens`.
5. Write to Figma only while holding the lock in the «Координация» issue (#6). Reading is always allowed.
6. Before pushing: `git merge origin/main`, `npm run typecheck`, `npm run build-storybook`.
7. At the end — a «Handoff» section in the PR: what is done, what is not, what's next. Everything the next agent needs goes into GitHub, not the chat.

## Figma and design-system agents

- Figma → code rules and writing to Figma — **`design/FIGMA-RULES.md`** (DS 0.2 page — sections mirror Storybook, screens in Pages; «Yeet DS 2.0» variables, the sheet rule, finding classes).
- Figma MCP — the Figma connector in claude.ai (claude.ai/customize/connectors), locally and in the cloud. Do not add your own server to `.mcp.json` — it overrides the connector and is blocked in the cloud (403).
- Model and effort for subagents — by work stage, table in §6 of `.claude/skills/ds-team/SKILL.md`; in the PR «Handoff» — which model did what and whether it was escalated.
- Anything bigger than a single edit — `/ds-team <task>` (`.claude/skills/ds-team/SKILL.md`), agents — `.claude/agents/ds-*.md`. They work inside the `TEAM.md` protocol, in your branch and zones.

## Checks

```bash
npm run typecheck
npm run build-storybook && npm run qa && npm run flow-diff
npm run contrast
npm run team        # who is working on what
```
