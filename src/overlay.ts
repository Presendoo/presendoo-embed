import { presendooState } from './config';

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
    padding: 2rem;
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
  `;
    closeBtn.onclick = () => {
        if (presendooState.overlay && presendooState.overlayFrame) {
            presendooState.overlay.style.display = 'none';
            presendooState.overlayFrame.src = '';
        }
    };

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
    width: 90%;
    height: 90%;
    border: none;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  `;

    inner.appendChild(closeBtn);
    inner.appendChild(iframe);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    presendooState.overlay = overlay;
    presendooState.overlayFrame = iframe;
}
