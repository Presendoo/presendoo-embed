import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './test/playwright',
    timeout: 10_000,
    fullyParallel: true,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:4321',
    },
    webServer: {
        command: 'npx http-server . -p 4321 -c-1 -s',
        url: 'http://127.0.0.1:4321/dist/presendoo-embed.js',
        reuseExistingServer: !process.env.CI,
        timeout: 10_000,
    },
    projects: [
        {
            name: 'mobile',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 390, height: 844 },
                isMobile: false,
            },
        },
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ],
});
