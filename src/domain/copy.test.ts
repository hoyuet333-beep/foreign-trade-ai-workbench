import { describe, expect, it } from 'vitest'
import { buildProductIntroduction } from './copy'

describe('product introduction copy', () => {
  it('builds a conservative B2B SaaS product introduction from provided modules', () => {
    const copy = buildProductIntroduction()

    expect(copy.headline).toContain('外贸团队')
    expect(copy.sections.map((section) => section.title)).toEqual([
      '核心卖点',
      '适用对象',
      '功能模块',
      '典型场景',
      '差异化价值',
      '行动号召',
    ])
    expect(copy.fullText).toContain('AI 贯穿客户开发、邮件、内容营销、独立站和私域沟通')
    expect(copy.fullText).toContain('团队空间')
    expect(copy.fullText).not.toContain('融资')
    expect(copy.fullText).not.toContain('客户数量')
  })
})
