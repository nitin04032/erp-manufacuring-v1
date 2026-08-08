// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        // test/*.ts (e2e specs) aren't included by tsconfig.json's build
        // config (deliberately — rootDir: "./src" means test files must
        // stay out of it) or by any other tsconfig, so the project
        // service can't otherwise find a project for them. allowDefaultProject
        // is typescript-eslint's sanctioned escape hatch for exactly this
        // (config files, test files) — an ad-hoc in-memory project using
        // the nearest tsconfig's compiler options, just for linting.
        projectService: {
          allowDefaultProject: ['test/*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);