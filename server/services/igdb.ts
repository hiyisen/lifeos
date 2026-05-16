/**
 * IGDB (Internet Game Database) API服务模块
 * 提供游戏信息的搜索功能
 * 需要配置IGDB_CLIENT_ID和IGDB_CLIENT_SECRET环境变量
 * 使用Twitch OAuth 2.0进行认证
 */

import { checkSearchCache, cacheSearchResult } from '../utils/cache';

// IGDB API基础URL
const IGDB_BASE = 'https://api.igdb.com/v4';

// 全局访问令牌缓存，避免频繁请求认证
let _accessToken: string | null = null;
let _tokenExpiresAt = 0;

/**
 * 获取IGDB API访问令牌
 * 使用客户端凭证模式进行OAuth认证
 * 缓存令牌以避免重复认证请求
 * @returns 访问令牌或null（认证失败时）
 */
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // 如果已有有效令牌，直接返回
  if (_accessToken && Date.now() < _tokenExpiresAt) return _accessToken;

  // 请求新的访问令牌
  const res = await $fetch<{ access_token: string; expires_in: number }>(
    'https://id.twitch.tv/oauth2/token',
    {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

  // 缓存令牌和过期时间（提前60秒过期以确保安全）
  _accessToken = res.access_token;
  _tokenExpiresAt = Date.now() + (res.expires_in - 60) * 1000;
  return _accessToken;
}

/**
 * IGDB搜索结果数据结构
 */
export interface IGDBResult {
  id: number; // 游戏ID
  name: string; // 游戏名称
  cover?: { id: number; image_id: string }; // 封面图片信息
  first_release_date?: number; // 首次发布日期（Unix时间戳）
  genres?: Array<{ id: number; name: string }>; // 游戏类型列表
  platforms?: Array<{ id: number; name: string }>; // 平台列表
  summary?: string; // 游戏简介
}

/**
 * 搜索IGDB游戏
 * 支持缓存，避免重复请求
 * @param query 搜索关键词
 * @returns 游戏搜索结果数组
 */
export async function searchIGDB(query: string): Promise<IGDBResult[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) return [];

  const cached = checkSearchCache('igdb', query);
  if (cached) return JSON.parse(cached);

  // 使用IGDB的GraphQL-like查询语法
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

/**
 * 生成IGDB封面图片URL
 * IGDB使用特定的图片尺寸标识符
 * @param imageId 图片ID
 * @param size 图片尺寸（cover_small=小图, cover_big=大图）
 * @returns 完整的图片URL或null
 */
export function igdbCoverUrl(
  imageId: string | undefined,
  size: 'cover_small' | 'cover_big' = 'cover_big',
): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
