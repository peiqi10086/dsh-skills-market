/**
 * dsh-skills-market 浏览器半入口：
 * - 注册文案字典与面板样式（<style data-plugin="dsh-skills-market">，ctx.effect 清理）；
 * - sidebar.footer.action 放入口按钮，shell.overlay 放浮动面板；
 * - 数据通道是同源 JSON API（host 半注册的 /plugins/dsh-skills-market/api/*）。
 */
import type { ClientContextLike } from '../contracts.ts'
import { NS, en, zh } from './locales.ts'
import { SkillsEntry, SkillsOverlay } from './panel.tsx'
import { SkillsStore } from './store.ts'
import { SKILLS_CSS } from './styles.ts'

export const name = 'dsh-skills-market'
export const inject = ['slots', 'locale', 'sessions', 'workspaces']

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

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'skills-market',
    // order 约定：条目按 order 升序排，Cordis Plugin 固定 0 且弹层向上展开，
    // 排在它下面会遮挡弹层——所有插件一律负数（插件市场 -50，本插件 -40）。
    order: -40,
    label: () => 'Skills 管理',
    locale: NS,
    inject: () => ({ store }),
  }, SkillsEntry))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'skills-market-overlay',
    order: 101,
    locale: NS,
    inject: () => ({ store }),
  }, SkillsOverlay))
}
