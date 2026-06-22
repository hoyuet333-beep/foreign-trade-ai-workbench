import type {
  Channel,
  Connector,
  Customer,
  DailyWorkflow,
  Draft,
  FollowUpTask,
  Product,
  Recommendation,
  WorkflowEvent,
} from './types'

interface RecommendationOptions {
  businessLineId: string
  today: string
  limit?: number
}

interface DraftOptions {
  channel: Channel
  customer: Customer
  product: Product
  goal: 'cold-outreach' | 'reply-inquiry' | 'follow-up' | 'website-copy' | 'social-post'
  model: string
}

interface FollowUpOptions {
  customer: Customer
  draftChannel: Channel
  today: string
  owner: string
}

interface DailyWorkflowOptions {
  customers: Customer[]
  products: Product[]
  businessLineId: string
  today: string
  model: string
}

const channelNames: Record<Channel, string> = {
  email: '邮件',
  whatsapp: 'WhatsApp',
  content: '内容营销',
  website: '网站',
}

const dateMs = (value: string) => new Date(`${value}T00:00:00`).getTime()

const addDays = (value: string, days: number) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function recommendCustomers(
  customers: Customer[],
  options: RecommendationOptions,
): Recommendation[] {
  const todayMs = dateMs(options.today)

  return customers
    .filter((customer) => customer.businessLineId === options.businessLineId)
    .map((customer) => {
      const overdueDays = Math.max(0, Math.floor((todayMs - dateMs(customer.nextFollowUpAt)) / 86_400_000))
      const recencyPenalty = Math.max(0, Math.floor((todayMs - dateMs(customer.lastContactAt)) / 86_400_000))
      const priorityScore = customer.valueScore + overdueDays * 12 + Math.min(recencyPenalty, 20)
      const reasons = [
        overdueDays > 0 ? `已到跟进日期 ${overdueDays} 天` : '未到跟进日期',
        customer.valueScore >= 80 ? '高价值客户' : '常规价值客户',
        `${customer.stage} 阶段`,
      ]

      return {
        ...customer,
        priorityScore,
        reason: reasons.join('；'),
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, options.limit ?? 5)
}

export function generateDraft(options: DraftOptions): Draft {
  const { channel, customer, product, model } = options
  const channelName = channelNames[channel]
  const sharedContext = [
    `客户：${customer.company}（${customer.country}，${customer.industry}）`,
    `联系人：${customer.contactName}`,
    `产品：${product.name}`,
    `规格：${product.specs.join('、')}`,
    `卖点：${product.sellingPoints.join('、')}`,
    `应用场景：${product.applications.join('、')}`,
  ]

  const bodyByChannel: Record<Channel, string> = {
    email: [
      `${customer.contactName} 您好，`,
      `我们根据 ${customer.company} 的业务背景，整理了 ${product.name} 的资料，重点包括 ${product.sellingPoints.join('、')}。`,
      `如果您正在评估 ${product.applications.join(' 或 ')}，我们可以先围绕规格、样品和批量合作方式整理一版英文资料，便于您内部判断。`,
      `这封邮件由 AI 基于客户档案和产品库生成，发送前建议销售人员补充价格、交期等需确认信息。`,
    ].join('\n\n'),
    whatsapp: [
      `Hi ${customer.contactName}, this is a draft for ${customer.company}.`,
      `We prepared information about ${product.name}: ${product.sellingPoints.join(', ')}.`,
      `I can share specs and sample details if this fits your ${customer.industry} program.`,
      `WhatsApp 内容仅作为草稿填入输入框，必须由人工确认后发送。`,
    ].join('\n'),
    content: [
      `主题：${product.name} 在 ${customer.industry} 场景中的应用`,
      `面向 ${customer.country} 市场，可从 ${product.specs.join('、')} 和 ${product.sellingPoints.join('、')} 展开内容。`,
      `建议用于 LinkedIn、Facebook 或 X 的专业短帖，避免承诺未确认效果。`,
    ].join('\n\n'),
    website: [
      `网站段落标题：${product.name}`,
      `适用于 ${product.applications.join('、')} 的外贸产品资料，可展示规格、卖点和常见问题。`,
      `页面内容应引用产品库资料，并通过默认邮箱账号承接询盘。`,
    ].join('\n\n'),
  }

  return {
    id: `draft-${channel}-${customer.id}-${product.id}`,
    channel,
    title: `${channelName}草稿：${customer.company} / ${product.name}`,
    body: `${sharedContext.join('\n')}\n\n${bodyByChannel[channel]}`,
    metadata: {
      customerId: customer.id,
      productId: product.id,
      model,
      requiresManualSend: channel === 'whatsapp' || channel === 'email',
    },
  }
}

export function createFollowUpTask(options: FollowUpOptions): FollowUpTask {
  return {
    id: `task-${options.customer.id}-${options.draftChannel}-${options.today}`,
    customerId: options.customer.id,
    owner: options.owner,
    title: `跟进 ${options.customer.company} 的${channelNames[options.draftChannel]}草稿`,
    dueAt: addDays(options.today, 1),
    status: 'open',
    sourceChannel: options.draftChannel,
  }
}

export function buildDailyWorkflow(options: DailyWorkflowOptions): DailyWorkflow {
  const recommendations = recommendCustomers(options.customers, {
    businessLineId: options.businessLineId,
    today: options.today,
    limit: 3,
  })
  const customer = recommendations[0]
  const product = options.products.find((item) => item.businessLineId === options.businessLineId)

  if (!customer || !product) {
    return { recommendations, drafts: [], tasks: [], events: [] }
  }

  const drafts = (['email', 'whatsapp', 'content', 'website'] as Channel[]).map((channel) =>
    generateDraft({
      channel,
      customer,
      product,
      goal: channel === 'website' ? 'website-copy' : 'reply-inquiry',
      model: options.model,
    }),
  )

  const tasks = [
    createFollowUpTask({
      customer,
      draftChannel: 'email',
      today: options.today,
      owner: '销售团队',
    }),
  ]

  const events: WorkflowEvent[] = [
    {
      id: `event-recommendation-${customer.id}`,
      type: 'recommendation',
      customerId: customer.id,
      summary: `推荐联系 ${customer.company}`,
      createdAt: options.today,
    },
    {
      id: `event-draft-${customer.id}`,
      type: 'draft_created',
      customerId: customer.id,
      summary: `已生成 ${drafts.length} 个跨渠道草稿`,
      createdAt: options.today,
    },
    {
      id: `event-task-${customer.id}`,
      type: 'task_created',
      customerId: customer.id,
      summary: `已创建跟进任务：${tasks[0].title}`,
      createdAt: options.today,
    },
  ]

  return { recommendations, drafts, tasks, events }
}

export function getConnectorReadiness(connectors: Connector[]) {
  return {
    ready: connectors.filter((connector) => connector.status === 'ready'),
    needsHuman: connectors.filter((connector) => connector.status === 'needs-auth'),
    manualConfirm: connectors.filter((connector) => connector.status === 'manual-confirm'),
    notConfigured: connectors.filter((connector) => connector.status === 'not-configured'),
  }
}
