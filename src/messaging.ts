import { ensureOverlay } from './overlay';
import { presendooState, resolveBaseUrl } from './config';
import { forward } from './frames';
import { PresendooMessage } from './types';

window.addEventListener('message', (event: MessageEvent<PresendooMessage>) => {
    const { action, payload } = event.data || {};
    if (!action) return;

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
            break;
        case 'show-unit':
            ensureOverlay();
            if (presendooState.overlay && presendooState.overlayFrame) {
                const origin = resolveBaseUrl();
                presendooState.overlayFrame.src = `${origin}/${(payload as { url: string }).url}?framed=1&frame-type=unit-view`;
                presendooState.overlay.style.display = 'flex';
            }
            break;
    }
});
