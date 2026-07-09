declare global {
  interface Window {
    clarity: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

const CLARITY_PROJECT_ID = 'xjtj9jipbb';
let injected = false;

export function useMsClarity() {
  if (injected) return;
  injected = true;

  window.clarity =
    window.clarity ||
    function (...args: unknown[]) {
      (window.clarity.q = window.clarity.q || []).push(args);
    };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}