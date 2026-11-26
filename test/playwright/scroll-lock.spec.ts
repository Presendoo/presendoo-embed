import { test, expect, Page } from '@playwright/test';

const FIXTURE_URL = '/test/playwright/scroll-lock.html';

declare global {
    interface Window {
        __send: (msg: unknown) => void;
    }
}

const OVERLAY = 'body > div[style*="z-index: 9999"]';

/** Polls for the overlay rather than waiting: `postMessage` is asynchronous. */
async function openOverlay(page: Page, legacy = false) {
    await page.evaluate(
        (legacy) =>
            window.__send({
                action: 'show-unit',
                payload: { url: 'units/abc' },
                ...(legacy ? {} : { target: ['overlay'] }),
            }),
        legacy,
    );
    await expect(page.locator(OVERLAY)).toHaveCSS('display', 'flex');
}

async function closeOverlay(page: Page) {
    await page.locator(`${OVERLAY} button`).click();
    await expect(page.locator(OVERLAY)).toHaveCSS('display', 'none');
}

/** Where the marker sits on screen, in viewport coordinates. */
function markerRect(page: Page) {
    return page.evaluate(() => {
        const r = document.getElementById('marker')!.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width };
    });
}

async function scrollTo(page: Page, y: number) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
}

test.describe('host page scroll lock', () => {
    test('page does not scroll behind the open overlay', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 800);
        await openOverlay(page);

        const before = await markerRect(page);
        await page.mouse.move(5, 5);
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(150);

        expect(await markerRect(page)).toEqual(before);
    });

    test('opening does not move the page on screen', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 800);

        const before = await markerRect(page);
        await openOverlay(page);

        expect(await markerRect(page)).toEqual(before);
    });

    test('closing restores the scroll position without moving the page', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 800);
        const before = await markerRect(page);

        await openOverlay(page);
        await closeOverlay(page);

        expect(await page.evaluate(() => window.scrollY)).toBe(800);
        expect(await markerRect(page)).toEqual(before);
    });

    test('closing does not animate on a host using smooth scrolling', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await page.evaluate(() => {
            document.documentElement.style.scrollBehavior = 'smooth';
        });
        await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));

        await openOverlay(page);
        // Read in the same task as the click, before any animation could run.
        const yAfterClose = await page.evaluate((overlay) => {
            document.querySelector<HTMLButtonElement>(`${overlay} button`)!.click();
            return window.scrollY;
        }, OVERLAY);

        expect(yAfterClose).toBe(800);
    });

    test('page scrolls normally again after closing', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await openOverlay(page);
        await closeOverlay(page);

        await page.mouse.move(100, 100);
        await page.mouse.wheel(0, 400);

        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });

    test('legacy show-unit without a target locks and releases too', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 500);

        await openOverlay(page, true);
        expect(await page.evaluate(() => document.body.style.position)).toBe('fixed');

        await closeOverlay(page);
        expect(await page.evaluate(() => document.body.style.position)).toBe('');
        expect(await page.evaluate(() => window.scrollY)).toBe(500);
    });

    test('a second show-unit while open keeps the original position', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 800);

        await openOverlay(page);
        await openOverlay(page);
        await page.evaluate(() =>
            window.__send({
                action: 'show-unit',
                payload: { url: 'units/def' },
                target: ['overlay'],
            }),
        );
        await expect
            .poll(() => page.locator(`${OVERLAY} iframe`).getAttribute('src'))
            .toContain('units/def');

        await closeOverlay(page);

        expect(await page.evaluate(() => window.scrollY)).toBe(800);
        expect(await page.evaluate(() => document.body.style.position)).toBe('');
    });

    test('reopening after a close locks again', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 300);
        await openOverlay(page);
        await closeOverlay(page);

        await scrollTo(page, 900);
        await openOverlay(page);
        expect(await page.evaluate(() => document.body.style.top)).toBe('-900px');

        await closeOverlay(page);
        expect(await page.evaluate(() => window.scrollY)).toBe(900);
    });
});

test.describe('host inline styles', () => {
    test('elements with no style attribute end up with none', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 200);
        await openOverlay(page);
        await closeOverlay(page);

        const attributes = await page.evaluate(() => ({
            html: document.documentElement.hasAttribute('style'),
            body: document.body.hasAttribute('style'),
        }));
        expect(attributes).toEqual({ html: false, body: false });
    });

    for (const style of [
        'position: relative; top: 5px; color: red;',
        'position: relative !important; left: 3px;',
        'inset: 0px; color: blue;',
        'overflow-x: hidden; margin: 8px;',
    ]) {
        test(`restores "${style}"`, async ({ page }) => {
            await page.goto(FIXTURE_URL);
            await page.evaluate((style) => {
                document.body.style.cssText = style;
            }, style);
            const before = await page.evaluate(() => document.body.style.cssText);

            await scrollTo(page, 200);
            await openOverlay(page);
            await closeOverlay(page);

            expect(await page.evaluate(() => document.body.style.cssText)).toBe(before);
        });
    }

    test('keeps a style the host set while the overlay was open', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await openOverlay(page);
        await page.evaluate(() => {
            document.body.style.color = 'green';
        });
        await closeOverlay(page);

        expect(await page.evaluate(() => document.body.style.color)).toBe('green');
    });

    test('does not blank a host with html and body at 100% height', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await page.addStyleTag({ content: 'html, body { height: 100%; }' });
        await scrollTo(page, 800);
        await openOverlay(page);

        const overflow = await page.evaluate(() => getComputedStyle(document.body).overflowY);
        expect(overflow).toBe('visible');
    });
});

test.describe('overlay removed by the host', () => {
    test('releases the lock, and a later show-unit opens a new overlay', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await scrollTo(page, 800);
        await openOverlay(page);

        await page.evaluate((overlay) => document.querySelector(overlay)!.remove(), OVERLAY);

        await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe('');
        expect(await page.evaluate(() => window.scrollY)).toBe(800);

        await openOverlay(page);
        await closeOverlay(page);
        expect(await page.evaluate(() => window.scrollY)).toBe(800);
    });
});
