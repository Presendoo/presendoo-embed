/**
 * Lead attribution: tells the Presendoo frames which page and campaign
 * the visitor came from, so a contact-form lead can carry them.
 *
 * Two routes, so either alone is enough:
 *   1. The host page's `utm_*` query parameters are appended to every
 *      frame URL (the public site reads UTMs from its own URL).
 *   2. Each frame is sent a `lead-source` message on load with the host
 *      page's URL and UTMs. A framed page cannot read its parent's URL
 *      itself; browsers only expose the parent's origin.
 *
 * The page URL is sent as-is; Presendoo strips its query string before
 * storing it. Nothing is sent anywhere other than the Presendoo frames.
 */

const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const;
const MAX_VALUE = 200;

export interface LeadSource {
    page_url: string;
    utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
}

export function hostLeadSource(): LeadSource {
    const params = new URLSearchParams(window.location.search);
    const utm: LeadSource['utm'] = {};
    for (const key of UTM_KEYS) {
        const value = params.get(`utm_${key}`)?.trim();
        if (value) utm[key] = value.slice(0, MAX_VALUE);
    }
    return { page_url: window.location.href, utm };
}

/** `&utm_source=…&utm_campaign=…`, or '' when the host page has none. */
export function utmQuerySuffix(): string {
    const { utm } = hostLeadSource();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(utm)) {
        if (value) params.set(`utm_${key}`, value);
    }
    const query = params.toString();
    return query ? `&${query}` : '';
}

/** Post the host's lead source into `frame` every time it (re)loads. */
export function sendLeadSourceOnLoad(frame: HTMLIFrameElement): void {
    frame.addEventListener('load', () => {
        if (!frame.src || frame.src === 'about:blank') return;
        frame.contentWindow?.postMessage({ action: 'lead-source', payload: hostLeadSource() }, '*');
    });
}
