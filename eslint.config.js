// eslint.config.js
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    ...tseslint.configs.recommended,
    {
        plugins: {
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
];
