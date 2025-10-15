'use client';

import { useEffect } from 'react';

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = (isDark: boolean) => {
      // Remove all existing favicon-related links
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingLinks.forEach(link => link.remove());

      // Create new favicon link with cache busting
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      const timestamp = new Date().getTime();
      link.href = isDark 
        ? `/fivefivefivewhite_middle-8.png?v=${timestamp}` 
        : `/fivefivefiveblack_middle-8.png?v=${timestamp}`;
      document.head.appendChild(link);
      
      // Also add a shortcut icon link for better browser support
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/png';
      shortcutLink.href = link.href;
      document.head.appendChild(shortcutLink);
    };

    // Initial check
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateFavicon(darkMode);

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => updateFavicon(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return null;
}

