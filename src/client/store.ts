/**
 * 面板状态 store：与 React 解耦——getSnapshot/subscribe 形状由 hooks.ts 包成 selector hook。
 * 数据通道是同源 JSON API（/plugins/dsh-skills-market/api/*，由 host 半注册），
 * 不存在跨域/CORS/沙箱问题。
 */
import type {
  SessionsServiceLike,
  WorkspaceId,
  WorkspacesServiceLike,
} from '../contracts.ts'
import type { SkillHubItem } from '../core/skillhub.ts'

/** 同源 API 前缀（与 host 半的路由一致）。 */
const API_PREFIX = '/plugins/dsh-skills-market/api'

/** 已安装列表每页条数；商城每页条数（默认值，与 dsh-plugin-market 一致）。 */
export const GROUP_PAGE_SIZE = 30
export const MARKET_PAGE_SIZE = 30

/** 可选的每页条数（与 dsh-plugin-market 一致）。 */
export const GROUP_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100] as const
export const MARKET_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100] as const

export interface LocalSkill {
  readonly level: 'project' | 'user' | 'builtin'
  readonly manageable: boolean
  readonly source: string
  readonly dir: string
  readonly name: string
  readonly description: string
  /** 模型（AI）调用面是否启用。 */
  readonly modelInvocable: boolean
  /** 用户（/name 手势）调用面是否启用。 */
  readonly userInvocable: boolean
}

export interface GroupData {
  readonly skills: readonly LocalSkill[]
  readonly projectDir: string
  readonly userDir: string
  readonly workspaceRoot: string
}

export interface WorkspaceTab {
  readonly id: string
  readonly path: string
  readonly label: string
  readonly current: boolean
}

export type LoadStatus = 'idle' | 'loading' | 'error'

export interface PanelSnapshot {
  readonly open: boolean
  readonly mainTab: 'installed' | 'market'
  /** 已安装分组页签：'user' | 'builtin' | 'ws:<path>'。 */
  readonly groupKey: string
  readonly groupData: Readonly<Record<string, GroupData | undefined>>
  readonly groupStatus: LoadStatus
  readonly groupError?: string
  readonly groupPage: number
  readonly groupPerPage: number
  /** 已安装列表的组内筛选词。 */
  readonly groupQuery: string
  readonly busy: Readonly<Record<string, boolean>>
  readonly confirmKey: string
  readonly workspaces: readonly WorkspaceTab[]
  /** 商城。 */
  readonly query: string
  readonly category: string
  readonly sortBy: string
  readonly marketPage: number
  readonly marketPerPage: number
  readonly marketStatus: LoadStatus
  readonly marketError?: string
  readonly marketItems: readonly SkillHubItem[]
  readonly marketTotal: number
  /** slug → 安装状态。 */
  readonly installState: Readonly<Record<string, string>>
}

const INITIAL: PanelSnapshot = {
  open: false,
  mainTab: 'installed',
  groupKey: 'user',
  groupData: {},
  groupStatus: 'idle',
  groupPage: 1,
  groupPerPage: GROUP_PAGE_SIZE,
  groupQuery: '',
  busy: {},
  confirmKey: '',
  workspaces: [],
  query: '',
  category: '',
  sortBy: 'score',
  marketPage: 1,
  marketPerPage: MARKET_PAGE_SIZE,
  marketStatus: 'idle',
  marketItems: [],
  marketTotal: 0,
  installState: {},
}

interface ApiReply {
  readonly ok: boolean
  readonly error?: string
  readonly [key: string]: unknown
}

