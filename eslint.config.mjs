import antfu from '@antfu/eslint-config';

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  antfu({
    type: 'app',
    vue: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
    },
    ignores: ['.pnpm-store/**', '**/migrations/*', '**/generated/**', 'CLAUDE.md'],
  }, {
    rules: {
      'ts/no-redeclare': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],
      'no-console': ['warn'],
      'antfu/no-top-level-await': ['off'],
      'n/prefer-global/process': ['off'],
      'node/prefer-global/process': 'off',
      'n/no-process-env': 'error',
      'node/no-process-env': 'off',
      'unicorn/filename-case': ['error', {
        cases: {
          camelCase: true,
          kebabCase: true,
          pascalCase: true,
        },
        ignore: [
          'README.md',
        ],
      }],
    },
  }, {
    files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'],
    rules: {
      'perfectionist/sort-imports': ['error'],
    },
  }),
);
