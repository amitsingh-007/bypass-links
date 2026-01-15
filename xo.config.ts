import { type FlatXoConfig } from 'xo';
import nextPlugin from '@next/eslint-plugin-next';

const xoConfig: FlatXoConfig = [
  {
    prettier: true,
    react: true,
    space: true,
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
    files: 'apps/web/**/*.{ts,tsx}',
  },
  {
    ignores: ['apps/web/next-env.d.ts'],
  },
  {
    rules: {
      camelcase: 'off',
      'no-alert': 'off',
      'no-undef': 'off',
      'no-restricted-globals': 'off',
      'no-await-in-loop': 'off',
      'promise/prefer-await-to-then': 'off',
      'capitalized-comments': 'off',
      'n/prefer-global/process': 'off',

      'react/react-in-jsx-scope': 'off',
      'react/boolean-prop-naming': 'off',
      'react/prefer-read-only-props': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-leaked-render': 'off',

      'import-x/extensions': 'off',
      'import-x/no-unassigned-import': 'off',

      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@stylistic/padding-line-between-statements': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',

      'unicorn/filename-case': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-node-protocol': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/no-base-to-string': [
        'error',
        { ignoredTypeNames: ['TRPCError', 'URL', 'URLSearchParams'] },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allow: ['TRPCError', 'Date'] },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: true,
          requireDefaultForNonUnion: true,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
];

export default xoConfig;
