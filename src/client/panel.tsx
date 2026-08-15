/**
 * 面板组件：sidebar.footer.action 入口按钮 + shell.overlay 浮动面板。
 * 所有文案经 t()（注册项 locale: NS），所有颜色走 --dsw-alias-* 令牌（styles.ts）。
 */
import { useEffect, useState } from 'react'
import {
  IconCloseOutline16,
  IconDownloadOutline16,
  IconRefreshOutline16,
  IconSearchOutline16,
  IconSparkle16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateFn } from '../contracts.ts'
import { SKILLHUB_CATEGORIES, type SkillHubItem } from '../core/skillhub.ts'
import { useSkillsSelector } from './hooks.ts'
import {
  GROUP_PER_PAGE_OPTIONS,
  MARKET_PER_PAGE_OPTIONS,
  SkillsStore,
  type LocalSkill,
  type WorkspaceTab,
} from './store.ts'

/** 两个 slot 条目共享的注入面（face 的非 hooks 键原样展开为 props）。 */
export interface SkillsInjectedProps {
  readonly store: SkillsStore
  readonly t: TranslateFn
}

/** 入口按钮 props（sidebar.footer.action 拥有方只传 wide）。 */
export interface SkillsEntryProps extends SkillsInjectedProps {
  readonly wide: boolean
  /** 覆盖默认打开行为（装了 better-sidebar 时改为打开其侧边栏 tab）。 */
  readonly onOpen?: () => void
}

/**
 * 侧边栏底部入口：宽栏为图标+文字整行（footerActions 经我们的样式竖排后每入口独占一行，
 * 行高/字号/hover 与 Cordis Plugin、插件市场、设置入口完全一致）；
 * 窄栏为 36px 圆形纯图标 + 悬停提示。图标用 IconSparkle16，与两个既有入口均不撞脸。
 */
export function SkillsEntry({ wide, store, t, onOpen }: SkillsEntryProps) {
  const button = (
    <button
      type="button"
      className={wide ? 'dshs-entry' : 'dshs-entry-icon'}
      aria-label={t('entry.aria')}
      onClick={() => { (onOpen ?? (() => { store.openPanel() }))() }}
    >
      <IconSparkle16 size={wide ? 16 : 18} />
      {wide ? <span>{t('entry.label')}</span> : null}
    </button>
  )
  return wide
    ? button
    : <Tooltip label={t('entry.label')} side="right" delayMs={500}>{button}</Tooltip>
}

function fmtCount(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : String(n)
}

function sourceLabel(source: string, t: TranslateFn): string {
  const key = `source.${source}`
  const translated = t(key)
  return translated === key ? source : translated
}

