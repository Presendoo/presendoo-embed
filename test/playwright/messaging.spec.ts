import { test, expect, Page } from '@playwright/test';

const FIXTURE_URL = '/test/playwright/messaging.html';

declare global {
    interface Window {
        __mount: (parentId: string, type: 'view' | 'list' | 'all') => Promise<HTMLIFrameElement>;
        __send: (msg: unknown) => void;
        __received: Record<string, unknown[]>;
    }
}

async function mount(page: Page, parentId: string, type: 'view' | 'list' | 'all') {
    await page.evaluate(
        ({ parentId, type }) => window.__mount(parentId, type),
        { parentId, type },
    );
}

async function overlayState(page: Page) {
    return page.evaluate(() => {
        const overlay = document.querySelector<HTMLDivElement>(
            'body > div[style*="z-index: 9999"]',
        );
        const iframe = overlay?.querySelector<HTMLIFrameElement>('iframe') ?? null;
        return {
            present: !!overlay,
            display: overlay?.style.display ?? null,
            iframeSrc: iframe?.src ?? null,
        };
    });
}

test.describe('popover (overlay) opens on show-unit', () => {
    for (const type of ['view', 'list', 'all'] as const) {
        test(`target=['overlay'] from "${type}" frame opens the popover`, async ({ page }) => {
            await page.goto(FIXTURE_URL);
            await mount(page, 'solo', type);

            await page.evaluate(() =>
                window.__send({
                    action: 'show-unit',
                    payload: { url: 'unit-abc' },
                    target: ['overlay'],
                }),
            );

            await expect.poll(() => overlayState(page)).toMatchObject({
                present: true,
                display: 'flex',
            });

            const state = await overlayState(page);
            expect(state.iframeSrc).toContain('unit-abc');
            expect(state.iframeSrc).toContain('frame-type=unit-view');
        });

        test(`legacy show-unit (no target) from "${type}" frame opens the popover`, async ({
            page,
        }) => {
            await page.goto(FIXTURE_URL);
            await mount(page, 'solo', type);

            await page.evaluate(() =>
                window.__send({
                    action: 'show-unit',
                    payload: { url: 'unit-legacy-42' },
                }),
            );

            await expect.poll(() => overlayState(page)).toMatchObject({
                present: true,
                display: 'flex',
            });

            const state = await overlayState(page);
            expect(state.iframeSrc).toContain('unit-legacy-42');
        });
    }
});

test.describe('split layout: view above, list below', () => {
    test('show-unit targeted to view-only opens in the view frame, NOT the popover', async ({
        page,
    }) => {
        await page.goto(FIXTURE_URL);
        await mount(page, 'split-view', 'view');
        await mount(page, 'split-list', 'list');

        await page.evaluate(() =>
            window.__send({
                action: 'show-unit',
                payload: { url: 'unit-split-1' },
                target: ['view-only'],
            }),
        );

        await expect
            .poll(() =>
                page.evaluate(() => (window.__received['view-only'] ?? []).length),
            )
            .toBeGreaterThan(0);

        const forwarded = await page.evaluate(() => ({
            view: window.__received['view-only'],
            list: window.__received['unit-list'],
        }));

        expect(forwarded.view).toEqual([
            { action: 'show-unit', payload: { url: 'unit-split-1' } },
        ]);
        expect(forwarded.list).toEqual([]);

        const overlay = await overlayState(page);
        expect(overlay.present === false || overlay.display === 'none').toBe(true);
    });

    test('show-unit targeted to overlay opens popover and does NOT forward to view frame', async ({
        page,
    }) => {
        await page.goto(FIXTURE_URL);
        await mount(page, 'split-view', 'view');
        await mount(page, 'split-list', 'list');

        await page.evaluate(() =>
            window.__send({
                action: 'show-unit',
                payload: { url: 'unit-popover-2' },
                target: ['overlay'],
            }),
        );

        await expect.poll(() => overlayState(page)).toMatchObject({
            present: true,
            display: 'flex',
        });

        const forwarded = await page.evaluate(() => ({
            view: window.__received['view-only'],
            list: window.__received['unit-list'],
        }));

        expect(forwarded.view).toEqual([]);
        expect(forwarded.list).toEqual([]);
    });

    test('view-updated forwards only to the list frame', async ({ page }) => {
        await page.goto(FIXTURE_URL);
        await mount(page, 'split-view', 'view');
        await mount(page, 'split-list', 'list');

        await page.evaluate(() =>
            window.__send({
                action: 'view-updated',
                payload: { view: 'floor-1' },
            }),
        );

        await expect
            .poll(() => page.evaluate(() => (window.__received['unit-list'] ?? []).length))
            .toBeGreaterThan(0);

        const forwarded = await page.evaluate(() => ({
            view: window.__received['view-only'],
            list: window.__received['unit-list'],
        }));

        expect(forwarded.list).toEqual([
            { action: 'view-updated', payload: { view: 'floor-1' } },
        ]);
        expect(forwarded.view).toEqual([]);
    });
});
