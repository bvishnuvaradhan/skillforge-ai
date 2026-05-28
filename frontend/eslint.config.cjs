const { FlatCompat } = require('@eslint/eslintrc');
const { configs } = require('@eslint/js');

// Use FlatCompat to reuse the existing .eslintrc.json/legacy configs.
// `recommendedConfig` is required for this version of FlatCompat.
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: configs.recommended });

module.exports = [
  // Use the core recommended config only to avoid circular plugin resolution.
  ...compat.extends('eslint:recommended'),
  // Add environment and parser options for the frontend source.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        FileReader: 'readonly',
        process: 'readonly',
      },
    },
  },
  // Project-specific rule overrides to reduce noise during phased fixes
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Re-enable no-unused-vars as warnings to surface unused symbols for incremental fixes.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
    },
  },
  // TypeScript files: use the TypeScript parser and basic plugin so types parse correctly
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    }
  }
];
