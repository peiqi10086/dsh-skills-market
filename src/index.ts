/**
 * dsh-skills-market Host 半：
 * - 在同源路由 /plugins/dsh-skills-market/api/* 上提供面板的 JSON API
 *   （list / search / install / uninstall / set-level）；
 * - 注册只读模型工具 dsh_skillhub_search。
 *
 * 树外插件不能新增 @Remote 方法（packages/api/remotes/README.md 封闭集），
 * 因此面板与 host 的通道是同源 HTTP 路由（webServer 服务），与官方 hmr 插件同款用法。
 * 运行在主进程内、不经 pwsh 沙箱：网络用全局 fetch，文件用 node:fs，zip 用内联的 fflate。
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type {
  AgentPresetsLike,
  HostContext,
  SkillSummaryLike,
  SkillsServiceLike,
  ToolDefinitionLike,
} from './contracts.ts'
import {
  SkillHubHttpError,
  SkillHubTimeoutError,
  downloadSkillZip,
  searchSkills,
  type FetchLike,
  type FetchLikeResponse,
  type SkillHubItem,
} from './core/skillhub.ts'
import {
  findProjectRoot,
  installZip,
  moveSkill,
  projectSkillsDir,
  removeSkill,
  scanSkillsDir,
  userSkillsDir,
} from './core/local.ts'

export const name = 'dsh-skills-market'
export const inject = ['webServer', 'tools']

/** 面板 API 的路由前缀（prefix 匹配其下所有子路径）。 */
const API_PREFIX = '/plugins/dsh-skills-market/api'

/** Node fetch 适配为 FetchLike（结构子集）。 */
const nodeFetch: FetchLike = async (url, init): Promise<FetchLikeResponse> =>
  fetch(url, { headers: init.headers, signal: init.signal })

/* ---------------------------------------------------------------- */
/* 同源 JSON API                                                      */
/* ---------------------------------------------------------------- */

interface ApiOk {
  readonly ok: true
  readonly [key: string]: unknown
}

interface ApiErr {
  readonly ok: false
  readonly error: string
}

type ApiResult = ApiOk | ApiErr

function sendJson(res: ServerResponse, value: ApiResult): void {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(value))
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (chunks.length === 0) return {}
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function bodyString(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key]
  return typeof value === 'string' && value !== '' ? value : undefined
}

