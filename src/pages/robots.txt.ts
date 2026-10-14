import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/storyblok';

export const GET: APIRoute = () => {
  const preview = process.env.PREVIEW === '1' || process.env.PUBLIC_STAGING === '1';
  const body = preview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
