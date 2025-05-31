const importPlugin = require('eslint-plugin-import')

module.exports = [
  {
    files: ['*.js', '*.ts'],
    languageOptions: {
      env: {
        es2021: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    extends: ['eslint:recommended', 'prettier'],
    rules: {
      'no-unused-vars': 'warn',
      'import/order': 'warn',
    },
  },
]
