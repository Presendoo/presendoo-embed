import type { PresendooAPI } from './types';

declare global {
    interface Window {
        Presendoo: PresendooAPI;
    }

    interface HTMLElement {
        addFrame(opts: AddFrameOptions): HTMLIFrameElement;
    }
}

export {};
