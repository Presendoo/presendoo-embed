import { test, expect } from '@playwright/test';

const FIXTURE_URL = '/test/playwright/messaging.html';

declare global {
    interface Window {
        __send: (msg: unknown) => void;
    }
}

/**
 * The query of the src a newly added frame gets, read before anything
 * redirects it. (The fixture's fake base URL makes the whole src an
 * invalid URL, so only the query is parsed.)
 */
async function newFrameQuery(page: import('@playwright/test').Page): Promise<URLSearchParams> {
    return page
        .evaluate(() => {
            const el = document.getElementById('solo') as HTMLElement & {
                addFrame: (o: { type: string; unit_target: string }) => HTMLIFrameElement;
            };
            return el.addFrame({ type: 'all', unit_target: 'self' }).src;
        })
        .then((src) => new URLSearchParams(src.split('?')[1] ?? ''));
}

test.describe('lead source: host UTMs reach the frames', () => {
    test('frame URLs carry the host page utm_* parameters, and nothing else', async ({ page }) => {
        await page.goto(
            `${FIXTURE_URL}?utm_source=facebook&utm_campaign=launch&gclid=abc&utm_unknown=x`,
        );
        const q = await newFrameQuery(page);
        expect(q.get('utm_source')).toBe('facebook');
        expect(q.get('utm_campaign')).toBe('launch');
        expect(q.has('gclid')).toBe(false);
        expect(q.has('utm_unknown')).toBe(false);
        expect(q.get('frame-type')).toBe('combined');
    });

    test('frame URLs are unchanged when the host page has no UTMs', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        const q = await newFrameQuery(page);
        expect([...q.keys()].some((k) => k.startsWith('utm_'))).toBe(false);
    });

    test('the unit overlay URL carries them too', async ({ page }) => {
        await page.goto(`${FIXTURE_URL}?utm_medium=email`);
        await newFrameQuery(page);
        await page.evaluate(() =>
            window.__send({
                action: 'show-unit',
                payload: { url: 'units/abc' },
                target: ['overlay'],
            }),
        );
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.querySelector<HTMLIFrameElement>(
                            'body > div[style*="z-index: 9999"] iframe',
                        )?.src ?? '',
                ),
            )
            .toContain('utm_medium=email');
    });
});
