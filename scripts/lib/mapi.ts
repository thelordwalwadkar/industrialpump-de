/** Minimal Storyblok Management API client (EU region by default). Used by push-components.ts and seed-content.ts. */
const BASE = process.env.STORYBLOK_MAPI_URL ?? 'https://mapi.storyblok.com/v1';

export interface MapiConfig { token: string; spaceId: string }

export function readConfig(): MapiConfig | undefined {
  const token = process.env.STORYBLOK_OAUTH_TOKEN;
  const spaceId = process.env.STORYBLOK_SPACE_ID;
  return token && spaceId ? { token, spaceId } : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mapi<T = any>(cfg: MapiConfig, method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${BASE}/spaces/${cfg.spaceId}${path}`, {
      method,
      headers: { Authorization: cfg.token, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429) { await sleep(1200 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
    await sleep(350); // stay below the management API rate limit
    return (await res.json()) as T;
  }
  throw new Error(`${method} ${path} → rate limited`);
}
