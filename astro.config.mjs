import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://ghostinthemachine.studio',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    // The guest booking page is private. Keep it out of the sitemap so
    // search engines never discover it (it is also noindex'd).
    sitemap({
      filter: (page) => !page.includes('/guest-booking'),
    }),
    preact(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
