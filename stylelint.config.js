// stylelint: ошибки CSS (stylelint-config-recommended) + правила дизайн-системы.
// Значения — только через токены `var(--…)`: hex, сырые px и z-index вне токенов пока `warn`
// (в текущем CSS они есть, список по зонам — в #59). Когда зона вычищена — поднимаем до `error`.
/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-recommended'],
  ignoreFiles: ['node_modules/**', 'storybook-static/**', 'qa/out/**', 'native/**', 'src/tokens/tokens.generated.css'],
  rules: {
    // Нарушаются в текущем CSS (29.09) → warn, см. #59
    'no-descending-specificity': [true, { severity: 'warning' }], // atoms, molecules, motion, organisms
    'no-duplicate-selectors': [true, { severity: 'warning' }], // atoms, molecules, motion
    'color-no-hex': [true, { severity: 'warning' }],
    'unit-disallowed-list': [
      ['px'],
      {
        severity: 'warning',
        // Волосяные линии и фокус-кольца в px допустимы; медиазапросы — тоже
        ignoreProperties: { px: ['/^border/', '/^outline/'] },
        ignoreMediaFeatureNames: { px: ['/width$/', '/height$/'] },
      },
    ],
    'declaration-property-value-allowed-list': [
      { 'z-index': ['/^var\\(--/', 'auto', '0', '-1', '1'] },
      { severity: 'warning' },
    ],
  },
};
