/**
 * 本地 skills 目录核心（仅 host 半使用，Node 文件系统）。
 * 目录约定与 dsh 的 skill-filesystem 保持一致（packages/skill/skill-filesystem）：
 * - 项目级：<projectRoot>/.agents/skills（projectRoot = 从 cwd 向上找最近的 .git）
 * - 用户级：<agentsHome>/skills（agentsHome = DSH_AGENTS_HOME ?? ~/.agents）
 */
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { unzipSync } from 'fflate'

/** kebab-case 的 skill 目录/名称。 */
export function isSkillName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(name)
}

/** 用户级 skills 目录。 */
export function userSkillsDir(): string {
  const agentsHome = resolve(process.env['DSH_AGENTS_HOME'] ?? join(homedir(), '.agents'))
  return join(agentsHome, 'skills')
}

/** 复刻 skill-filesystem findProjectRoot：从 cwd 向上找最近的 .git。 */
export function findProjectRoot(cwd: string): string {
  let current = resolve(cwd)
  while (true) {
    if (existsSync(join(current, '.git'))) return current
    const parent = dirname(current)
    if (parent === current) return resolve(cwd)
    current = parent
  }
}

/** 项目级 skills 目录。 */
export function projectSkillsDir(cwd: string): string {
  return join(findProjectRoot(cwd), '.agents', 'skills')
}

/** 一条本地 skill 的管理视图。 */
export interface LocalSkillRow {
  readonly level: 'project' | 'user'
  readonly dir: string
  readonly name: string
  readonly description: string
  /** 模型（AI）调用面是否启用（默认 true）。 */
  readonly modelInvocable: boolean
  /** 用户（/name 手势）调用面是否启用（默认 true）。 */
  readonly userInvocable: boolean
}

/** 从 SKILL.md 文本提取 frontmatter 的 name/description（逐行、前 60 行内）。 */
export function parseSkillFrontmatter(text: string): { name?: string; description?: string } {
  const out: { name?: string; description?: string } = {}
  const lines = text.split(/\r?\n/, 62)
  for (const line of lines.slice(0, 60)) {
    const nameMatch = /^name:\s*(.+?)\s*$/.exec(line)
    if (nameMatch !== null && out.name === undefined) out.name = nameMatch[1]
    const descMatch = /^description:\s*(.+?)\s*$/.exec(line)
    if (descMatch !== null && out.description === undefined) out.description = descMatch[1]
  }
  return out
}

/** frontmatter 布尔值（与 dsh 解析一致：boolean / 1 / 0 / true|yes|on / false|no|off，不区分大小写）。 */
function frontmatterTruthy(value: string): boolean | undefined {
  const v = value.trim().toLowerCase()
  if (v === 'true' || v === 'yes' || v === 'on' || v === '1') return true
  if (v === 'false' || v === 'no' || v === 'off' || v === '0') return false
  return undefined
}

/** 从 SKILL.md 文本提取调用面开关（缺省两面启用；与 dsh parseInvocationPolicy 同语义）。 */
export function parseInvocation(text: string): { modelInvocable: boolean; userInvocable: boolean } {
  let modelInvocable = true
  let userInvocable = true
  for (const line of text.split(/\r?\n/).slice(0, 80)) {
    const disableModel = /^disable-model-invocation\s*:\s*(.+?)\s*$/.exec(line)
    if (disableModel !== null) {
      const v = frontmatterTruthy(disableModel[1] ?? '')
      if (v !== undefined) modelInvocable = !v
    }
    const userKey = /^user-invocable\s*:\s*(.+?)\s*$/.exec(line)
    if (userKey !== null) {
      const v = frontmatterTruthy(userKey[1] ?? '')
      if (v !== undefined) userInvocable = v
    }
  }
  return { modelInvocable, userInvocable }
}

/** 改写 SKILL.md frontmatter 的调用面开关；启用时移除对应行（缺省即启用）。 */
export async function setSkillInvocation(
  root: string,
  name: string,
  flags: { modelInvocable?: boolean; userInvocable?: boolean },
): Promise<void> {
  if (!isSkillName(name)) throw new Error(`invalid skill name: ${name}`)
  const file = join(root, name, 'SKILL.md')
  if (!existsSync(file)) throw new Error(`skill not found: ${name}`)
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/)
  if (lines[0]?.trim() !== '---') throw new Error('SKILL.md has no YAML frontmatter')
  let end = -1
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i]?.trim() === '---') { end = i; break }
  }
  if (end < 0) throw new Error('SKILL.md frontmatter is not closed')
  const head = lines
    .slice(1, end)
    .filter(line => !/^(disable-model-invocation|user-invocable)\s*:/.test(line))
  if (flags.modelInvocable === false) head.push('disable-model-invocation: true')
  if (flags.userInvocable === false) head.push('user-invocable: false')
  await writeFile(file, ['---', ...head, ...lines.slice(end)].join('\n'))
}

