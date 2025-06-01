import { type FlatXoConfig } from 'xo';

const xoConfig: FlatXoConfig = [
  {
    prettier: true,
    react: true,
    space: true,
  },
  {
    ignores: ['apps/web/next-env.d.ts'],
  },
  {
    rules: {
      'no-alert': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/boolean-prop-naming': 'off',
      'import-x/extensions': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-query-selector': 'off',
      'promise/prefer-await-to-then': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/no-base-to-string': [
        'error',
        {
          ignoredTypeNames: ['TRPCError'],
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allow: ['TRPCError', 'Date'],
        },
      ],
      'react/prefer-read-only-props': 'off', // TODO: turn on later
      '@typescript-eslint/consistent-type-imports': 'off', // TODO: turn on later
      'react/function-component-definition': 'off', // TODO: turn on later maybe?????????????
      '@typescript-eslint/no-floating-promises': 'off', // TODO: turn on later maybe?????????????
      'react/jsx-sort-props': 'off', // TODO: turn on later
      '@typescript-eslint/consistent-type-definitions': 'off', // TODO: turn on later
      '@stylistic/padding-line-between-statements': 'off', // TODO: turn on later
      'unicorn/prevent-abbreviations': 'off', // TODO: turn on later
      'object-shorthand': 'off', // TODO: turn on later
      '@typescript-eslint/naming-convention': 'off', // TODO: turn on later maybe?????????????
      '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: turn on later
      '@typescript-eslint/consistent-type-exports': 'off', // TODO: turn on later
      '@typescript-eslint/no-unsafe-return': 'off', // TODO: turn on later
      camelcase: 'off', // TODO: turn on later
      'import-x/no-unassigned-import': 'off', // TODO: turn on later
      '@typescript-eslint/no-unsafe-argument': 'off', // TODO: turn on later
      'unicorn/prefer-global-this': 'off', // TODO: turn on later
      'no-undef': 'off', // TODO: turn on later
      'unicorn/prefer-top-level-await': 'off', // TODO: turn on later
      'no-empty-pattern': 'off', // TODO: turn on later
      '@typescript-eslint/no-restricted-types': 'off', // TODO: turn on later
      'no-restricted-globals': 'off', // TODO: turn on later
      '@typescript-eslint/no-empty-function': 'off', // TODO: turn on later
      'react/jsx-no-leaked-render': 'off', // TODO: turn on later
      'no-await-in-loop': 'off', // TODO: turn on later
      'unicorn/no-useless-promise-resolve-reject': 'off', // TODO: turn on later
      'unicorn/prefer-dom-node-dataset': 'off', // TODO: turn on later
      '@typescript-eslint/switch-exhaustiveness-check': 'off', // TODO: turn on later
    },
  },
];

export default xoConfig;
