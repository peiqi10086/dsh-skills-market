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
    ctx.effect(() => bs.registerTab({
      id: BETTER_TAB_ID,
      title: () => sharedT('entry.label'),
      icon: (size: number) => h(IconSparkle16, { size }),
      order: 60,
      single: true,
      component: () => h(PanelBody, { store, t: sharedT }),
    }), 'skills-market: betterSidebar tab')
  }

  /** 入口点击：有 better-sidebar → 注册并定向打开其 tab；否则默认浮窗。 */
  function openManager(): void {
    const bs = getBetterSidebar()
    // 临时诊断（确认 better-sidebar 探测路径后移除）：在 DevTools console 可见。
    console.log('[skills-market] openManager: betterSidebar =', bs === undefined ? 'absent' : `present(version=${String(bs.version)}) openTab=${typeof bs.openTab}`)
    if (bs !== undefined && typeof bs.registerTab === 'function') {
      ensureTabRegistered(bs)
      if (typeof bs.openTab === 'function') {
        bs.openTab({ type: BETTER_TAB_ID })
        return
      }
      // 旧版 better-sidebar 没有定向打开：tab 已进 + 菜单，同时退回浮窗。
    }
    store.openPanel()
  }

  // 服务可能已激活（组合顺序在前）：立即尝试注册；否则延迟到首次点击。
  const early = getBetterSidebar()
  if (early !== undefined && typeof early.registerTab === 'function') ensureTabRegistered(early)

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
