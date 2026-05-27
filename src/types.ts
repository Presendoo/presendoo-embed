export type FrameType = 'view' | 'list' | 'all';

export interface PresendooConfig {
    project: string | null;
    baseUrl?: string | null;
    ssl?: boolean;
}

export interface PresendooMessage {
    action: string;
    payload?: unknown;
    target?: string[];
}

export interface PresendooAPI {
    setConfig: (cfg: Partial<PresendooConfig>) => void;
}

export interface AddFrameOptions {
    type: FrameType;
    unit_target?: string;
    responsive?: boolean;
}
