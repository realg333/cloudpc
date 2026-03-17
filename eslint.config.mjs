import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
