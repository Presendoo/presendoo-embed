/**
 * Locks the host page's scroll while the overlay is open.
 *
 * `overflow: hidden` on <body> does not stop scrolling on iOS Safari, so the
 * body is taken out of flow with `position: fixed` and shifted by the current
 * scroll offset. It looks unmoved, and the document has nothing left to scroll.
 *
 * <body> deliberately gets no `overflow: hidden`: on the common
 * `html, body { height: 100% }` page it would clip everything below the first
 * viewport-height of content, leaving the page behind the overlay blank.
 */

interface SavedProperty {
    element: HTMLElement;
    name: string;
    value: string;
    priority: string;
}

interface LockState {
    scrollX: number;
    scrollY: number;
    bodyScrollTop: number;
    properties: SavedProperty[];
    elementsWithoutStyleAttribute: HTMLElement[];
}

let lock: LockState | null = null;

function override(state: LockState, element: HTMLElement, name: string, value: string): void {
    state.properties.push({
        element,
        name,
        value: element.style.getPropertyValue(name),
        priority: element.style.getPropertyPriority(name),
    });
    element.style.setProperty(name, value, 'important');
}

export function lockHostScroll(): void {
    if (lock) return;

    const { body, documentElement: root } = document;
    const state: LockState = {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        bodyScrollTop: body.scrollTop,
        properties: [],
        elementsWithoutStyleAttribute: [root, body].filter((el) => !el.hasAttribute('style')),
    };

    // Taking the body out of flow removes the page's overflow, and with it a
    // classic scrollbar. Keep the (now inert) track so the page doesn't reflow
    // sideways behind the overlay.
    if (window.innerWidth > root.clientWidth) {
        override(state, root, 'overflow-y', 'scroll');
    }

    override(state, body, 'position', 'fixed');
    override(state, body, 'top', `${-state.scrollY}px`);
    // Left and right, not `width: 100%`, so the body's margins and any
    // max-width centring resolve as they did in flow.
    override(state, body, 'left', `${-state.scrollX}px`);
    override(state, body, 'right', `${state.scrollX}px`);

    lock = state;
}

export function unlockHostScroll(): void {
    if (!lock) return;
    const state = lock;
    lock = null;

    // One property at a time rather than rewriting the style attribute: this
    // keeps anything the host changed on these elements while the overlay was
    // open, and CSSOM writes aren't subject to a host's CSP style-src.
    for (const { element, name, value, priority } of state.properties) {
        if (value) {
            element.style.setProperty(name, value, priority);
        } else {
            element.style.removeProperty(name);
        }
    }
    for (const element of state.elementsWithoutStyleAttribute) {
        if (element.style.length === 0) {
            // Chromium serialises CSSOM changes into the attribute lazily, and a
            // removal before that happens leaves `style=""` behind. Reading the
            // attribute forces the sync.
            element.getAttribute('style');
            element.removeAttribute('style');
        }
    }

    // Same task as the style restore, so nothing paints in between. `instant`
    // because a host's `scroll-behavior: smooth` would otherwise animate from
    // the top of the page.
    window.scrollTo({ left: state.scrollX, top: state.scrollY, behavior: 'instant' });
    if (document.body.scrollTop !== state.bodyScrollTop) {
        document.body.scrollTop = state.bodyScrollTop;
    }
}
