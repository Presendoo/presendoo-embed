import { showOverlay } from './overlay';
import { forward } from './frames';
import { PresendooMessage } from './types';

window.addEventListener('message', (event: MessageEvent<PresendooMessage>) => {
    const { action, payload, target } = event.data || {};
    if (!action) return;

    console.log('received message in embed package');

    // New path: if message includes target routing, use it
    if (target && Array.isArray(target)) {
        for (const t of target) {
            if (t === 'overlay') {
                // Special case: overlay is not a frame forward
                if (action === 'show-unit') {
                    showOverlay((payload as { url: string }).url);
                }
            } else {
                forward(t, { action, payload });
            }
        }
        return;
    }

    // Legacy fallback: action-based routing (for backwards compatibility with cached embed scripts)
    switch (action) {
        case 'view-updated':
            forward('unit-list', { action, payload });
            break;
        case 'language-change':
            forward('unit-list', { action, payload });
            forward('view-only', { action, payload });
            break;
        case 'hover-unit':
        case 'filters-updated':
        case 'update-view':
            forward('view-only', { action, payload });
            forward('combined', { action, payload });
            break;
        case 'navigate-to-view':
            forward('view-only', { action, payload });
            break;
        case 'show-unit':
            showOverlay((payload as { url: string }).url);
            break;
    }
});
