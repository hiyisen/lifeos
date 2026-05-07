import { checkSearchCache, cacheSearchResult } from '../utils/cache';

const IGDB_BASE = 'https://api.igdb.com/v4';

let _accessToken: string | null = null;
let _tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (_accessToken && Date.now() < _tokenExpiresAt) return _accessToken;

  const res = await $fetch<{ access_token: string; expires_in: number }>(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  _accessToken = res.access_token;
  _tokenExpiresAt = Date.now() + (res.expires_in - 60) * 1000;
  return _accessToken;
}

export interface IGDBResult {
  id: number;
  name: string;
  cover?: { id: number; image_id: string };
  first_release_date?: number;
  genres?: Array<{ id: number; name: string }>;
  platforms?: Array<{ id: number; name: string }>;
  summary?: string;
}

export async function searchIGDB(query: string): Promise<IGDBResult[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) return [];

  const cached = checkSearchCache('igdb', query);
  if (cached) return JSON.parse(cached);

  const results = await $fetch<IGDBResult[]>(`${IGDB_BASE}/games`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${token}`,
    },
    body: `search "${query}"; fields name,cover.image_id,first_release_date,genres.name,platforms.name,summary; limit 10;`,
  });

  cacheSearchResult('igdb', query, results);
  return results;
}

export function igdbCoverUrl(
  imageId: string | undefined,
  size: 'cover_small' | 'cover_big' = 'cover_big',
): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
