// ESLint (flat config): TypeScript, React Hooks, jsx-a11y, Storybook.
// Правило, которое текущий код нарушает, — `warn` (список в #59, чинят владельцы зон), а не `error`:
// в src/** параллельно работают другие сессии, массовых автофиксов нет. Починили — переводим в `error`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['node_modules', 'storybook-static', 'qa/out', '.downloads', 'native', 'src/tokens/tokens.generated.css'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
  { files: ['src/**/*.tsx'], ...jsxA11y.flatConfigs.recommended },
  ...storybook.configs['flat/recommended'],
  {
    files: ['scripts/**/*.{js,mjs}', '*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  // QA-скрипты передают функции в page.evaluate — они выполняются в браузере
  { files: ['scripts/qa/**/*.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  // Нарушаются в текущем коде (29.09) → warn. Список по зонам — в #59. Починили правило целиком — удалить строку.
  {
    rules: {
      // В коде принято `cond ? a() : b()` и `x && f()` как инструкции
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/refs': 'warn', // motion/Mechanics, organisms/crop, utils/usePresence
      'react-hooks/exhaustive-deps': 'warn', // templates/index
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'jsx-a11y/anchor-has-content': 'warn', // atoms/link
      'jsx-a11y/anchor-is-valid': 'warn', // pages/Onboarding.stories
      'jsx-a11y/interactive-supports-focus': 'warn', // molecules/selection
      'jsx-a11y/no-noninteractive-element-interactions': 'warn', // organisms/crop, overlays, pager
      'jsx-a11y/no-noninteractive-tabindex': 'warn', // organisms/crop, templates/index
      'jsx-a11y/no-static-element-interactions': 'warn', // organisms/overlays
      'jsx-a11y/click-events-have-key-events': 'warn', // organisms/pager
    },
  },
);
