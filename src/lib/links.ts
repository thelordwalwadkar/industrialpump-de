import type { SbLink } from './types';
import type { Site } from './storyblok';

export interface ResolvedLink { href: string; internal: boolean; exists: boolean }

/** Storyblok link field → href. Story links point at `cached_url` (= full_slug); `home` is the root. */
export function resolveLink(site: Site, link: SbLink | undefined): ResolvedLink | undefined {
  if (!link) return undefined;
  const type = link.linktype ?? (link.cached_url ? 'story' : 'url');
  let href: string | undefined;
  if (type === 'story') href = link.cached_url ? `/${link.cached_url.replace(/^\/+|\/+$/g, '')}` : undefined;
  else if (type === 'email') href = link.url ? `mailto:${link.url}` : undefined;
  else href = link.url || link.cached_url;
  if (!href) return undefined;
  if (href === '/home') href = '/';
  const internal = href.startsWith('/');
  if (link.anchor) href += `#${link.anchor}`;
  return { href, internal, exists: internal ? site.has(href) : true };
}

/** Link to a story path with an optional query string (e.g. the quote form prefill). */
export const withQuery = (path: string, params: Record<string, string | undefined>): string => {
  const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&');
  return q ? `${path}?${q}` : path;
};
