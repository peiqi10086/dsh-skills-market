/** core/local 测试：frontmatter 解析、findProjectRoot、zip 安装（含路径穿越防护）。 */
import { mkdtempSync, rmSync } from 'node:fs'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { zipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  findProjectRoot,
  installZip,
  isSkillName,
  moveSkill,
  parseSkillFrontmatter,
  removeSkill,
  scanSkillsDir,
} from '../src/core/local.ts'

let dir = ''

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'dsh-skills-market-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('isSkillName', () => {
  it('接受 kebab-case，拒绝穿越与大写', () => {
    expect(isSkillName('pdf-tools')).toBe(true)
    expect(isSkillName('a')).toBe(true)
    expect(isSkillName('../etc')).toBe(false)
    expect(isSkillName('Bad')).toBe(false)
    expect(isSkillName('')).toBe(false)
  })
})

describe('parseSkillFrontmatter', () => {
  it('读取 name 与 description', () => {
    const parsed = parseSkillFrontmatter('---\nname: demo\ndescription: 演示技能\n---\n\nbody\n')
    expect(parsed).toEqual({ name: 'demo', description: '演示技能' })
  })
  it('缺失字段返回空对象', () => {
    expect(parseSkillFrontmatter('no frontmatter')).toEqual({})
  })
})

describe('findProjectRoot', () => {
  it('向上找最近的 .git；找不到回退 cwd', () => {
    const nested = join(dir, 'a', 'b')
    mkdirSync(nested, { recursive: true })
    expect(findProjectRoot(nested)).toBe(nested)
    mkdirSync(join(dir, '.git'))
    expect(findProjectRoot(nested)).toBe(dir)
  })
})

describe('scanSkillsDir', () => {
  it('扫描含 SKILL.md 的子目录并解析描述', async () => {
    const root = join(dir, 'skills')
    mkdirSync(join(root, 'one'), { recursive: true })
    writeFileSync(join(root, 'one', 'SKILL.md'), '---\nname: one\ndescription: 第一个\n---\n')
    mkdirSync(join(root, 'not-a-skill'), { recursive: true })
    const rows = await scanSkillsDir(root, 'user')
    expect(rows).toEqual([{ level: 'user', dir: 'one', name: 'one', description: '第一个' }])
  })
  it('目录不存在时返回空表', async () => {
    expect(await scanSkillsDir(join(dir, 'missing'), 'user')).toEqual([])
  })
})

describe('installZip / removeSkill / moveSkill', () => {
  const zip = zipSync({
    'SKILL.md': new TextEncoder().encode('---\nname: demo\n---\n'),
    'scripts/run.sh': new TextEncoder().encode('#!/bin/sh\n'),
    '../evil.txt': new TextEncoder().encode('nope'),
  })

  it('安装落地文件并拒绝路径穿越条目', async () => {
    const root = join(dir, 'user-skills')
    const dest = await installZip(root, 'demo', zip)
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toContain('demo')
    expect(existsSync(join(dest, 'scripts', 'run.sh'))).toBe(true)
    expect(existsSync(join(dir, 'evil.txt'))).toBe(false)
  })

  it('目标已存在时报 already-exists', async () => {
    const root = join(dir, 'user-skills')
    await installZip(root, 'demo', zip)
    await expect(installZip(root, 'demo', zip)).rejects.toMatchObject({ name: 'SkillAlreadyExists' })
  })

  it('支持单层子目录包装的 zip', async () => {
    const wrapped = zipSync({ 'demo/SKILL.md': new TextEncoder().encode('---\nname: demo\n---\n') })
    const dest = await installZip(join(dir, 'ws'), 'demo', wrapped)
    expect(existsSync(join(dest, 'SKILL.md'))).toBe(true)
  })

  it('moveSkill 跨目录移动，removeSkill 删除', async () => {
    const user = join(dir, 'user')
    const project = join(dir, 'project')
    await installZip(user, 'demo', zip)
    await moveSkill(user, project, 'demo')
    expect(existsSync(join(user, 'demo'))).toBe(false)
    expect(existsSync(join(project, 'demo', 'SKILL.md'))).toBe(true)
    await removeSkill(project, 'demo')
    expect(existsSync(join(project, 'demo'))).toBe(false)
    await expect(removeSkill(project, 'demo')).rejects.toThrow('skill not found')
  })
})