function bodyNumber(body: Record<string, unknown>, key: string): number | undefined {
  const value = body[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** skills 来源 → 级别与可管理性（与面板的分组一致）。 */
function mapSource(source: string): { level: 'project' | 'user' | 'builtin'; manageable: boolean } {
  if (source === 'project-agents') return { level: 'project', manageable: true }
  if (source === 'user-agents') return { level: 'user', manageable: true }
  if (source === 'project-dsh') return { level: 'project', manageable: false }
  if (source === 'user-dsh') return { level: 'user', manageable: false }
  return { level: 'builtin', manageable: false }
}

interface LocalSkillPayload {
  readonly level: 'project' | 'user' | 'builtin'
  readonly manageable: boolean
  readonly source: string
  readonly dir: string
  readonly name: string
  readonly description: string
}

/** 优先走 skills 服务（带来源信息，可区分内置只读）；服务缺失时退化为目录扫描。 */
async function listLocal(ctx: HostContext, cwd: string | undefined): Promise<ApiResult> {
  const base = cwd ?? process.cwd()
  const projectDir = projectSkillsDir(base)
  const userDir = userSkillsDir()

  const skillsService = ctx.get('skills') as SkillsServiceLike | undefined
  if (skillsService !== undefined) {
    const options: { cwd: string; scope?: unknown } = { cwd: base }
    const agentPresets = ctx.get('agentPresets') as AgentPresetsLike | undefined
    if (agentPresets !== undefined) {
      try {
        const scope = await agentPresets.standingKeyFor()
        if (scope !== undefined) options.scope = scope
      } catch {
        // 作用域解析失败时退回全局层。
      }
    }
    const summaries = await skillsService.list(options)
    const skills: LocalSkillPayload[] = summaries.map((s: SkillSummaryLike) => {
      const mapped = mapSource(s.source)
      let dir = s.name
      const baseDir = s.resourceBase
      if (baseDir !== undefined && baseDir.kind === 'directory' && typeof baseDir.path === 'string') {
        const parts = baseDir.path.replace(/[\\/]+$/, '').split(/[\\/]/)
        const last = parts[parts.length - 1]
        if (last !== undefined && last !== '') dir = last
      }
      return {
        level: mapped.level,
        manageable: mapped.manageable,
        source: s.source,
        dir,
        name: s.name,
        description: s.description,
      }
    })
    return { ok: true, skills, projectDir, userDir, workspaceRoot: base }
  }

  const [projectSkills, userSkills] = await Promise.all([
    scanSkillsDir(projectDir, 'project'),
    scanSkillsDir(userDir, 'user'),
  ])
  const skills: LocalSkillPayload[] = [...projectSkills, ...userSkills].map(row => ({
    level: row.level,
    manageable: true,
    source: `${row.level}-agents`,
    dir: row.dir,
    name: row.name,
    description: row.description,
  }))
  return { ok: true, skills, projectDir, userDir, workspaceRoot: base }
}

function levelRoot(level: string, cwd: string | undefined): string {
  if (level === 'project') return projectSkillsDir(cwd ?? process.cwd())
  if (level === 'user') return userSkillsDir()
  throw new Error(`invalid level: ${level}`)
}

async function handleApi(ctx: HostContext, req: IncomingMessage, res: ServerResponse): Promise<void> {
  // prefix 路由的 req.url 是完整路径（含 API_PREFIX），需剥掉前缀得到子路径。
  const pathname = (req.url ?? '').split('?')[0] ?? ''
  const sub = pathname.startsWith(API_PREFIX) ? pathname.slice(API_PREFIX.length) : pathname
  try {
    if (req.method !== 'POST') {
      sendJson(res, { ok: false, error: 'method-not-allowed' })
      return
    }
    const body = await readBody(req)
    const cwd = bodyString(body, 'cwd')

    if (sub === '/list') {
      sendJson(res, await listLocal(ctx, cwd))
      return
    }
    if (sub === '/search') {
      const page = await searchSkills(nodeFetch, {
        ...(bodyString(body, 'keyword') !== undefined ? { keyword: bodyString(body, 'keyword') } : {}),
        ...(bodyString(body, 'category') !== undefined ? { category: bodyString(body, 'category') } : {}),
        ...(bodyString(body, 'sortBy') !== undefined ? { sortBy: bodyString(body, 'sortBy') } : {}),
        ...(bodyNumber(body, 'page') !== undefined ? { page: bodyNumber(body, 'page') } : {}),
        ...(bodyNumber(body, 'pageSize') !== undefined ? { pageSize: bodyNumber(body, 'pageSize') } : {}),
      })
      sendJson(res, { ok: true, total: page.total, page: page.page, skills: page.items })
      return
    }
    if (sub === '/install') {
      const slug = bodyString(body, 'slug')
      const namespace = bodyString(body, 'namespace')
      if (slug === undefined || namespace === undefined) throw new Error('missing slug/namespace')
      const zip = await downloadSkillZip(nodeFetch, slug, namespace)
      const path = await installZip(levelRoot(bodyString(body, 'level') ?? 'user', cwd), slug, zip)
      sendJson(res, { ok: true, path })
      return
    }
    if (sub === '/uninstall') {
      const name = bodyString(body, 'name')
      if (name === undefined) throw new Error('missing name')
      await removeSkill(levelRoot(bodyString(body, 'level') ?? '', cwd), name)
      sendJson(res, { ok: true })
      return
    }
    if (sub === '/set-level') {
      const name = bodyString(body, 'name')
      const to = bodyString(body, 'to')
      if (name === undefined || to === undefined) throw new Error('missing name/to')
      const toRoot = levelRoot(to, cwd)
      const fromRoot = to === 'project' ? userSkillsDir() : projectSkillsDir(cwd ?? process.cwd())
      const path = await moveSkill(fromRoot, toRoot, name)
      sendJson(res, { ok: true, path })
      return
    }
    sendJson(res, { ok: false, error: 'unknown-endpoint' })
  } catch (error) {
    if (error instanceof Error && error.name === 'SkillAlreadyExists') {
      sendJson(res, { ok: false, error: 'already-exists' })
      return
    }
    sendJson(res, { ok: false, error: errorText(error) })
  }
}

/* ---------------------------------------------------------------- */
/* 模型工具 dsh_skillhub_search                                        */
/* ---------------------------------------------------------------- */

interface SearchArgs {
  readonly keyword?: string
  readonly category?: string
  readonly sortBy?: string
  readonly page?: number
}

type ToolValue =
  | {
      readonly ok: true
      readonly total: number
      readonly page: number
      readonly items: readonly SkillHubItem[]
    }
  | { readonly ok: false; readonly kind: 'timeout' | 'http-error' | 'error'; readonly message: string; readonly status?: number }

function coerceArgs(raw: unknown): SearchArgs {
  const record = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    keyword: typeof record['keyword'] === 'string' ? record['keyword'] : undefined,
    category: typeof record['category'] === 'string' ? record['category'] : undefined,
    sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
    page: typeof record['page'] === 'number' ? record['page'] : undefined,
  }
}

async function executeSearch(rawArgs: unknown, signal: AbortSignal): Promise<ToolValue> {
  const args = coerceArgs(rawArgs)
  try {
    const page = await searchSkills(nodeFetch, {
      ...(args.keyword === undefined ? {} : { keyword: args.keyword }),
      ...(args.category === undefined ? {} : { category: args.category }),
      ...(args.sortBy === undefined ? {} : { sortBy: args.sortBy }),
      ...(args.page === undefined ? {} : { page: args.page }),
      pageSize: 10,
    }, { signal, timeoutMs: 10000 })
    return { ok: true, total: page.total, page: page.page, items: page.items }
  } catch (error) {
    if (signal.aborted) throw error
    if (error instanceof SkillHubTimeoutError) {
      return { ok: false, kind: 'timeout', message: 'SkillHub 搜索超时（10 秒），请稍后重试。' }
    }
    if (error instanceof SkillHubHttpError) {
      return { ok: false, kind: 'http-error', status: error.status, message: error.message }
    }
    return { ok: false, kind: 'error', message: errorText(error) }
  }
}

function renderValue(value: ToolValue): string {
  if (!value.ok) return `SkillHub 搜索失败（${value.kind}）：${value.message}`
  if (value.items.length === 0) return `没有找到匹配的技能（共 ${value.total} 个）。换个关键词或同义词再试。`
  const lines = value.items.map((item, index) => {
    const rank = (value.page - 1) * 10 + index + 1
    const desc = item.description === '' ? '' : ` — ${item.description.slice(0, 80)}`
    return `${rank}. ${item.name}（@${item.namespace}/${item.slug}）下载 ${item.downloads} 安装 ${item.installs}${desc}\n   主页：https://www.skillhub.cn/skills/${item.namespace}/${item.slug}`
  })
  return [
    `SkillHub 技能搜索：共 ${value.total} 个，第 ${value.page} 页 ${value.items.length} 条：`,
    ...lines,
    '',
    '安装建议：引导用户打开 Web UI 侧边栏底部的「Skills 商城」面板搜索安装（可选项目级/用户级）；',
    '或征得用户同意后，把 zip 下载链接交给 shell 解压到对应 .agents/skills 目录。',
  ].join('\n')
}

const searchTool: ToolDefinitionLike = {
  name: 'dsh_skillhub_search',
  description: [
    '搜索 SkillHub（skillhub.cn）技能商城的公开技能（无需密钥）。',
    '用户询问「有没有……的 skill / 找个处理 X 的技能 / SkillHub 上搜一下」时使用。',
    '返回候选列表（名称、@namespace/slug、分类、下载/安装量、简介、主页链接）。',
  ].join(''),
  parameters: {
    type: 'object',
    properties: {
      keyword: { type: 'string', description: '搜索关键词（分词搜索），留空列出热门。' },
      category: { type: 'string', description: '一级分类，如 office-efficiency、dev-programming、data-analysis、ai-agent 等。' },
      sortBy: { type: 'string', enum: ['score', 'downloads', 'installs', 'newest'], description: '排序：score（默认）/ downloads / installs / newest。' },
      page: { type: 'number', description: '页码（1 起，每页 10 条）。' },
    },
  },
  output: {
    schema: {
      type: 'object',
      required: ['ok'],
      properties: { ok: { type: 'boolean' } },
      additionalProperties: true,
    },
    render: (args, value) => [{ type: 'text', text: renderValue(value as ToolValue) }],
  },
  timeoutMs: 20000,
  isConcurrencySafe: () => true,
  presentCall: (rawArgs) => {
    const args = coerceArgs(rawArgs)
    const what = args.keyword === undefined || args.keyword.trim() === '' ? '热门技能' : `“${args.keyword}”`
    return { card: 'generic', title: `搜索 SkillHub 技能：${what}`, kind: 'search' }
  },
  execute: (args, exec) => executeSearch(args, exec.signal),
}

/** 挂载 Host 半：同源 API 路由 + 模型工具。 */
export function apply(ctx: HostContext): void {
  ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: (req, res) => handleApi(ctx, req, res),
  })
  ctx.tools.register(searchTool)
}

// findProjectRoot 从 core/local 间接导出，供测试与调试核对。
export { findProjectRoot }