/** 扫描一个 skills 根目录（不存在的目录返回空表）。 */
export async function scanSkillsDir(root: string, level: 'project' | 'user'): Promise<LocalSkillRow[]> {
  if (!existsSync(root)) return []
  const entries = await readdir(root, { withFileTypes: true })
  const rows: LocalSkillRow[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillFile = join(root, entry.name, 'SKILL.md')
    if (!existsSync(skillFile)) continue
    let name = entry.name
    let description = ''
    let modelInvocable = true
    let userInvocable = true
    try {
      const text = await readFile(skillFile, 'utf8')
      const parsed = parseSkillFrontmatter(text)
      if (parsed.name !== undefined) name = parsed.name
      if (parsed.description !== undefined) description = parsed.description
      const invocation = parseInvocation(text)
      modelInvocable = invocation.modelInvocable
      userInvocable = invocation.userInvocable
    } catch {
      // 读取失败时保留目录名兜底。
    }
    rows.push({ level, dir: entry.name, name, description, modelInvocable, userInvocable })
  }
  return rows
}

/**
 * 把 zip 字节安装进目标目录：
 * 自动定位包内 SKILL.md 所在层（根或单层子目录），只落地该层下的文件；
 * 拒绝路径穿越条目；目标已存在时报 already-exists。
 */
export async function installZip(targetRoot: string, slug: string, zip: Uint8Array): Promise<string> {
  if (!isSkillName(slug)) throw new Error(`invalid skill slug: ${slug}`)
  const dest = join(targetRoot, slug)
  if (existsSync(dest)) {
    const error = new Error('already-exists')
    error.name = 'SkillAlreadyExists'
    throw error
  }
  const files = unzipSync(zip)
  const names = Object.keys(files)
  // 定位 SKILL.md 所在的前缀层。
  let prefix: string | undefined
  if (names.some(name => name.replace(/\\/g, '/') === 'SKILL.md')) {
    prefix = ''
  } else {
    for (const name of names) {
      const normalized = name.replace(/\\/g, '/')
      const segments = normalized.split('/')
      if (segments.length === 2 && segments[1] === 'SKILL.md' && segments[0] !== undefined && segments[0] !== '') {
        prefix = `${segments[0]}/`
        break
      }
    }
  }
  if (prefix === undefined) throw new Error('package does not contain SKILL.md')

  const written: Array<[string, Uint8Array]> = []
  for (const [rawName, content] of Object.entries(files)) {
    const normalized = rawName.replace(/\\/g, '/')
    if (!normalized.startsWith(prefix)) continue
    const relative = normalized.slice(prefix.length)
    if (relative === '' || relative.endsWith('/')) continue
    const segments = relative.split('/')
    if (segments.some(segment => segment === '..' || segment === '')) continue
    written.push([relative, content])
  }
  if (written.length === 0) throw new Error('package is empty')

  await mkdir(targetRoot, { recursive: true })
  for (const [relative, content] of written) {
    const target = join(dest, ...relative.split('/'))
    if (!resolve(target).startsWith(resolve(dest) + sep)) continue
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, content)
  }
  return dest
}

/** 卸载（删除）一个 skill 目录。 */
export async function removeSkill(root: string, name: string): Promise<void> {
  if (!isSkillName(name)) throw new Error(`invalid skill name: ${name}`)
  const target = join(root, name)
  if (!existsSync(target)) throw new Error(`skill not found: ${name}`)
  await rm(target, { recursive: true, force: true })
}

/** 把 skill 从一个级别目录移动到另一个（目标已存在时只删源，恢复中断的移动）。 */
export async function moveSkill(fromRoot: string, toRoot: string, name: string): Promise<string> {
  if (!isSkillName(name)) throw new Error(`invalid skill name: ${name}`)
  const src = join(fromRoot, name)
  const dst = join(toRoot, name)
  if (!existsSync(src)) throw new Error(`source skill not found: ${name}`)
  if (!existsSync(dst)) {
    await mkdir(toRoot, { recursive: true })
    await cp(src, dst, { recursive: true })
  }
  await rm(src, { recursive: true, force: true })
  return dst
}
