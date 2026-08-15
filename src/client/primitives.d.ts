/**
 * @deepseek-ai/dsh-client-ui-primitives 的 ambient 声明（平台模块，运行时由加载器模块表应答）。
 * 仅声明本插件用到的导出，逐条对照 0.1.0-rc.6 源码（icons/props.ts IconProps: { size?, className? }）。
 */
declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ComponentType, ReactNode } from 'react'

  /** 悬停提示气泡（Tooltip.tsx）。 */
  export const Tooltip: ComponentType<{
    label: string
    side?: 'top' | 'bottom' | 'left' | 'right'
    delayMs?: number
    disabled?: boolean
    children?: ReactNode
  }>

  export const IconSparkle16: ComponentType<{ size?: number; className?: string }>
  export const IconCloseOutline16: ComponentType<{ size?: number; className?: string }>
  export const IconRefreshOutline16: ComponentType<{ size?: number; className?: string }>
  export const IconSearchOutline16: ComponentType<{ size?: number; className?: string }>
  export const IconDownloadOutline16: ComponentType<{ size?: number; className?: string }>
  export const IconWarningOutline16: ComponentType<{ size?: number; className?: string }>
}
