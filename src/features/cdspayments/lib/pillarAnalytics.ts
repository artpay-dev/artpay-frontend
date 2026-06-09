declare global {
  interface Window {
    PillarAnalytics: {
      init: (config: object) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!window.PillarAnalytics) {
    console.warn('PillarAnalytics not initialized — skipping track:', event, properties);
    return;
  }
  console.log('PillarAnalytics track', event, properties);
  window.PillarAnalytics.track(event, properties);
}