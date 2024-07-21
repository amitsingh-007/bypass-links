import { fixupPluginRules } from '@eslint/compat';
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import playwright from 'eslint-plugin-playwright';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// !NOTE: Add types to eslint-mocked-types.d.ts if getting TS error for imports

/**
 * TODO: Plugins not yet working
 * 1. eslint-plugin-import
 * 2. airbnb and airbnb-typescript
 * 3. @next/eslint-plugin-next
 * 4. next/core-web-vitals
 * 5. eslint-plugin-deprecation
 * @link https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat();

const PATHS = {
  ROOT: path.resolve(__dirname),
  APPS: path.resolve(__dirname, 'apps'),
  PACKAGES: path.resolve(__dirname, 'packages'),
};

/**
 * @param {string} name the pugin name
 * @param {string} alias the plugin alias
 * @returns {import("eslint").ESLint.Plugin}
 */
function legacyPlugin(name, alias = name) {
  const plugin = compat.plugins(name)[0]?.plugins?.[alias];

  if (!plugin) {
    throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
  }

  return fixupPluginRules(plugin);
}

export default tseslint.config(
  // TODO: typed checks
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  // ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './packages/*/tsconfig.json',
          './apps/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  // ignore .gitignore files
  includeIgnoreFile(path.resolve(PATHS.ROOT, '.gitignore')),
  {
    ignores: ['**/*.js', '**/*.mjs', '**/*.cjs', 'apps/web/.next/'],
  },
  // react eslint config
  {
    files: ['**/*.{ts,tsx}'],
    ...reactRecommended,
    ...reactJsxRuntime,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
  // react hooks eslint config
  {
    plugins: {
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
  // turborepo eslint config
  ...compat.extends('turbo'),
  // ...compat.extends('plugin:import/typescript'),
  // {
  //   languageOptions: {
  //     ecmaVersion: 'latest',
  //     sourceType: 'module',
  //     parserOptions: {
  //       project: [
  //         './tsconfig.json',
  //         './packages/*/tsconfig.json',
  //         './apps/*/tsconfig.json',
  //       ],
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  //   settings: {
  //     'import/resolver': {
  //       typescript: {
  //         alwaysTryTypes: true,
  //         project: [
  //           './tsconfig.json',
  //           './packages/*/tsconfig.json',
  //           './apps/*/tsconfig.json',
  //         ],
  //         tsconfigRootDir: import.meta.dirname,
  //       },
  //     },
  //   },
  //   plugins: {
  //     import: legacyPlugin('eslint-plugin-import', 'import'),
  //   },
  // },
  // playwright eslint config
  {
    ...playwright.configs['flat/recommended'],
    files: ['apps/*/tests/**'],
  },
  // configure & override all rules
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],
      'playwright/expect-expect': 'off',
    },
  },
  // prettier eslint config.
  // ? NOTE: always keep this at last
  eslintPluginPrettierRecommended
);
