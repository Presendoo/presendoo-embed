import { presendooState, resolveBaseUrl } from './config';
import { FrameType } from './types';

const frameTypeMap: Record<FrameType, string> = {
    view: 'view-only',
    list: 'unit-list',
    all: 'combined',
};

export function createFrame({
    type,
    unit_target,
}: {
    type: FrameType;
    unit_target: string;
}): HTMLIFrameElement {
    let resolvedType = frameTypeMap[type];
    if (resolvedType === undefined) {
        console.warn(
            `[Presendoo] Unknown frame type "${type}"; defaulting to "all". Valid types: ${Object.keys(frameTypeMap).join(', ')}.`,
        );
        resolvedType = frameTypeMap.all;
    }

    const origin = resolveBaseUrl();
    const iframe = document.createElement('iframe');
    iframe.src = `${origin}?framed=1&frame-type=${resolvedType}&unit-target=${unit_target}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.setAttribute('data-presendoo-frame', resolvedType);
    presendooState.frames.push(iframe);
    return iframe;
}

export function forward(targetType: string, message: unknown): void {
    presendooState.frames.forEach((frame) => {
        if (frame.getAttribute('data-presendoo-frame') === targetType) {
            frame.contentWindow?.postMessage(message, '*');
        }
    });
}

export { frameTypeMap };
