import { useEffect } from 'react';

/**
 * Hook to dynamically generate a PWA manifest that captures the current URL
 * This allows "Add to Home Screen" to remember the exact page where it was added
 */
export const useDynamicManifest = () => {
  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.pathname + window.location.search;

    // Create the manifest object
    const manifest = {
      short_name: 'artpay',
      name: 'artpay',
      icons: [
        {
          src: '/wp-content/themes/artpay-react/static/favicon-16x16.png',
          type: 'image/png',
          sizes: '16x16',
        },
        {
          src: '/wp-content/themes/artpay-react/static/favicon-32x32.png',
          type: 'image/png',
          sizes: '32x32',
        },
        {
          src: '/wp-content/themes/artpay-react/static/android-chrome-192x192.png',
          type: 'image/png',
          sizes: '192x192',
        },
        {
          src: '/wp-content/themes/artpay-react/static/android-chrome-512x512.png',
          type: 'image/png',
          sizes: '512x512',
        },
      ],
      start_url: currentUrl,
      display: 'standalone',
      theme_color: '#000000',
      background_color: '#ffffff',
    };

    // Convert to JSON string
    const manifestJson = JSON.stringify(manifest);

    // Create a blob URL for the manifest
    const blob = new Blob([manifestJson], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    // Find existing manifest link or create new one
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');

    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    // Update the manifest href
    manifestLink.href = manifestURL;

    // Cleanup function to revoke the blob URL
    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, []);
};