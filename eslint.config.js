import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactDoctor from 'eslint-plugin-react-doctor';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_NESTED_DEPTH = 2;

// Fields that must never reach console, storage, or template-string interpolation
// on the client — this is a card-data entry form, not just any UI.
const SENSITIVE_FIELD_PATTERN = '/^(?:number|cvv|cvc|pan|expiry)$/i';

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'build/**'],
  },

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  security.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  sonarjs.configs.recommended,
  reactDoctor.configs.recommended,

  {
    plugins: { perfectionist, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: {
          allowDefaultProject: ['eslint.config.js', 'postcss.config.js', 'tailwind.config.js'],
        },
        tsconfigRootDir: dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // --- TypeScript strictness (finance-critical client, mirrors the backend's bar) ---
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'no-return-await': 'off', // superseded by @typescript-eslint/return-await

      // --- Import order: builtin -> external -> internal (@/) -> relative (./) ---
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 1,
          internalPattern: ['^@/.+'],
        },
      ],

      // --- React hooks correctness: stale closures / stale state are the #1 risk
      // in a checkout form (payment state read from an outdated render). ---
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // --- React runtime correctness / XSS surface ---
      'react/jsx-key': 'error',
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/prop-types': 'off', // TypeScript prop types supersede this
      'react/react-in-jsx-scope': 'off', // React 18 automatic JSX runtime

      // --- Security (browser-side card-data entry form) ---
      'security/detect-object-injection': 'off', // too many false positives on plain object field access
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'eval', message: 'eval is banned on a payment-data page.' },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'write',
          message: 'document.write is banned; it is a classic XSS vector.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.object.name='console'] MemberExpression[property.name=${SENSITIVE_FIELD_PATTERN}]`,
          message: 'Never log card number/CVV/expiry fields to the console.',
        },
        {
          selector: `CallExpression[callee.object.name=/^(localStorage|sessionStorage)$/] MemberExpression[property.name=${SENSITIVE_FIELD_PATTERN}]`,
          message: 'Never persist card number/CVV/expiry fields to Web Storage.',
        },
        {
          selector: `TemplateLiteral > MemberExpression[property.name=${SENSITIVE_FIELD_PATTERN}]`,
          message:
            'Do not interpolate card number/CVV/expiry fields into template strings (risk of accidental logging/analytics leakage).',
        },
      ],

      // --- Redundant code: catches copy-pasted logic that should be a shared
      // hook/component instead of near-identical functions per file. ---
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-boolean': 'error',

      // --- General hygiene ---
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-implicit-coercion': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // --- Complexity / readability ---
      'max-depth': ['error', MAX_NESTED_DEPTH],
      'no-nested-ternary': 'error',
      'no-lonely-if': 'error', // an `if` alone inside an `else` should be `else if`
      'no-else-return': ['error', { allowElseIf: false }],
      'id-length': [
        'error',
        {
          min: 3,
          exceptions: ['_', 'id', 'db', 'fs', 'js'],
          properties: 'never',
        },
      ],
    },
  },

  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  {
    files: ['*.js', 'tailwind.config.js', 'postcss.config.js', 'eslint.config.js'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: { ...globals.node },
    },
  },

  eslintConfigPrettier,
);
