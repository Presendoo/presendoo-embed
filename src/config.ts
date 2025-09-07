import { PresendooConfig } from './types';

export const presendooState = {
    frames: [] as HTMLIFrameElement[],
    overlay: null as HTMLDivElement | null,
    overlayFrame: null as HTMLIFrameElement | null,
    config: {
        project: null,
        baseUrl: null,
        ssl: true,
    } as PresendooConfig,
};

export function resolveBaseUrl(): string {
    const { ssl, baseUrl, project } = presendooState.config;
    const protocol = ssl ? 'https' : 'http';

    if (baseUrl) {
        return `${protocol}://${project}.${baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
    }
    return `${protocol}://${project}.presendoo.app`;
}
