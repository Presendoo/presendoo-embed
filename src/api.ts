import { presendooState } from './config';
import { createFrame } from './frames';
import { AddFrameOptions, PresendooAPI, PresendooConfig } from './types';

declare global {
    interface Window {
        Presendoo: PresendooAPI;
    }

    // Allow top-level `Presendoo.setConfig(...)` (without `window.` prefix)
    var Presendoo: PresendooAPI;

    interface HTMLElement {
        addFrame(opts: AddFrameOptions): HTMLIFrameElement;
    }
}

const MOBILE_BREAKPOINT = 768;

function applyResponsiveContainerSizing(el: HTMLElement): void {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    console.log('isMobile', isMobile);
    if (isMobile) {
        el.style.setProperty('width', '95vw', 'important');
        el.style.setProperty('height', '90vh', 'important');
        el.style.setProperty('max-width', 'none', 'important');
        el.style.setProperty('aspect-ratio', 'auto', 'important');
        el.style.setProperty('margin', '1rem auto', 'important');
    } else {
        el.style.removeProperty('width');
        el.style.removeProperty('height');
        el.style.removeProperty('max-width');
        el.style.removeProperty('aspect-ratio');
        el.style.removeProperty('margin');
    }
}

// ---- Global API ----
window.Presendoo = {
    setConfig: (cfg: Partial<PresendooConfig>) => {
        presendooState.config = { ...presendooState.config, ...cfg };
    },
};

// ---- HTMLElement API ----
HTMLElement.prototype.addFrame = function (opts: AddFrameOptions): HTMLIFrameElement {
    if (!opts || !opts.type) {
        throw new Error('addFrame: { type } required');
    }
    const unit_target = opts.unit_target || 'self';

    this.querySelectorAll('[data-presendoo-frame]').forEach((el) => el.remove());

    const frame = createFrame({
        type: opts.type,
        unit_target,
    });
    this.appendChild(frame);

    if (opts.responsive) {
        applyResponsiveContainerSizing(this);
        window.addEventListener('resize', () =>
            applyResponsiveContainerSizing(frame.parentElement!),
        );
        window.addEventListener('orientationchange', () =>
            applyResponsiveContainerSizing(frame.parentElement!),
        );
    }

    return frame;
};
