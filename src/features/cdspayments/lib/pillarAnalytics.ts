declare global {
  interface Window {
    PillarAnalytics: {
      init: (config: object) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

const PILLAR_CONFIG = {
  projectId: 'artpaycasadasta',
  apiKey: 'jBfdlMglVmtESCtx0eFu9dhfGETvW887K79FGRNa',
  auth: 'dXNlci0xNzgwNjU1ODM5MzE0OmFoUUcrZDBPUWQySGhmbDI=',
  autoPageView: false,
  respectDoNotTrack: false,
  autoConsentIntegration: false,
};

let ready = false;

export function initPillarAnalytics(): Promise<void> {
  if (ready) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://d1c12ryh9wcpcm.cloudfront.net/pillar-analytics.min.js';
    script.onload = () => {
      window.PillarAnalytics.init(PILLAR_CONFIG);
      ready = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  window.PillarAnalytics?.track(event, properties);
}