const importPlugin = require('eslint-plugin-import');
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...require('globals').node,
        ...require('globals').es2021,
        ...require('globals').jest,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'import/order': 'warn',
    },
  },
];
