/**
 * dsh-skills-market 浏览器半入口：
 * - 注册文案字典与面板样式（<style data-plugin="dsh-skills-market">，ctx.effect 清理）；
 * - sidebar.footer.action 放入口按钮，shell.overlay 放浮动面板（默认形态）；
 * - 可选适配 dsh-better-sidebar：检测到 ctx.betterSidebar 时向其注册
 *   「Skills 管理」tab（single 单实例），入口点击改为定向打开该 tab；
 *   未安装时回退默认浮窗。数据通道是同源 JSON API（host 半注册）。
 */
import { IconSparkle16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { createElement as h } from 'react'
import type { BetterSidebarLike, ClientContextLike, TranslateFn } from '../contracts.ts'
import { NS, en, zh } from './locales.ts'
import { PanelBody, SkillsEntry, SkillsOverlay } from './panel.tsx'
import { SkillsStore } from './store.ts'
import { SKILLS_CSS } from './styles.ts'

export const name = 'dsh-skills-market'
export const inject = ['slots', 'locale', 'sessions', 'workspaces']

/** better-sidebar 里本插件的 tab id（openTab seed 的 type）。 */
const BETTER_TAB_ID = 'skills-market:manager'

/** 挂载浏览器半。 */
export function apply(ctx: ClientContextLike): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'skills-market: dictionaries')

  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset['plugin'] = 'dsh-skills-market'
    tag.textContent = SKILLS_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'skills-market: styles')

  const store = new SkillsStore(ctx.workspaces, ctx.sessions)
  ctx.effect(() => store.bindWorkspaces(), 'skills-market: workspaces sync')

  // slot 的 t 由注册项 locale: NS 注入；better-sidebar 的 tab 不经过 slot，
  // 共享同一个 t（entry 一定先渲染，sharedT 必有值）。
  let sharedT: TranslateFn = (key) => key

  /* ---------------- better-sidebar 可选适配 ---------------- */

  let tabRegistered = false
  const getBetterSidebar = (): BetterSidebarLike | undefined => ctx.get('betterSidebar') as BetterSidebarLike | undefined

  /** 向 better-sidebar 注册「Skills 管理」tab（幂等；ctx.effect 随 fiber 撤销）。 */
  function ensureTabRegistered(bs: BetterSidebarLike): void {
    if (tabRegistered) return
    tabRegistered = true
    try {
      ctx.effect(() => bs.registerTab({
        id: BETTER_TAB_ID,
        title: () => sharedT('entry.label'),
        icon: (size: number) => h(IconSparkle16, { size }),
        order: 60,
        single: true,
        component: () => h(PanelBody, { store, t: sharedT }),
      }), 'skills-market: betterSidebar tab')
    } catch {
      // 已被注册（重复激活场景）：视为已注册即可。
    }
  }

  /** 本插件 tab 在 better-sidebar 里的位置：右侧栏 / 底部面板 / 未打开。 */
  type TabLocation = 'right' | 'bottom' | 'closed'

  /** 在状态树里查找本 tab 的位置。 */
  function bsTabLocation(bs: BetterSidebarLike): TabLocation {
    if (typeof bs.getSnapshot !== 'function') return 'closed'
    const snapshot = bs.getSnapshot()
    const state = snapshot === undefined ? undefined : snapshot.state
    if (state === undefined || state === null) return 'closed'
    const hasTab = (node: unknown): boolean => {
      if (node === null || node === undefined || typeof node !== 'object') return false
      if (Array.isArray(node)) return node.some(hasTab)
      const record = node as Record<string, unknown>
      if (record['id'] === BETTER_TAB_ID && record['type'] === BETTER_TAB_ID) return true
      return hasTab(record['tabs']) || hasTab(record['children'])
    }
    const record = state as Record<string, unknown>
    if (hasTab(record['splits'])) return 'right'
    if (hasTab(record['bottomSplits'])) return 'bottom'
    return 'closed'
  }

  /** 快照里指定面板（panelOpen 右侧栏 / bottomOpen 底部面板）是否展开。 */
  function bsPanelIsOpen(bs: BetterSidebarLike, key: 'panelOpen' | 'bottomOpen'): boolean {
    if (typeof bs.getSnapshot !== 'function') return false
    const snapshot = bs.getSnapshot()
    const state = snapshot === undefined ? undefined : snapshot.state
    if (state === undefined || state === null) return false
    return (state as Record<string, unknown>)[key] === true
  }

  /**
   * 触发 better-sidebar 自己的面板折叠/展开按钮（它没有暴露面板开关 API，
   * 效果与用户手点完全一致，tab 状态保留）。
   * 定位用其面板图标的固定 SVG 结构（与语言/样式哈希无关）：
   * 右侧栏 IconPanelRightOutline16 → rect x=10.5 width=2.75；
   * 底部面板 IconPanelBottomOutline16 → rect x=3.25 width=9.5。
   */
  function clickPanelToggle(rectX: string, rectWidth: string): boolean {
    const buttons = document.querySelectorAll('button')
    for (const button of buttons) {
      if (button.querySelector(`rect[x="${rectX}"][width="${rectWidth}"]`) !== null) {
        button.click()
        return true
      }
    }
    return false
  }

  const RIGHT_TOGGLE: readonly [string, string] = ['10.5', '2.75']
  const BOTTOM_TOGGLE: readonly [string, string] = ['3.25', '9.5']

  /** 入口点击：有 better-sidebar → 切换本 tab 所在工作台的开/关；否则默认浮窗。 */
  function openManager(): void {
    const bs = getBetterSidebar()
    if (bs !== undefined && typeof bs.registerTab === 'function') {
      ensureTabRegistered(bs)
      if (typeof bs.openTab === 'function') {
        const location = bsTabLocation(bs)
        if (location === 'right') {
          // tab 在右侧栏：面板开着 → 折叠右侧栏（tab 保留）；关着 → openTab 展开
          if (bsPanelIsOpen(bs, 'panelOpen') && clickPanelToggle(...RIGHT_TOGGLE)) return
        } else if (location === 'bottom') {
          if (bsPanelIsOpen(bs, 'bottomOpen')) {
            // tab 在底部面板且面板开着 → 折叠底部面板（tab 保留）
            if (clickPanelToggle(...BOTTOM_TOGGLE)) return
          } else if (clickPanelToggle(...BOTTOM_TOGGLE)) {
            // 底部面板关着 → 展开并聚焦本 tab
            if (typeof bs.activateTab === 'function') bs.activateTab(BETTER_TAB_ID)
            return
          }
        } else {
          // tab 未打开：seed 带 path 才会触发 better-sidebar 的面板自动展开
          // （type-only 打开按它的设计不展开——面板行为归调用方）。
          bs.openTab({ type: BETTER_TAB_ID, path: BETTER_TAB_ID })
          return
        }
        // 兜底（折叠按钮未找到等）：保持可用，走 openTab
        bs.openTab({ type: BETTER_TAB_ID, path: BETTER_TAB_ID })
        return
      }
      // 旧版 better-sidebar 没有定向打开：tab 已进 + 菜单，同时退回浮窗。
    }
    store.openPanel()
  }

  // 服务可能已激活（组合顺序在前）：立即注册。
  const early = getBetterSidebar()
  if (early !== undefined && typeof early.registerTab === 'function') ensureTabRegistered(early)
  // 服务晚于本插件激活（bundle 顺序常态）：cordis 的 internal/service 事件在
  // betterSidebar 被 provide 时触发，届时完成注册——无需用户先点一次。
  ctx.on('internal/service', ((name: string, value: unknown) => {
    if (name !== 'betterSidebar' || value === undefined || value === null) return
    const bs = value as BetterSidebarLike
    if (typeof bs.registerTab === 'function') ensureTabRegistered(bs)
  }) as (...args: never[]) => void)

  /* ---------------- slot 注册 ---------------- */

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'skills-market',
    // order 约定：条目按 order 升序排，Cordis Plugin 固定 0 且弹层向上展开，
    // 排在它下面会遮挡弹层——所有插件一律负数（插件市场 -50，本插件 -40）。
    order: -40,
    label: () => 'Skills 管理',
    locale: NS,
    inject: () => ({ store, onOpen: openManager }),
  }, (props: { wide: boolean; store: SkillsStore; t: TranslateFn; onOpen: () => void }) => {
    sharedT = props.t
    return h(SkillsEntry, props)
  }))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'skills-market-overlay',
    order: 101,
    locale: NS,
    inject: () => ({ store }),
  }, (props: { store: SkillsStore; t: TranslateFn }) => {
    sharedT = props.t
    return h(SkillsOverlay, props)
  }))
}
