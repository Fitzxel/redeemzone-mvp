// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from "@astrojs/node";
import clerk from "@clerk/astro";
import { dark } from '@clerk/themes';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          '**/src/pages/api/.cache/**',
        ],
      },
    },
  },
  integrations: [react(), clerk({
    appearance: {
      baseTheme: dark,
    }
  })],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
});