/** 分页栏页码窗口：当前页前后各 2 页，首尾始终可见。 */
function pageWindow(page: number, totalPages: number): ReadonlyArray<number | '…'> {
  const wanted = new Set<number>([1, totalPages])
  for (let p = page - 2; p <= page + 2; p += 1) {
    if (p >= 1 && p <= totalPages) wanted.add(p)
  }
  const sorted = [...wanted].sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  let prev = 0
  for (const p of sorted) {
    if (prev !== 0 && p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

/** 完整分页栏：上一页 / 页码窗口 / 下一页 / 页码跳转 / 每页条数。 */
function Pagination({ page, totalPages, disabled, perPage, perPageOptions, onPage, onPerPage, t }: {
  page: number
  totalPages: number
  disabled: boolean
  perPage: number
  perPageOptions: readonly number[]
  onPage: (page: number) => void
  onPerPage: (perPage: number) => void
  t: TranslateFn
}) {
  const [jump, setJump] = useState('')
  const submitJump = (): void => {
    const target = Number.parseInt(jump, 10)
    if (Number.isFinite(target)) onPage(target)
    setJump('')
  }
  return (
    <div className="dshs-pager">
      {totalPages > 1
        ? (
          <>
            <button
              type="button"
              className="dshs-page-btn"
              disabled={disabled || page <= 1}
              aria-label={t('page.prev')}
              onClick={() => onPage(page - 1)}
            >
              ‹
            </button>
            {pageWindow(page, totalPages).map((entry, index) => entry === '…'
              ? <span key={`gap-${index}`} className="dshs-page-gap">…</span>
              : (
                <button
                  key={entry}
                  type="button"
                  className={entry === page ? 'dshs-page-btn current' : 'dshs-page-btn'}
                  disabled={disabled || entry === page}
                  onClick={() => onPage(entry)}
                >
                  {entry}
                </button>
              ))}
            <button
              type="button"
              className="dshs-page-btn"
              disabled={disabled || page >= totalPages}
              aria-label={t('page.next')}
              onClick={() => onPage(page + 1)}
            >
              ›
            </button>
            <span className="dshs-page-jump">
              {t('page.jump')}
              <input
                className="dshs-page-input"
                value={jump}
                inputMode="numeric"
                aria-label={t('page.jumpAria')}
                disabled={disabled}
                onChange={event => { setJump(event.target.value) }}
                onKeyDown={event => { if (event.key === 'Enter') submitJump() }}
              />
              <button
                type="button"
                className="dshs-page-btn"
                disabled={disabled || jump.trim() === ''}
                onClick={submitJump}
              >
                {t('page.go')}
              </button>
            </span>
          </>
        )
        : null}
      <span className="dshs-page-info">{t('page.info', { page, pages: totalPages })}</span>
      {perPageOptions.length > 0
        ? (
          <select
            className="dshs-select"
            value={perPage}
            disabled={disabled}
            aria-label={t('page.perPageAria')}
            onChange={event => { onPerPage(Number(event.target.value)) }}
          >
            {perPageOptions.map(option => (
              <option key={option} value={option}>{t('page.perPage', { n: option })}</option>
            ))}
          </select>
        )
        : null}
    </div>
  )
}

/** 已安装：单条 skill 行。启停为单开关（同时控制 AI 调用与 /name 用户调用两面）。 */
function SkillRow({ item, store, t }: { item: LocalSkill; store: SkillsStore; t: TranslateFn }) {
  const busy = useSkillsSelector(store, s => s.busy)
  const confirmKey = useSkillsSelector(store, s => s.confirmKey)
  const rowKey = `${item.level}:${item.dir}`
  const isBusy = busy[rowKey] === true
  const confirming = confirmKey === rowKey
  const enabled = item.modelInvocable && item.userInvocable
  return (
    <div className={`dshs-row${item.manageable ? '' : ' readonly'}${enabled ? '' : ' dimmed'}`}>
      <div className="dshs-row-head">
        <span className="dshs-name">{item.name}</span>
        {item.level === 'project' || item.level === 'user'
          ? <span className={`dshs-badge ${item.level === 'project' ? 'project' : 'user'}`}>{t(`level.${item.level}`)}</span>
          : null}
        {!item.manageable
          ? <span className="dshs-badge">{sourceLabel(item.source, t)} · {t('readonly')}</span>
          : null}
        {!enabled ? <span className="dshs-badge">{t('badge.disabled')}</span> : null}
      </div>
      <div className="dshs-desc">{item.description !== '' ? item.description : t('noDescription')}</div>
      {item.manageable
        ? confirming
          ? (
            /* 删除确认条：提示 + 确认删除 / 取消 */
            <div className="dshs-actions">
              <span className="dshs-confirm-hint">{t('action.deleteHint')}</span>
              <button
                type="button"
                className="dshs-btn danger"
                disabled={isBusy}
                onClick={() => { void store.runRowAction(rowKey, 'uninstall', { name: item.dir, level: item.level }) }}
              >
                {isBusy ? t('action.working') : t('action.deleteConfirm')}
              </button>
              <button
                type="button"
                className="dshs-btn ghost"
                disabled={isBusy}
                onClick={() => { store.setConfirmKey('') }}
              >
                {t('action.cancel')}
              </button>
            </div>
          )
          : (
            <div className="dshs-actions">
              <button
                type="button"
                className={`dshs-toggle${enabled ? '' : ' off'}`}
                disabled={isBusy}
                title={enabled ? t('toggle.disable') : t('toggle.enable')}
                onClick={() => {
                  void store.queueInvocationToggle(rowKey, {
                    name: item.dir,
                    level: item.level,
                    modelInvocable: !enabled,
                    userInvocable: !enabled,
                  })
                }}
              >
                {isBusy ? t('action.working') : `${enabled ? t('toggle.enabled') : t('toggle.disabled')} ${enabled ? '✓' : '✕'}`}
              </button>
              {item.level === 'project'
                ? (
                  <button
                    type="button"
                    className="dshs-btn ghost"
                    disabled={isBusy}
                    onClick={() => { void store.runRowAction(rowKey, 'set-level', { name: item.dir, to: 'user' }) }}
                  >
                    {isBusy ? t('action.working') : t('action.promote')}
                  </button>
                )
                : null}
              <button
                type="button"
                className="dshs-btn danger"
                disabled={isBusy}
                onClick={() => { store.setConfirmKey(rowKey) }}
              >
                {t('action.delete')}
              </button>
            </div>
          )
        : null}
    </div>
  )
}

/** 已安装视图：分组页签（用户级 / 各工作区 / 内置）+ 分组内容。 */
function InstalledView({ store, t }: SkillsInjectedProps) {
  const snapshot = useSkillsSelector(store, s => s)
  const tabs: Array<{ key: string; label: string; current: boolean }> = [
    { key: 'user', label: t('group.user'), current: false },
    ...snapshot.workspaces.map((w: WorkspaceTab) => ({
      key: `ws:${w.path}`,
      label: w.current ? `${w.label} ·${t('group.current')}` : w.label,
      current: w.current,
    })),
    { key: 'builtin', label: t('group.builtin'), current: false },
  ]
  const data = snapshot.groupData[snapshot.groupKey]
  const all = data?.skills ?? []
  const levelItems = snapshot.groupKey === 'user'
    ? all.filter(s => s.level === 'user')
    : snapshot.groupKey === 'builtin'
      ? all.filter(s => s.level === 'builtin')
      : all.filter(s => s.level === 'project')
  // 组内筛选（客户端过滤，按名称/目录名/简介，不区分大小写）。
  const gq = snapshot.groupQuery.trim().toLowerCase()
  const items = gq === ''
    ? levelItems
    : levelItems.filter(s =>
      s.name.toLowerCase().includes(gq)
      || s.dir.toLowerCase().includes(gq)
      || s.description.toLowerCase().includes(gq))
  const totalPages = Math.max(1, Math.ceil(items.length / snapshot.groupPerPage))
  const safePage = Math.min(snapshot.groupPage, totalPages)
  const pageItems = items.slice((safePage - 1) * snapshot.groupPerPage, safePage * snapshot.groupPerPage)
  return (
    <>
      <div className="dshs-grouptabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`dshs-tab${tab.key === snapshot.groupKey ? ' active' : ''}${tab.current ? ' current' : ''}`}
            onClick={() => { store.setGroup(tab.key) }}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          className="dshs-btn ghost dshs-refresh"
          onClick={() => { store.refreshGroup() }}
        >
          {t('action.refresh')}
        </button>
      </div>
      <div className="dshs-toolbar">
        <span className="dshs-search">
          <IconSearchOutline16 size={14} />
          <input
            value={snapshot.groupQuery}
            placeholder={t('installed.filter')}
            onChange={event => { store.setGroupQuery(event.target.value) }}
          />
        </span>
      </div>
      {snapshot.groupStatus === 'error'
        ? <div className="dshs-error">{t('action.error', { message: snapshot.groupError ?? 'unknown' })}</div>
        : null}
      {data !== undefined && snapshot.groupKey !== 'user' && snapshot.groupKey !== 'builtin'
        ? <div className="dshs-pathhint">{t('group.projectDir', { path: data.projectDir })}</div>
        : null}
      {data !== undefined && snapshot.groupKey === 'user'
        ? <div className="dshs-pathhint">{t('group.userDir', { path: data.userDir })}</div>
        : null}
      <div className="dshs-body">
        {data === undefined || snapshot.groupStatus === 'loading'
          ? <div className="dshs-state">{t('group.loading')}</div>
          : items.length === 0
            ? <div className="dshs-state">{t('group.empty')}</div>
            : pageItems.map(item => <SkillRow key={`${item.level}:${item.dir}`} item={item} store={store} t={t} />)}
        {snapshot.groupKey === 'builtin' && data !== undefined
          ? <div className="dshs-note">{t('group.builtinNote')}</div>
          : null}
      </div>
      <Pagination
        page={safePage}
        totalPages={totalPages}
        disabled={false}
        perPage={snapshot.groupPerPage}
        perPageOptions={GROUP_PER_PAGE_OPTIONS}
        onPage={page => { store.setGroupPage(page) }}
        onPerPage={perPage => { store.setGroupPerPage(perPage) }}
        t={t}
      />
    </>
  )
}

/**
 * 商城：单条技能卡片。已安装状态用 VS Code 式「本地清单 join」：
 * 与 store 缓存的 /list 数据（用户级 + 当前工作区项目级）比对 slug/目录名，
 * 随安装/卸载/换级/刷新自动与磁盘对齐；仅重复安装时后端会回 exists 提示。
 */
function MarketCard({ item, store, t }: { item: SkillHubItem; store: SkillsStore; t: TranslateFn }) {
  const installState = useSkillsSelector(store, s => s.installState)
  const userGroup = useSkillsSelector(store, s => s.groupData['user'])
  const projKey = useSkillsSelector(store, (s) => {
    const current = s.workspaces.find(w => w.current) ?? s.workspaces[0]
    return current === undefined ? '' : `ws:${current.path}`
  })
  const projGroup = useSkillsSelector(store, s => (projKey === '' ? undefined : s.groupData[projKey]))
  const matches = (sk: LocalSkill): boolean => sk.dir === item.slug || sk.name === item.slug
  const installedUser = userGroup?.skills.some(sk => sk.level === 'user' && matches(sk)) === true
  const installedProject = projGroup?.skills.some(sk => sk.level === 'project' && matches(sk)) === true
  const state = installState[item.slug]
  const installing = state === 'installing'
  return (
    <div className="dshs-row">
      <div className="dshs-row-head">
        {item.iconUrl !== '' ? <img className="dshs-icon" src={item.iconUrl} alt="" /> : null}
        <span className="dshs-name">{item.name}</span>
        <span className="dshs-badge">{item.category}</span>
        <span className="dshs-meta">{t('stats', { downloads: fmtCount(item.downloads), installs: fmtCount(item.installs) })}</span>
      </div>
      <div className="dshs-desc">{item.description}</div>
      <div className="dshs-actions">
        {installedProject ? <span className="dshs-ok">{t('install.doneProject')}</span> : null}
        {installedUser ? <span className="dshs-ok">{t('install.doneUser')}</span> : null}
        {state === 'exists'
          ? <span className="dshs-meta">{t('install.exists')}</span>
          : null}
        {installing
          ? <span className="dshs-meta">{t('install.working')}</span>
          : (
            <>
              {!installedProject
                ? (
                  <button
                    type="button"
                    className="dshs-btn"
                    onClick={() => { void store.install(item, 'project') }}
                  >
                    <IconDownloadOutline16 size={14} />
                    {t('install.project')}
                  </button>
                )
                : null}
              {!installedUser
                ? (
                  <button
                    type="button"
                    className="dshs-btn ghost"
                    onClick={() => { void store.install(item, 'user') }}
                  >
                    {t('install.user')}
                  </button>
                )
                : null}
            </>
          )}
        {typeof state === 'string' && state.startsWith('error:')
          ? <span className="dshs-error">{SkillsStore.shortError(state.slice(6))}</span>
          : null}
        <a
          className="dshs-link"
          href={`https://www.skillhub.cn/skills/${item.namespace}/${item.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('detail.open')}
        </a>
      </div>
    </div>
  )
}

/** 商城视图：搜索工具栏 + 结果卡片 + 服务端分页。 */
function MarketView({ store, t }: SkillsInjectedProps) {
  const snapshot = useSkillsSelector(store, s => s)
  const loading = snapshot.marketStatus === 'loading'
  const totalPages = Math.max(1, Math.ceil(snapshot.marketTotal / snapshot.marketPerPage))
  return (
    <>
      <div className="dshs-toolbar">
        <span className="dshs-search">
          <IconSearchOutline16 size={14} />
          <input
            value={snapshot.query}
            placeholder={t('search.placeholder')}
            onChange={event => { store.setQuery(event.target.value) }}
            onKeyDown={event => { if (event.key === 'Enter') store.submitSearch() }}
          />
        </span>
        <button
          type="button"
          className="dshs-btn dshs-search-btn"
          disabled={loading}
          onClick={() => { store.submitSearch() }}
        >
          <IconSearchOutline16 size={14} />
          {loading ? t('search.searching') : t('search.button')}
        </button>
        <select
          className="dshs-select"
          value={snapshot.category}
          aria-label={t('category.all')}
          onChange={event => { store.setCategory(event.target.value) }}
        >
          <option value="">{t('category.all')}</option>
          {SKILLHUB_CATEGORIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select
          className="dshs-select"
          value={snapshot.sortBy}
          aria-label={t('sort.score')}
          onChange={event => { store.setSortBy(event.target.value) }}
        >
          <option value="score">{t('sort.score')}</option>
          <option value="downloads">{t('sort.downloads')}</option>
          <option value="installs">{t('sort.installs')}</option>
          <option value="newest">{t('sort.newest')}</option>
        </select>
      </div>
      {snapshot.marketStatus === 'error'
        ? <div className="dshs-error">{t('search.error', { message: snapshot.marketError ?? 'unknown' })}</div>
        : null}
      <div className="dshs-body">
        {loading && snapshot.marketItems.length === 0
          ? <div className="dshs-state">{t('search.searching')}</div>
          : snapshot.marketItems.length === 0
            ? <div className="dshs-state">{t('search.empty')}</div>
            : snapshot.marketItems.map(item => <MarketCard key={item.slug} item={item} store={store} t={t} />)}
      </div>
      {snapshot.marketTotal > 0
        ? (
          <div className="dshs-totalbar">
            <span>{t('search.total', { total: snapshot.marketTotal, page: snapshot.marketPage, pages: totalPages })}</span>
          </div>
        )
        : null}
      <Pagination
        page={snapshot.marketPage}
        totalPages={totalPages}
        disabled={loading}
        perPage={snapshot.marketPerPage}
        perPageOptions={MARKET_PER_PAGE_OPTIONS}
        onPage={page => { store.goToMarketPage(page) }}
        onPerPage={perPage => { store.setMarketPerPage(perPage) }}
        t={t}
      />
    </>
  )
}

/**
 * 面板主体（已安装/商城两页签 + 内容，不含任何外框）。
 * 同时被 SkillsOverlay（默认浮窗）与 better-sidebar 的 tab 组件复用。
 */
export function PanelBody(props: SkillsInjectedProps) {
  const { store, t } = props
  const mainTab = useSkillsSelector(store, s => s.mainTab)
  return (
    <div className="dshs-fill">
      <div className="dshs-maintabs">
        <button
          type="button"
          className={`dshs-tab${mainTab === 'installed' ? ' active' : ''}`}
          onClick={() => { store.setMainTab('installed') }}
        >
          {t('tab.installed')}
        </button>
        <button
          type="button"
          className={`dshs-tab${mainTab === 'market' ? ' active' : ''}`}
          onClick={() => { store.setMainTab('market') }}
        >
          {t('tab.market')}
        </button>
      </div>
      {mainTab === 'installed' ? <InstalledView {...props} /> : <MarketView {...props} />}
    </div>
  )
}

/** shell.overlay 条目：浮动面板（Esc + 透明背板点击关闭）。 */
export function SkillsOverlay(props: SkillsInjectedProps) {
  const { store, t } = props
  const open = useSkillsSelector(store, s => s.open)
  const mainTab = useSkillsSelector(store, s => s.mainTab)
  const marketTotal = useSkillsSelector(store, s => s.marketTotal)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') store.closePanel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open, store])

  if (!open) return null

  return (
    <>
      {/* 透明背板：点击浮窗外的任意位置自动关闭（shell.overlay 层默认点击穿透，
          背板显式 opt-in 指针事件，z-index 比面板低 1）。 */}
      <div className="dshs-backdrop" aria-hidden="true" onClick={() => { store.closePanel() }} />
      <div className="dshs-root" role="dialog" aria-label={t('panel.title')}>
        <div className="dshs-head">
          <IconSparkle16 size={16} />
          <div className="dshs-head-title">
            <strong>{t('panel.title')}</strong>
            <span>
              {mainTab === 'market'
                ? t('panel.subtitle.market', { count: marketTotal })
                : t('panel.subtitle.installed')}
            </span>
          </div>
          <button
            type="button"
            className="dshs-icon-btn"
            aria-label={t('panel.refresh')}
            onClick={() => { mainTab === 'market' ? store.refreshMarket() : store.refreshGroup() }}
          >
            <IconRefreshOutline16 size={14} />
          </button>
          <button type="button" className="dshs-icon-btn" aria-label={t('panel.close')} onClick={() => { store.closePanel() }}>
            <IconCloseOutline16 size={14} />
          </button>
        </div>
        <PanelBody {...props} />
      </div>
    </>
  )
}
