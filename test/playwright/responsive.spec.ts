import { test, expect } from '@playwright/test';

const FIXTURE_URL = '/test/playwright/fixture.html';

test.describe('addFrame responsive sizing', () => {
    test('responsive container overrides host CSS on mobile', async ({
        page,
        isMobile,
        viewport,
    }) => {
        await page.goto(FIXTURE_URL);
        await page.waitForFunction(
            () => !!document.querySelector('#presendoo-view-responsive iframe'),
        );

        const result = await page.evaluate(() => {
            const el = document.getElementById('presendoo-view-responsive')!;
            const cs = getComputedStyle(el);
            return {
                inlineStyle: el.getAttribute('style') ?? '',
                aspectRatio: cs.aspectRatio,
                maxWidth: cs.maxWidth,
                widthPx: parseFloat(cs.width),
                heightPx: parseFloat(cs.height),
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            };
        });

        if (isMobile || (viewport && viewport.width <= 768)) {
            expect(result.inlineStyle).toContain('95vw');
            expect(result.inlineStyle).toContain('90vh');
            expect(result.aspectRatio).toBe('auto');
            expect(result.maxWidth).toBe('none');
            expect(result.widthPx).toBeCloseTo(result.innerWidth * 0.95, 0);
            expect(result.heightPx).toBeCloseTo(result.innerHeight * 0.9, 0);
        } else {
            expect(result.inlineStyle).toBe('');
            expect(result.aspectRatio).not.toBe('auto');
        }
    });

    test('default container is never touched by the package', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await page.waitForFunction(
            () => !!document.querySelector('#presendoo-view-default iframe'),
        );

        const inlineStyle = await page.evaluate(
            () => document.getElementById('presendoo-view-default')!.getAttribute('style') ?? '',
        );
        expect(inlineStyle).toBe('');
    });

    test('responsive sizing reapplies on resize', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'viewport resize flaky in webkit');

        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(FIXTURE_URL);
        await page.waitForFunction(
            () => !!document.querySelector('#presendoo-view-responsive iframe'),
        );

        let inline = await page.evaluate(
            () =>
                document.getElementById('presendoo-view-responsive')!.getAttribute('style') ?? '',
        );
        expect(inline, 'desktop: no inline overrides').toBe('');

        await page.setViewportSize({ width: 400, height: 800 });
        await page.evaluate(() => window.dispatchEvent(new Event('resize')));

        await expect
            .poll(async () =>
                page.evaluate(
                    () =>
                        document
                            .getElementById('presendoo-view-responsive')!
                            .getAttribute('style') ?? '',
                ),
            )
            .toContain('95vw');

        await page.setViewportSize({ width: 1280, height: 800 });
        await page.evaluate(() => window.dispatchEvent(new Event('resize')));

        await expect
            .poll(async () =>
                page.evaluate(
                    () =>
                        document
                            .getElementById('presendoo-view-responsive')!
                            .getAttribute('style') ?? '',
                ),
            )
            .toBe('');
    });
});
