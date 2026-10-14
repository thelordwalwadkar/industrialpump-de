import type { SbAsset } from './types';

/** Storyblok Image Service: `/m/{w}x{h}/filters:format(webp)`. Non-Storyblok URLs pass through untouched. */
export function sbImage(asset: SbAsset, width: number, height: number): { src: string; srcset?: string; width: number; height: number } | undefined {
  const url = asset?.filename;
  if (!url) return undefined;
  if (!/^https:\/\/a\.storyblok\.com\//.test(url)) return { src: url, width, height };
  const at = (w: number, h: number) => `${url}/m/${w}x${h}/filters:format(webp)`;
  return { src: at(width, height), srcset: `${at(width, height)} 1x, ${at(width * 2, height * 2)} 2x`, width, height };
}
