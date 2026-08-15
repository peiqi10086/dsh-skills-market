/**
 * 本插件依赖的 DSH 运行时契约（ambient，自备）。
 * 逐条对照 0.1.0-rc.6 源码核对；刻意保持零 @deepseek-ai/* 运行时依赖——
 * 不 value-import 任何 @deepseek-ai/* 包，避免 profile 里出现第二个 cordis 实例。
 * （参照 dsh-plugin-market/src/contracts.ts 的同款约定。）
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

/* ------------------------------------------------------------------ */
/* Host：webServer 路由 + tools 工具注册 + skills 目录服务               */
/* ------------------------------------------------------------------ */

/** 一条 HTTP 路由注册（packages/host/webserver/src/index.ts WebRoute）。 */
export interface WebRouteLike {
  readonly kind: 'exact' | 'prefix'
  readonly path: string
  handler(req: IncomingMessage, res: ServerResponse): void | Promise<void>
}

/** Web 服务器服务（ctx.webServer）。 */
export interface WebServerLike {
  register(route: WebRouteLike): () => void
}

/** 模型内容块（ContentBlock 的最小子集：本插件只产出文本）。 */
export interface TextContentBlock {
  readonly type: 'text'
  readonly text: string
}

/** 工具执行上下文（ToolRunContext 的最小读取面）。 */
export interface ToolRunContextLike {
  readonly signal: AbortSignal
}

/** 原始 JSON Schema 形态的 ToolDefinition（docs/cookbook/adding-a-tool.md）。 */
export interface ToolDefinitionLike {
  readonly name: string
  readonly description: string
  readonly parameters: Record<string, unknown>
  readonly output: {
    readonly schema: Record<string, unknown>
    render(args: unknown, value: unknown): TextContentBlock[]
  }
  readonly timeoutMs?: number
  isConcurrencySafe?(args: unknown): boolean
  presentCall?(args: unknown): unknown
  execute(args: unknown, exec: ToolRunContextLike): Promise<unknown>
}

/** Host 工具注册表服务（ctx.tools）。 */
export interface HostToolsRegistry {
  register(definition: ToolDefinitionLike): void
}

/** skills 目录服务的摘要条目（packages/skill/skill SkillSummary 的最小读取面）。 */
export interface SkillSummaryLike {
  readonly name: string
  readonly description: string
  readonly source: string
  readonly resourceBase?: { readonly kind: string; readonly path?: string }
}

/** skills 服务（ctx.skills，可选读取）。 */
export interface SkillsServiceLike {
  list(options: { cwd?: string; scope?: unknown }): Promise<readonly SkillSummaryLike[]>
}

/** agentPresets 服务（取当前预设作用域，可选读取）。 */
export interface AgentPresetsLike {
  standingKeyFor(id?: string): Promise<unknown>
}

/** Host 插件 apply 收到的上下文（最小面）。 */
export interface HostContext {
  readonly webServer: WebServerLike
  readonly tools: HostToolsRegistry
  get(name: string): unknown
}

/* ------------------------------------------------------------------ */
/* Client：slots / locale / sessions / workspaces                        */
/* ------------------------------------------------------------------ */

export type SessionId = string & { readonly __brand?: 'SessionId' }
export type WorkspaceId = string & { readonly __brand?: 'WorkspaceId' }

/** Workspace 列表项（WorkspaceView 的最小读取面）。 */
export interface WorkspaceItemLike {
  readonly workspaceId: WorkspaceId
  readonly path: string
  readonly title: string
  readonly sessionIds: readonly SessionId[]
}

export interface WorkspaceListSnapshot {
  readonly items: readonly WorkspaceItemLike[]
  readonly recentWorkspaceId?: WorkspaceId
}

export interface SessionListSnapshot {
  readonly current?: SessionId
}

/** 可订阅快照。 */
export interface ObservableSnapshotLike<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

export interface SessionsServiceLike {
  readonly list: ObservableSnapshotLike<SessionListSnapshot>
}

export interface WorkspacesServiceLike {
  readonly list: ObservableSnapshotLike<WorkspaceListSnapshot>
}

/** slot 注册选项。 */
export interface SlotRegistrationOptions {
  readonly name: string
  readonly id?: string
  readonly order?: number
  readonly label?: string | (() => string)
  readonly locale?: string
  inject?: (...args: never[]) => Record<string, unknown>
}

export interface SlotsRegistryLike {
  inject(slotName: string, factory: () => unknown): void
  register(options: SlotRegistrationOptions, component: unknown): () => void
}

export interface LocaleRuntimeLike {
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
}

/** Client 插件 apply 收到的上下文（最小面）。 */
export interface ClientContextLike {
  readonly slots: SlotsRegistryLike
  readonly locale: LocaleRuntimeLike
  readonly sessions: SessionsServiceLike
  readonly workspaces: WorkspacesServiceLike
  get(name: string): unknown
  effect(setup: () => (() => void) | void, label?: string): void
}

/** slot 组件收到的 t 函数。 */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string
