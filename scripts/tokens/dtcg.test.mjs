// Проверка валидатора DTCG: node --test scripts/tokens/ (запускается в CI, qa.yml).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTokens, validate } from './dtcg.mjs';

const root = new URL('../../', import.meta.url);
const fresh = () => readTokens(root);
const expectError = (tree, re) => {
  const errors = validate(tree);
  assert.ok(errors.some((e) => re.test(e)), `ожидалась ошибка ${re}, получено:\n${errors.join('\n') || '(нет ошибок)'}`);
};

test('tokens/tokens.json проходит проверку', () => {
  assert.deepEqual(validate(fresh()), []);
});

test('битая ссылка — ошибка', () => {
  const t = fresh();
  t.component['button-primary-bg'].$value = '{color.emphasis.nope}';
  expectError(t, /button-primary-bg: битая ссылка \{color\.emphasis\.nope\}/);
});

test('ссылка на токен другого типа — ошибка', () => {
  const t = fresh();
  t.component['card-bg'].$value = '{radius.lg}';
  expectError(t, /card-bg: ссылка \{radius\.lg\}: тип dimension, ожидается color/);
});

test('битая ссылка в теме и внутри составного значения — ошибка', () => {
  const t = fresh();
  t.color.surface['bg-canvas'].$extensions['com.yeet'].modes.dark = '{primitive.nope}';
  t.typography.h1.$value.fontFamily = '{font.nope}';
  expectError(t, /bg-canvas \(modes\.dark\): битая ссылка/);
  expectError(t, /typography\.h1: битая ссылка \{font\.nope\}/);
});

test('неизвестный тип — ошибка', () => {
  const t = fresh();
  t.radius.$type = 'size';
  expectError(t, /radius: неизвестный тип "size"/);
});

test('значение не по типу — ошибка', () => {
  const t = fresh();
  t.space['4'].$value = 4;
  t.primitive['blue-500'].$value.hex = '#0000FF';
  expectError(t, /space\.4: размер/);
  expectError(t, /blue-500: hex #0000FF не совпадает/);
});

test('цикл ссылок — ошибка', () => {
  const t = fresh();
  t.component['card-bg'].$value = '{component.input-bg}';
  t.component['input-bg'].$value = '{component.card-bg}';
  expectError(t, /циклическая ссылка/);
});

test('бренд не может вводить новый семантический цвет', () => {
  const t = fresh();
  const id = Object.keys(t.brand).find((k) => !k.startsWith('$'));
  t.brand[id]['bg-new'] = { $value: t.brand[id].accent.$value };
  expectError(t, /бренд переопределяет несуществующий семантический цвет bg-new/);
});

test('неизвестная тема в modes — ошибка', () => {
  const t = fresh();
  t.color.surface['bg-canvas'].$extensions['com.yeet'].modes.sepia = '{primitive.neutral-0}';
  expectError(t, /modes\.sepia: нет такой темы/);
});

test('after — ссылка на dimension-токен', () => {
  const t = fresh();
  t.component['sheet-top-gap'].$extensions['com.yeet'].after = '{color.surface.bg-canvas}';
  expectError(t, /sheet-top-gap \(after\): ссылка \{color\.surface\.bg-canvas\}: тип color, ожидается dimension/);
});
