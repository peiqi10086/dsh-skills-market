/**
 * 面板样式：全部颜色引用 --dsw-alias-* 设计令牌（body[data-ds-dark-theme] 自动切暗色）。
 * 以 <style data-plugin="dsh-skills-market"> 注入，随 fiber 回收。
 * 入口几何与官方 Cordis 徽标/设置行逐项对齐（同 dsh-plugin-market 的 .dshm-entry）。
 */
export const SKILLS_CSS = `
.dshs-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-entry-icon:hover { background: var(--dsw-alias-interactive-bg-hover); }

/* 宽栏入口行：几何参数逐项抄自官方设置触发行（SettingsRoot.module.css .trigger）——
   width: calc(100% + 8px) + margin: 4px -4px 的 bleed 使图标左缘净落在 6px，
   与 Cordis 徽标（padding-left: 6px）和设置行精确对齐，悬停底色带同宽。 */
.dshs-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 8px);
  height: 34px;
  margin: 4px -4px;
  padding: 6px 2px 6px 10px;
  box-sizing: border-box;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-entry:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-entry span {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 让侧栏 footer action 区域竖排：每个入口独占一行。
   通过 slot 的稳定标记属性定位容器（不依赖会被重新哈希的类名）；
   若官方侧栏 DOM 结构变化，此规则静默失效，仅退回横向一行，无副作用。 */
div:has(> [data-slot="sidebar.footer.action"]) {
  flex-direction: column;
}

.dshs-root {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: min(720px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  pointer-events: auto;
  z-index: 90;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.dshs-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-head-title { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.dshs-head-title strong { font-size: 14px; }
.dshs-head-title span { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.dshs-icon-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }

.dshs-maintabs {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-grouptabs {
  display: flex;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  flex-wrap: wrap;
  align-items: center;
}
.dshs-tab {
  padding: 4px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-tab.active {
  border-color: var(--dsw-alias-state-business-primary);
  color: var(--dsw-alias-state-business-primary);
  font-weight: 600;
}
.dshs-tab.current { font-weight: 600; }
.dshs-refresh { margin-left: auto; }

.dshs-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-search {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-tertiary);
}
.dshs-search input {
  flex: 1;
  min-width: 0;
  height: 30px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
/* 搜索按钮固定宽度：文案在「搜索 / 搜索中…」间切换时不引起工具栏宽度抖动。 */
.dshs-search-btn {
  min-width: 96px;
  justify-content: center;
  flex-shrink: 0;
}
.dshs-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.dshs-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
.dshs-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 16px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
}
.dshs-pathhint {
  padding: 6px 16px 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  word-break: break-all;
}
.dshs-note {
  margin-top: 10px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
.dshs-error {
  margin: 8px 16px 0;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
.dshs-ok { color: var(--dsw-alias-state-success-primary); font-size: 12px; }

.dshs-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}
.dshs-row.readonly { opacity: 0.72; }
.dshs-row.dimmed { border-style: dashed; }
.dshs-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-state-success-primary);
  border-radius: 999px;
  background: var(--dsw-alias-state-success-tertiary);
  color: var(--dsw-alias-state-success-primary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-toggle:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-toggle:disabled { opacity: 0.5; cursor: default; }
.dshs-toggle.off {
  border-color: var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
}
.dshs-row-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.dshs-name { font-weight: 600; color: var(--dsw-alias-state-business-primary); }
.dshs-badge {
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
  font-size: 11px;
}
.dshs-badge.project {
  background: var(--dsw-alias-state-success-tertiary);
  color: var(--dsw-alias-state-success-primary);
}
.dshs-badge.user {
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
}
.dshs-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-desc {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.dshs-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dshs-icon { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
.dshs-link {
  color: var(--dsw-alias-state-business-primary);
  text-decoration: none;
  font-size: 12px;
  margin-left: auto;
}
.dshs-link:hover { text-decoration: underline; }

.dshs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-inverted);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-btn:hover { background: var(--dsw-alias-button-primary-hover); }
.dshs-btn:disabled { opacity: 0.5; cursor: default; }
.dshs-btn.ghost {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l2);
}
.dshs-btn.ghost:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-btn.danger {
  background: transparent;
  color: var(--dsw-alias-state-error-primary);
  border: 1px solid var(--dsw-alias-state-error-primary);
}
.dshs-btn.danger:hover { background: var(--dsw-alias-interactive-bg-hover); }

/* 点击外部自动关闭的透明背板（shell.overlay 层默认点击穿透，需显式 opt-in）。 */
.dshs-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  z-index: 89;
}

/* 分页栏 */
.dshs-pager {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  flex-wrap: wrap;
}
.dshs-page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-page-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-page-btn:disabled { opacity: 0.4; cursor: default; }
.dshs-page-btn.current {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
  opacity: 1;
}
.dshs-page-gap { color: var(--dsw-alias-label-tertiary); padding: 0 2px; }
.dshs-page-jump {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
.dshs-page-input {
  width: 44px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  outline: none;
  text-align: center;
}
.dshs-page-input:focus { border-color: var(--dsw-alias-border-l3); }
.dshs-page-info { margin-left: auto; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-totalbar {
  padding: 4px 16px 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
`