/** 调同源 JSON API；ok:false 时抛错。 */
async function callApi(op: string, body: Record<string, unknown>): Promise<ApiReply> {
  const res = await fetch(`${API_PREFIX}/${op}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json() as ApiReply
  if (data.ok !== true) throw new Error(data.error ?? `http-${res.status}`)
  return data
}

function pathBasename(p: string): string {
  const parts = p.replace(/[\\/]+$/, '').split(/[\\/]/)
  const last = parts[parts.length - 1]
  return last === undefined || last === '' ? p : last
}

export class SkillsStore {
  private state: PanelSnapshot = INITIAL
  private readonly listeners = new Set<() => void>()
  private searchSeq = 0

  constructor(
    private readonly workspaces: WorkspacesServiceLike,
    private readonly sessions: SessionsServiceLike,
  ) {}

  getSnapshot = (): PanelSnapshot => this.state

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private set(patch: Partial<PanelSnapshot>): void {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener()
  }

  /** 订阅 workspace 列表（在 apply 里以 ctx.effect 注册清理）。 */
  bindWorkspaces(): () => void {
    const sync = (): void => {
      const ws = this.workspaces.list.getSnapshot()
      const sessions = this.sessions.list.getSnapshot()
      const currentSession = sessions.current
      const mapped: WorkspaceTab[] = []
      for (const item of ws.items) {
        if (typeof item.path !== 'string' || item.path === '') continue
        const owns = currentSession !== undefined && item.sessionIds.includes(currentSession)
        mapped.push({
          id: String(item.workspaceId),
          path: item.path,
          label: item.title !== '' ? item.title : pathBasename(item.path),
          current: owns || (currentSession === undefined && item.workspaceId === ws.recentWorkspaceId),
        })
      }
      if (currentSession === undefined) {
        for (const tab of mapped) {
          if (tab.id === String(ws.recentWorkspaceId)) {
            mapped.splice(mapped.indexOf(tab), 1)
            mapped.unshift({ ...tab, current: true })
            break
          }
        }
      }
      mapped.sort((a, b) => (a.current === b.current ? 0 : a.current ? -1 : 1))
      const oldSig = this.state.workspaces.map(w => w.path).join('|')
      const newSig = mapped.map(w => w.path).join('|')
      if (oldSig === newSig) return
      const prevCwd = this.currentCwd()
      // 工作区集合变化：丢弃 ws: 分组缓存，强制重新拉取。
      const groupData: Record<string, GroupData | undefined> = {}
      for (const [key, value] of Object.entries(this.state.groupData)) {
        if (!key.startsWith('ws:')) groupData[key] = value
      }
      this.set({ workspaces: mapped, groupData })
      // 当前工作区变化：安装结果是针对旧工作区的瞬时状态，清掉避免误导。
      if (this.currentCwd() !== prevCwd) this.set({ installState: {} })
    }
    sync()
    const unsubWs = this.workspaces.list.subscribe(sync)
    const unsubSessions = this.sessions.list.subscribe(sync)
    return () => { unsubWs(); unsubSessions() }
  }

  /** 当前工作区路径（商城「装到项目级」的目标；无工作区时为 undefined → host 回退会话目录）。 */
  currentCwd(): string | undefined {
    const current = this.state.workspaces.find(w => w.current)
    return (current ?? this.state.workspaces[0])?.path
  }

  /** 分组页签的 cwd（user/builtin 不带 cwd）。 */
  groupCwd(key: string = this.state.groupKey): string | undefined {
    return key.startsWith('ws:') ? key.slice(3) : undefined
  }

  /**
   * 确保首屏数据已加载（已安装当前分组 + 安装标记清单 + 商城首页）。
   * 浮窗经 openPanel 触发；better-sidebar tab 挂载时由 PanelBody 触发——
   * 否则 tab 路径下没有任何入口触发初始加载，会一直停在"正在加载"。
   */
  ensureLoaded(): void {
    void this.loadGroup()
    this.ensureInstallGroups()
    if (this.state.marketStatus === 'idle') void this.runMarketSearch(1)
  }

  openPanel(): void {
    const firstOpen = !this.state.open
    // 打开时定位到当前工作区的页签；没有打开的工作区则回退用户级。
    const current = this.state.workspaces.find(w => w.current)
    const groupKey = current !== undefined ? `ws:${current.path}` : 'user'
    this.set({ open: true, groupKey, groupPage: 1, groupQuery: '', confirmKey: '' })
    void this.loadGroup()
    this.ensureInstallGroups()
    if (firstOpen && this.state.marketStatus === 'idle') void this.runMarketSearch(1)
  }

  closePanel(): void {
    this.set({ open: false })
  }

  setMainTab(mainTab: 'installed' | 'market'): void {
    this.set({ mainTab })
    if (mainTab === 'installed') void this.loadGroup()
    else {
      this.ensureInstallGroups()
      if (this.state.marketStatus === 'idle') void this.runMarketSearch(1)
    }
  }

  setGroup(groupKey: string): void {
    if (groupKey === this.state.groupKey) return
    this.set({ groupKey, groupPage: 1, groupQuery: '', confirmKey: '' })
    void this.loadGroup()
  }

  setGroupPage(groupPage: number): void {
    this.set({ groupPage })
  }

  /** 已安装列表的组内筛选词（客户端过滤，不发请求）。 */
  setGroupQuery(groupQuery: string): void {
    this.set({ groupQuery, groupPage: 1 })
  }

  /** 已安装列表每页条数：回到第一页。 */
  setGroupPerPage(groupPerPage: number): void {
    if (groupPerPage === this.state.groupPerPage) return
    if (!(GROUP_PER_PAGE_OPTIONS as readonly number[]).includes(groupPerPage)) return
    this.set({ groupPerPage, groupPage: 1 })
  }

  setConfirmKey(confirmKey: string): void {
    this.set({ confirmKey })
  }

  /** 拉取当前分组（带缓存）。 */
  async loadGroup(force = false): Promise<void> {
    await this.loadGroupKey(this.state.groupKey, force)
  }

  /** 拉取指定分组（user/builtin/ws:<path>）的 skills；带缓存，可静默后台加载。 */
  async loadGroupKey(key: string, force = false): Promise<void> {
    if (!force && this.state.groupData[key] !== undefined) return
    const isActive = key === this.state.groupKey
    if (isActive) {
      this.set({ groupStatus: this.state.groupData[key] === undefined ? 'loading' : 'idle', groupError: undefined })
    }
    try {
      const body: Record<string, unknown> = {}
      const cwd = this.groupCwd(key)
      if (cwd !== undefined) body['cwd'] = cwd
      const data = await callApi('list', body)
      const groupData = { ...this.state.groupData, [key]: data as unknown as GroupData }
      this.set(isActive ? { groupData, groupStatus: 'idle' } : { groupData })
    } catch (error) {
      if (isActive) {
        this.set({ groupStatus: 'error', groupError: error instanceof Error ? error.message : String(error) })
      }
    }
  }

  /**
   * 商城安装标记的数据源（VS Code 式本地清单 join）：确保「用户级」与
   * 「当前工作区项目级」两组本地清单已加载，商城卡片据此判定已安装状态。
   */
  ensureInstallGroups(): void {
    void this.loadGroupKey('user')
    const cwd = this.currentCwd()
    if (cwd !== undefined) void this.loadGroupKey(`ws:${cwd}`)
  }

  /** 刷新当前分组（清全部缓存）。 */
  refreshGroup(): void {
    this.set({ groupData: {} })
    void this.loadGroup(true)
  }

  private setBusy(rowKey: string, value: boolean): void {
    const busy = { ...this.state.busy }
    if (value) busy[rowKey] = true
    else delete busy[rowKey]
    this.set({ busy })
  }

  /** 启停防抖定时器（rowKey → timer）与真实重载序号。 */
  private toggleTimers: Record<string, ReturnType<typeof setTimeout> | undefined> = {}
  private invocationSeq = 0

  /**
   * 启停开关（带防抖）：乐观补丁立即生效（界面即时翻转），400ms 内快速连点
   * 合并为一次真实写入，避免抖动。
   */
  queueInvocationToggle(rowKey: string, body: Record<string, unknown>): void {
    this.patchInvocation(body)
    const prev = this.toggleTimers[rowKey]
    if (prev !== undefined) clearTimeout(prev)
    this.toggleTimers[rowKey] = setTimeout(() => {
      delete this.toggleTimers[rowKey]
      void this.runRowAction(rowKey, 'set-invocation', body)
    }, 400)
  }

  /** 乐观更新：把新开关状态直接补丁进本地清单缓存（绕过 watcher 去抖延迟）。 */
  private patchInvocation(body: Record<string, unknown>): void {
    const patch: { modelInvocable?: boolean; userInvocable?: boolean } = {}
    if (typeof body['modelInvocable'] === 'boolean') patch.modelInvocable = body['modelInvocable']
    if (typeof body['userInvocable'] === 'boolean') patch.userInvocable = body['userInvocable']
    const groupData: Record<string, GroupData | undefined> = {}
    for (const [key, group] of Object.entries(this.state.groupData)) {
      groupData[key] = group === undefined ? group : {
        ...group,
        skills: group.skills.map(s =>
          s.dir === body['name'] && s.level === body['level'] ? { ...s, ...patch } : s),
      }
    }
    this.set({ groupData })
  }

  /** 行操作（删除 / 设为用户级 / 启停调用面）；完成后刷新本地清单。 */
  async runRowAction(rowKey: string, op: 'uninstall' | 'set-level' | 'set-invocation', body: Record<string, unknown>): Promise<void> {
    this.setBusy(rowKey, true)
    this.set({ confirmKey: '' })
    try {
      const payload = { ...body }
      const cwd = this.groupCwd()
      if (cwd !== undefined) payload['cwd'] = cwd
      await callApi(op, payload)
      this.setBusy(rowKey, false)
      if (op === 'set-invocation') {
        // 乐观补丁已由 queueInvocationToggle 打上；此处只做延迟真实重载。
        // 重载不清空缓存（无闪烁），且只执行最后一次（防抖期间多次调用不叠加）。
        const seq = ++this.invocationSeq
        setTimeout(() => {
          if (seq !== this.invocationSeq) return
          void this.loadGroup(true)
          this.ensureInstallGroups()
        }, 1500)
        return
      }
      this.set({ groupData: {} })
      await this.loadGroup(true)
      // 变更后重建本地清单，商城的安装标记随即与磁盘一致。
      this.ensureInstallGroups()
    } catch (error) {
      this.setBusy(rowKey, false)
      this.set({ groupStatus: 'error', groupError: error instanceof Error ? error.message : String(error) })
    }
  }

  /* ---------------- 商城 ---------------- */

  /** 搜索框只更新文本，不发请求（手动搜索：按钮或回车触发）。 */
  setQuery(query: string): void {
    this.set({ query })
  }

  /** 手动触发搜索（搜索按钮 / 输入框回车）。 */
  submitSearch(): void {
    void this.runMarketSearch(1)
  }

  setCategory(category: string): void {
    if (category === this.state.category) return
    this.set({ category })
    void this.runMarketSearch(1)
  }

  setSortBy(sortBy: string): void {
    if (sortBy === this.state.sortBy) return
    this.set({ sortBy })
    void this.runMarketSearch(1)
  }

  goToMarketPage(page: number): void {
    if (this.state.marketStatus === 'loading') return
    const totalPages = Math.max(1, Math.ceil(this.state.marketTotal / this.state.marketPerPage))
    const target = Math.max(1, Math.min(page, totalPages))
    if (target === this.state.marketPage) return
    void this.runMarketSearch(target)
  }

  /** 商城每页条数：回到第一页重新搜索。 */
  setMarketPerPage(marketPerPage: number): void {
    if (marketPerPage === this.state.marketPerPage || this.state.marketStatus === 'loading') return
    if (!(MARKET_PER_PAGE_OPTIONS as readonly number[]).includes(marketPerPage)) return
    this.set({ marketPerPage })
    void this.runMarketSearch(1)
  }

  /** 手动刷新商城：清本地清单缓存并重查（安装标记与磁盘重新对齐）。 */
  refreshMarket(): void {
    this.set({ groupData: {} })
    this.ensureInstallGroups()
    void this.runMarketSearch(this.state.marketPage)
  }

  async runMarketSearch(page: number): Promise<void> {
    const seq = ++this.searchSeq
    this.set({ marketStatus: 'loading', marketError: undefined })
    try {
      const body: Record<string, unknown> = {
        keyword: this.state.query,
        category: this.state.category,
        sortBy: this.state.sortBy,
        page,
        pageSize: this.state.marketPerPage,
      }
      const data = await callApi('search', body)
      if (seq !== this.searchSeq) return
      this.set({
        marketStatus: 'idle',
        marketItems: (data['skills'] as SkillHubItem[]) ?? [],
        marketTotal: Number(data['total']) || 0,
        marketPage: page,
      })
      // 安装标记来自本地清单 join，确保清单已加载。
      this.ensureInstallGroups()
    } catch (error) {
      if (seq !== this.searchSeq) return
      this.set({ marketStatus: 'error', marketError: error instanceof Error ? error.message : String(error) })
    }
  }

  /** 安装一个商城 skill；level=project 时以当前工作区为目标。同名已存在时给出提示（exists）。 */
  async install(item: SkillHubItem, level: 'project' | 'user'): Promise<void> {
    const slug = item.slug
    this.set({ installState: { ...this.state.installState, [slug]: 'installing' } })
    try {
      const body: Record<string, unknown> = { slug, namespace: item.namespace, level }
      const cwd = this.currentCwd()
      if (level === 'project' && cwd !== undefined) body['cwd'] = cwd
      await callApi('install', body)
      // 安装成功：清掉瞬时状态并重建本地清单，已安装标记由清单 join 得出（与磁盘一致）。
      const installState = { ...this.state.installState }
      delete installState[slug]
      this.set({ installState, groupData: {} })
      this.ensureInstallGroups()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const state = message === 'already-exists' ? 'exists' : `error:${message}`
      this.set({ installState: { ...this.state.installState, [slug]: state } })
    }
  }

  /** 截断过长的状态文本。 */
  static shortError(message: string): string {
    return message.length > 200 ? `${message.slice(0, 200)}…` : message
  }
}

/** 供 host 解析用的品牌类型重导出（类型层面）。 */
export type { WorkspaceId }
