// This file simulates a consumer importing the published package.
// It is type-checked (no emit) to guarantee the public API contract holds
// for downstream TypeScript users.

import '../../dist/index';

// 1. Global config
Presendoo.setConfig({ project: 'demo' });
Presendoo.setConfig({ project: 'demo', baseUrl: 'localhost:5174', ssl: false });

// 2. addFrame on HTMLElement
const el = document.getElementById('embed');
if (el) {
    const a: HTMLIFrameElement = el.addFrame({ type: 'view' });
    const b: HTMLIFrameElement = el.addFrame({ type: 'list', unit_target: 'modal' });
    const c: HTMLIFrameElement = el.addFrame({
        type: 'all',
        unit_target: 'self',
        responsive: true,
    });
    void a;
    void b;
    void c;
}

// 3. window.Presendoo also works
window.Presendoo.setConfig({ project: 'x' });
