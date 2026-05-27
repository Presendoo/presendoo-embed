import { presendooState } from './config';

const MOBILE_BREAKPOINT = 768;

function applyResponsiveSizing(overlay: HTMLDivElement, iframe: HTMLIFrameElement): void {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobile) {
        overlay.style.padding = '0';
        iframe.style.width = '95vw';
        iframe.style.height = '90vh';
        iframe.style.borderRadius = '8px';
    } else {
        overlay.style.padding = '2rem';
        iframe.style.width = '90%';
        iframe.style.height = '90%';
        iframe.style.borderRadius = '8px';
    }
}

export function ensureOverlay(): void {
    if (presendooState.overlay) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
    background: rgba(0, 0, 0, 0.8);
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    display: none;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    z-index: 9999;
  `;

    const inner = document.createElement('div');
    inner.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    closeBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: bold;
    z-index: 1;
  `;
    closeBtn.onclick = () => {
        if (presendooState.overlay && presendooState.overlayFrame) {
            presendooState.overlay.style.display = 'none';
            presendooState.overlayFrame.src = '';
        }
    };

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
    border: none;
    background: #fff;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  `;

    inner.appendChild(closeBtn);
    inner.appendChild(iframe);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    applyResponsiveSizing(overlay, iframe);
    window.addEventListener('resize', () => applyResponsiveSizing(overlay, iframe));
    window.addEventListener('orientationchange', () => applyResponsiveSizing(overlay, iframe));

    presendooState.overlay = overlay;
    presendooState.overlayFrame = iframe;
}
