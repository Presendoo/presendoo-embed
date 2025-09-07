import typescript from 'rollup-plugin-typescript2';

export default [
    {
        input: 'src/index.ts',
        output: [
            { file: 'dist/index.mjs', format: 'es' },
            { file: 'dist/index.cjs', format: 'cjs' },
            { file: 'dist/presendoo-embed.js', format: 'umd', name: 'Presendoo' },
            { file: 'dist/presendoo-embed.min.js', format: 'umd', name: 'Presendoo' },
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                useTsconfigDeclarationDir: true,
            }),
        ],
    },
];
