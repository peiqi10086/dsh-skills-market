/** core/skillhub 纯函数测试：URL 组装、响应映射、错误分类。 */
import { describe, expect, it } from 'vitest'
import {
  SkillHubHttpError,
  mapSkillHubItem,
  searchSkills,
  type FetchLike,
  type FetchLikeResponse,
} from '../src/core/skillhub.ts'

function fakeResponse(body: unknown, status = 200): FetchLikeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  }
}

const sample = {
  code: 0,
  data: {
    total: 42,
    skills: [
      {
        name: 'PDF和图片文字提取',
        slug: 'pdf-image-text-extractor',
        namespace: { handle: 'user_5f9c21aa' },
        description_zh: '从图片或 PDF 提取文字',
        category: 'office-efficiency',
        downloads: 81655,
        installs: 378,
        stars: 148,
        iconUrl: 'https://example.com/icon.png',
      },
    ],
  },
}

describe('mapSkillHubItem', () => {
  it('提取叶字段并兜底缺失值', () => {
    const item = mapSkillHubItem(sample.data.skills[0])
    expect(item).toEqual({
      name: 'PDF和图片文字提取',
      slug: 'pdf-image-text-extractor',
      namespace: 'user_5f9c21aa',
      description: '从图片或 PDF 提取文字',
      category: 'office-efficiency',
      downloads: 81655,
      installs: 378,
      stars: 148,
      iconUrl: 'https://example.com/icon.png',
    })
  })

  it('畸形输入不抛错', () => {
    const item = mapSkillHubItem(null)
    expect(item.slug).toBe('')
    expect(item.downloads).toBe(0)
  })
})

describe('searchSkills', () => {
  it('组装查询串并映射分页结果', async () => {
    let seenUrl = ''
    const fetchImpl: FetchLike = (url) => {
      seenUrl = url
      return Promise.resolve(fakeResponse(sample))
    }
    const page = await searchSkills(fetchImpl, { keyword: 'PDF 提取', category: 'office-efficiency', page: 2, pageSize: 10 })
    expect(seenUrl).toContain('keyword=PDF%20%E6%8F%90%E5%8F%96')
    expect(seenUrl).toContain('category=office-efficiency')
    expect(seenUrl).toContain('page=2')
    expect(seenUrl).toContain('pageSize=10')
    expect(seenUrl).toContain('sortBy=score')
    expect(page.total).toBe(42)
    expect(page.items).toHaveLength(1)
    expect(page.items[0]?.slug).toBe('pdf-image-text-extractor')
  })

  it('非 2xx 抛 SkillHubHttpError', async () => {
    const fetchImpl: FetchLike = () => Promise.resolve(fakeResponse({}, 500))
    await expect(searchSkills(fetchImpl, {})).rejects.toBeInstanceOf(SkillHubHttpError)
  })
})
