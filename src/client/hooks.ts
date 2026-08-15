/** store → React 的订阅桥（useSyncExternalStore；快照不可变，selector 返回稳定引用）。 */
import { useSyncExternalStore } from 'react'
import type { PanelSnapshot, SkillsStore } from './store.ts'

/** 订阅 store 并选取派生值；selector 必须返回稳定引用（快照字段或原始值）。 */
export function useSkillsSelector<T>(store: SkillsStore, selector: (snapshot: PanelSnapshot) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()))
}
