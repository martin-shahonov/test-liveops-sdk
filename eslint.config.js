import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // every if/else/for/while body must be a { } block, so `return` always sits on its own line
      curly: ['error', 'all'],
      'brace-style': 'off',
    },
  },
)
