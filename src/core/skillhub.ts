/**
 * SkillHub 公开 API 核心（fetch 注入式纯函数，host 与 client 共享同一份）。
 * 接口出处：https://www.skillhub.cn/skills/user_290ac21c/find-skill-skillhub
 * - 搜索：GET https://api.skillhub.cn/api/skills（keyword 分词搜索，无需鉴权）
 * - 下载：GET https://api.skillhub.cn/api/v1/download?slug=&namespace=（zip 包）
 */

/** fetch 的最小结构子集（Node 18+ 全局 fetch / 浏览器 fetch 均可适配）。 */
export interface FetchLikeResponse {
  readonly ok: boolean
  readonly status: number
  json(): Promise<unknown>
  arrayBuffer(): Promise<ArrayBuffer>
}

export type FetchLike = (
  url: string,
  init: { headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<FetchLikeResponse>

/** SkillHub 列表条目（面板与工具共用的 canonical 形状）。 */
export interface SkillHubItem {
  readonly name: string
  readonly slug: string
  readonly namespace: string
  readonly description: string
  readonly category: string
  readonly downloads: number
  readonly installs: number
  readonly stars: number
  readonly iconUrl: string
}

export interface SkillHubPage {
  readonly total: number
  readonly page: number
  readonly items: readonly SkillHubItem[]
}

export interface SkillHubSearchOptions {
  readonly keyword?: string
  readonly category?: string
  readonly sortBy?: string
  readonly page?: number
  readonly pageSize?: number
}

/** 一级分类（?category=<key>；面板下拉与工具说明共用）。 */
export const SKILLHUB_CATEGORIES: ReadonlyArray<readonly [string, string]> = [
  ['office-efficiency', '办公效率'],
  ['content-creation', '内容创作'],
  ['dev-programming', '开发编程'],
  ['data-analysis', '数据分析'],
  ['design-media', '设计多媒体'],
  ['ai-agent', 'AI Agent'],
  ['knowledge-management', '知识管理'],
  ['business-ops', '商业运营'],
  ['education', '教育学习'],
  ['professional', '行业专业'],
  ['it-ops-security', 'IT 运维与安全'],
  ['life-service', '生活服务'],
]

const API_BASE = 'https://api.skillhub.cn'
const DEFAULT_TIMEOUT_MS = 15000
/** 商城默认每页条数（与 dsh-plugin-market 一致）。 */
const MARKET_DEFAULT_PAGE_SIZE = 30

/** HTTP 层错误（状态码非 2xx）。 */
export class SkillHubHttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = 'SkillHubHttpError'
  }
}

/** 请求超时。 */
export class SkillHubTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SkillHubTimeoutError'
  }
}

function makeSignal(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  if (signal === undefined) return timeout
  return AbortSignal.any([signal, timeout])
}

function throwForUnknown(signal: AbortSignal | undefined, timeoutMs: number): never {
  if (signal?.aborted === true) throw new DOMException('aborted', 'AbortError')
  throw new SkillHubTimeoutError(`SkillHub 请求超时（${Math.round(timeoutMs / 1000)} 秒）`)
}

/** 原始 skill 条目 → canonical 条目（只读取叶字段）。 */
export function mapSkillHubItem(raw: unknown): SkillHubItem {
  const s = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const ns = (typeof s['namespace'] === 'object' && s['namespace'] !== null
    ? s['namespace'] : {}) as Record<string, unknown>
  const descZh = s['description_zh']
  const descEn = s['description']
  return {
    name: String(s['name'] ?? ''),
    slug: String(s['slug'] ?? ''),
    namespace: String(ns['handle'] ?? ''),
    description: String(descZh ?? descEn ?? ''),
    category: String(s['category'] ?? ''),
    downloads: Number(s['downloads']) || 0,
    installs: Number(s['installs']) || 0,
    stars: Number(s['stars']) || 0,
    iconUrl: typeof s['iconUrl'] === 'string' ? s['iconUrl'] : '',
  }
}

/** 关键词/分类/排序/分页搜索。 */
export async function searchSkills(
  fetchImpl: FetchLike,
  options: SkillHubSearchOptions,
  extra: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<SkillHubPage> {
  const timeoutMs = extra.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const page = Math.max(1, options.page ?? 1)
  // API 实测支持到 pageSize=100。
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? MARKET_DEFAULT_PAGE_SIZE))
  const params = [
    `sortBy=${encodeURIComponent(options.sortBy ?? 'score')}`,
    `page=${page}`,
    `pageSize=${pageSize}`,
  ]
  if (options.keyword !== undefined && options.keyword.trim() !== '') {
    params.push(`keyword=${encodeURIComponent(options.keyword.trim())}`)
  }
  if (options.category !== undefined && options.category !== '') {
    params.push(`category=${encodeURIComponent(options.category)}`)
  }
  const url = `${API_BASE}/api/skills?${params.join('&')}`
  let res: FetchLikeResponse
  try {
    res = await fetchImpl(url, { signal: makeSignal(extra.signal, timeoutMs) })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError' && extra.signal?.aborted === true) throw error
    if (error instanceof Error && error.name === 'TimeoutError') throwForUnknown(extra.signal, timeoutMs)
    throw error
  }
  if (!res.ok) throw new SkillHubHttpError(res.status, `SkillHub 搜索接口返回 HTTP ${res.status}`)
  const parsed = await res.json() as Record<string, unknown>
  const data = (typeof parsed['data'] === 'object' && parsed['data'] !== null
    ? parsed['data'] : {}) as Record<string, unknown>
  const list = Array.isArray(data['skills']) ? data['skills'] : []
  return {
    total: Number(data['total']) || list.length,
    page,
    items: list.map(mapSkillHubItem),
  }
}

/** 下载 skill 的 zip 包（原始字节）。 */
export async function downloadSkillZip(
  fetchImpl: FetchLike,
  slug: string,
  namespace: string,
  extra: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<Uint8Array> {
  const timeoutMs = extra.timeoutMs ?? 60000
  const url = `${API_BASE}/api/v1/download?slug=${encodeURIComponent(slug)}&namespace=${encodeURIComponent(namespace)}`
  let res: FetchLikeResponse
  try {
    res = await fetchImpl(url, { signal: makeSignal(extra.signal, timeoutMs) })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError' && extra.signal?.aborted === true) throw error
    if (error instanceof Error && error.name === 'TimeoutError') throwForUnknown(extra.signal, timeoutMs)
    throw error
  }
  if (!res.ok) throw new SkillHubHttpError(res.status, `SkillHub 下载接口返回 HTTP ${res.status}`)
  return new Uint8Array(await res.arrayBuffer())
}
