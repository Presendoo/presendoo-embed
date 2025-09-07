import { presendooState } from './config';
import { createFrame } from './frames';
import { AddFrameOptions, PresendooConfig } from './types';

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
    return frame;
};
