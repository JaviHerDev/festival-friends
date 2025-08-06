import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  prefetch: true,
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static',
  site: 'https://festival-friends-liard.vercel.app/'
}); 