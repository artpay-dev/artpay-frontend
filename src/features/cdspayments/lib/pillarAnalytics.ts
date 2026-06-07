declare global {
  interface Window {
    PillarAnalytics: {
      init: (config: object) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  window.PillarAnalytics?.track(event, properties);
}