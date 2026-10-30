import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

const PREVIEW = env.PREVIEW === '1';
const FIXTURES = env.INCLUDE_FIXTURES === '1';
const site = (env.PUBLIC_SITE_URL || 'https://industrialpumpgroup.de').replace(/\/$/, '');
const token = PREVIEW ? env.STORYBLOK_PREVIEW_TOKEN : env.STORYBLOK_TOKEN;

// Storyblok integration only when a token exists. Without a token the site builds from storyblok/content/*.json
// (same story shape), so the build never depends on a live space.
const integrations = [
  sitemap({
    filter: (page) => !/\/__fixtures__\//.test(page) && !/\/(danke|404)$/.test(page),
  }),
];
if (token) {
  integrations.unshift(
    storyblok({
      accessToken: token,
      apiOptions: { region: 'eu' },
      bridge: PREVIEW,
      useCustomApi: false,
    }),
  );
}

export default defineConfig({
  site,
  // Sub-path hosting (GitHub Pages project site): PUBLIC_BASE_PATH=/repo. Empty for a domain root.
  base: env.PUBLIC_BASE_PATH || '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  outDir: FIXTURES ? 'dist-fixtures' : 'dist',
  output: PREVIEW ? 'server' : 'static',
  adapter: PREVIEW ? node({ mode: 'standalone' }) : undefined,
  integrations,
  devToolbar: { enabled: false },
  compressHTML: true,
  vite: { build: { assetsInlineLimit: 0 } },
});
