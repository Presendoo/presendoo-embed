import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.ROLLUP_WATCH === 'true';

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
            ...(isDev
                ? [
                      serve({
                          contentBase: '.',
                          port: 4000,
                          open: true,
                          openPage: '/test/manual/index.html',
                          headers: { 'Cache-Control': 'no-store' },
                      }),
                      livereload({ watch: 'dist', delay: 100 }),
                  ]
                : []),
        ],
    },
];
