export interface CopySection {
  title: string
  paragraphs: string[]
}

export interface ProductIntroduction {
  headline: string
  subheadline: string
  sections: CopySection[]
  fullText: string
}

export function buildProductIntroduction(): ProductIntroduction {
  const headline = '面向外贸团队的 AI 工作台'
  const subheadline =
    '把 AI 接入客户开发、邮件、内容营销、独立站和 WhatsApp 沟通，让客户、经验与内容沉淀在团队空间。'

  const sections: CopySection[] = [
    {
      title: '核心卖点',
      paragraphs: [
        'AI 贯穿客户开发、邮件、内容营销、独立站和私域沟通，帮助团队在同一工作台内完成线索识别、客户跟进、内容生成和询盘回复。',
        '桌面端、浏览器扩展和云端协同配合，业务数据沉淀在团队空间，减少因人员流动造成的客户资料、沟通记录和内容资产流失。',
        '多品牌、多团队、多业务线可隔离管理，客户、产品、订单、内容和聊天记录按业务线组织，降低跨团队协作时的信息干扰。',
      ],
    },
    {
      title: '适用对象',
      paragraphs: [
        '适用于外贸老板、销售主管、业务员、市场团队，以及正在建设跨境 B2B 增长体系的企业决策者。',
        '尤其适合需要批量开发客户、维护多市场沟通、沉淀英文产品资料，并希望让 AI 参与日常跟进和内容生产的外贸团队。',
      ],
    },
    {
      title: '功能模块',
      paragraphs: [
        'AI 工作台提供邮件助手、内容助手、网站助手和 WhatsApp 助手等入口，支持按不同业务场景切换合适的大模型。',
        '业务中心集中管理客户、线索、产品、订单、合作伙伴和供应商，客户分类可按行业、区域、阶段和价值等维度自定义。',
        '邮件模块支持多账户聚合、统一收件箱、富文本撰写、定时发送、自动分类、批量个性化开发信、询盘智能回复和多语言转换。',
        '营销推广模块沉淀品牌档案、客户画像、关键词规划、品牌知识库和素材库，可生成英文产品介绍、SEO 文章、社媒贴、广告文案和落地页文案。',
        '网站模块面向外贸工厂提供轻量建站、本地预览、AI 改文案、可视化版本管理和 GitHub 托管连接能力。',
        'WhatsApp 模块强调合规辅助，AI 生成内容仅作为草稿，由人工最终确认发送，并可结合客户档案与历史邮件补足上下文。',
      ],
    },
    {
      title: '典型场景',
      paragraphs: [
        '销售人员导入客户名单和产品资料后，AI 可辅助生成个性化开发信，并根据客户回复或未回复创建后续跟进任务。',
        '收到询盘后，团队可结合客户档案、产品库和历史沟通生成专业回盘草稿，再由业务员确认价格、交期等关键内容后发送。',
        '市场团队可围绕产品资料和客户画像生成官网文案、SEO 内容和社媒帖子，让内容生产与客户开发资料保持一致。',
      ],
    },
    {
      title: '差异化价值',
      paragraphs: [
        '这套工作台的重点不是单点 AI 写作，而是把客户、产品、邮件、网站、内容和私域沟通放进同一业务闭环。',
        '团队可以把产品资料交给智能体，让 AI 更准确理解规格、卖点和应用场景；同时让客户档案、跟进记录和内容资产持续沉淀。',
        '审批流、业务线隔离和人工确认发送机制有助于在提升效率的同时保留必要的合规辅助与过程记录。',
      ],
    },
    {
      title: '行动号召',
      paragraphs: [
        '从一个业务线、一个产品库和一组重点客户开始，把重复的客户开发、询盘回复和内容更新交给 AI 辅助完成，让团队逐步形成可沉淀、可复用的外贸增长流程。',
      ],
    },
  ]

  const fullText = [
    `# ${headline}`,
    subheadline,
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      ...section.paragraphs,
    ]),
  ].join('\n\n')

  return { headline, subheadline, sections, fullText }
}
