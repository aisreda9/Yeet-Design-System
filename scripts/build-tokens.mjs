// Сборка токенов на Style Dictionary v5: tokens/tokens.json (DTCG) → CSS (Storybook), Swift (iOS), Kotlin (Android).
// Проверка схемы и ссылок — scripts/tokens/dtcg.mjs, трансформы — scripts/tokens/transforms.mjs, форматы — scripts/tokens/formats.mjs.
// Плюс Android-модуль native/android: иконки (ImageVector) и шрифты res/font — см. scripts/android.mjs; Swift Package — scripts/build-ios.mjs.
// Запуск: npm run tokens. Сгенерированные файлы не правятся руками.
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { buildIosPackage } from './build-ios.mjs';
import { ANDROID_MODULE, androidOutputs, copyAndroidFonts } from './android.mjs';
import { assertValid, expandModes, readTokens } from './tokens/dtcg.mjs';
import { registerTransforms, SWIFT_KEYWORDS } from './tokens/transforms.mjs';
import { css, HEADER, kotlin, swift } from './tokens/formats.mjs';
import { toModel } from '../src/tokens/model.js';

const root = new URL('../', import.meta.url);
const source = readTokens(root);
assertValid(source);

registerTransforms(StyleDictionary);
StyleDictionary.registerFormat({ name: 'yeet/css', format: (args) => css(args, source) });
StyleDictionary.registerFormat({ name: 'yeet/swift', format: (args) => swift(args, source) });
StyleDictionary.registerFormat({ name: 'yeet/kotlin', format: (args) => kotlin(args, source) });

const sd = new StyleDictionary({
  tokens: expandModes(source),
  usesDtcg: true,
  // Предупреждение SD о совпадающих именах отключено: в Swift/Kotlin имена живут в своих enum/object
  // (YeetMotion.select и YeetHaptic.select), а битые ссылки и типы ловит assertValid до сборки.
  log: { verbosity: 'silent', warnings: 'disabled' },
  platforms: {
    css: { transformGroup: 'yeet/css', buildPath: fileURLToPath(root), files: [{ destination: 'src/tokens/tokens.generated.css', format: 'yeet/css' }] },
    swift: {
      transformGroup: 'yeet/swift',
      buildPath: fileURLToPath(root),
      files: [
        { destination: 'tokens/ios/YeetTokens.swift', format: 'yeet/swift', options: { bundle: 'main' } },
        // Swift Package native/ios: те же токены, шрифты регистрируются из ресурсов пакета (Bundle.module)
        { destination: 'native/ios/Sources/YeetDesignSystem/Generated/YeetTokens.swift', format: 'yeet/swift', options: { bundle: 'module' } },
      ],
    },
    kotlin: {
      transformGroup: 'yeet/kotlin',
      buildPath: fileURLToPath(root),
      files: [
        { destination: 'tokens/android/YeetTokens.kt', format: 'yeet/kotlin' },
        { destination: `${ANDROID_MODULE}/java/design/yeet/tokens/YeetTokens.kt`, format: 'yeet/kotlin' },
      ],
    },
  },
});
await sd.buildAllPlatforms();

// Иконки и шрифты для нативных модулей (не токены — отдельные генераторы)
const { writeFileSync, mkdirSync } = await import('node:fs');
for (const [path, body] of Object.entries(androidOutputs(root))) {
  const url = new URL(path, root);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, body);
  console.log(`✓ ${path}`);
}
buildIosPackage(root, { header: HEADER, swiftKeywords: SWIFT_KEYWORDS });
copyAndroidFonts(root, toModel(source).font);
