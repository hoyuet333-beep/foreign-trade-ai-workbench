import { describe, expect, it } from 'vitest'
import {
  buildDailyWorkflow,
  createFollowUpTask,
  generateDraft,
  getConnectorReadiness,
  recommendCustomers,
} from './workflow'
import type { Connector, Customer, Product } from './types'

const today = '2026-06-20'

const customers: Customer[] = [
  {
    id: 'c-1',
    businessLineId: 'factory-a',
    company: 'Northstar Retail',
    contactName: 'Emma Wilson',
    country: 'United States',
    language: 'English',
    industry: 'Outdoor retail',
    stage: 'Inquiry',
    valueScore: 86,
    source: 'LinkedIn',
    tags: ['high-value', 'sample-needed'],
    lastContactAt: '2026-06-01',
    nextFollowUpAt: '2026-06-18',
    notes: ['Asked for waterproof fabric options.'],
  },
  {
    id: 'c-2',
    businessLineId: 'factory-a',
    company: 'Berlin Import GmbH',
    contactName: 'Lena Meyer',
    country: 'Germany',
    language: 'German',
    industry: 'Distributor',
    stage: 'Cold Lead',
    valueScore: 62,
    source: 'Yellow Pages',
    tags: ['new-lead'],
    lastContactAt: '2026-06-19',
    nextFollowUpAt: '2026-06-26',
    notes: ['No reply yet.'],
  },
  {
    id: 'c-3',
    businessLineId: 'factory-b',
    company: 'Pacific Sourcing',
    contactName: 'Mia Chen',
    country: 'Singapore',
    language: 'English',
    industry: 'Sourcing agency',
    stage: 'Negotiation',
    valueScore: 91,
    source: 'Referral',
    tags: ['partner'],
    lastContactAt: '2026-06-10',
    nextFollowUpAt: '2026-06-17',
    notes: ['Separate business line.'],
  },
]

const product: Product = {
  id: 'p-1',
  businessLineId: 'factory-a',
  name: 'Waterproof Travel Backpack',
  category: 'Bags',
  specs: ['600D polyester', '18L capacity', 'custom logo support'],
  sellingPoints: ['water-resistant surface', 'factory-direct sampling', 'bulk order support'],
  applications: ['retail programs', 'corporate gifts'],
  faq: ['MOQ and lead time can be confirmed after style selection.'],
}

describe('workflow domain', () => {
  it('recommends overdue high-value customers inside the selected business line first', () => {
    const result = recommendCustomers(customers, {
      businessLineId: 'factory-a',
      today,
      limit: 2,
    })

    expect(result.map((customer) => customer.id)).toEqual(['c-1', 'c-2'])
    expect(result[0].reason).toContain('已到跟进日期')
    expect(result[0].reason).toContain('高价值')
  })

  it('generates channel-specific AI drafts from customer and product context', () => {
    const draft = generateDraft({
      channel: 'whatsapp',
      customer: customers[0],
      product,
      goal: 'reply-inquiry',
      model: 'local-template',
    })

    expect(draft.title).toContain('WhatsApp')
    expect(draft.body).toContain('Northstar Retail')
    expect(draft.body).toContain('Waterproof Travel Backpack')
    expect(draft.body).toContain('人工确认后发送')
    expect(draft.metadata.requiresManualSend).toBe(true)
  })

  it('creates follow-up tasks with traceable business context', () => {
    const task = createFollowUpTask({
      customer: customers[0],
      draftChannel: 'email',
      today,
      owner: '销售团队',
    })

    expect(task.customerId).toBe('c-1')
    expect(task.title).toContain('Northstar Retail')
    expect(task.dueAt).toBe('2026-06-21')
    expect(task.status).toBe('open')
  })

  it('builds a daily closed loop from recommendation to draft and follow-up event', () => {
    const workflow = buildDailyWorkflow({
      customers,
      products: [product],
      businessLineId: 'factory-a',
      today,
      model: 'local-template',
    })

    expect(workflow.recommendations[0].id).toBe('c-1')
    expect(workflow.drafts).toHaveLength(4)
    expect(workflow.tasks[0].customerId).toBe('c-1')
    expect(workflow.events.map((event) => event.type)).toEqual([
      'recommendation',
      'draft_created',
      'task_created',
    ])
  })

  it('separates ready connectors from connectors that need human authorization', () => {
    const connectors: Connector[] = [
      { id: 'gmail', name: 'Gmail', kind: 'email', status: 'needs-auth' },
      { id: 'openai', name: 'OpenAI', kind: 'ai', status: 'ready' },
      { id: 'whatsapp', name: 'WhatsApp Web', kind: 'messaging', status: 'manual-confirm' },
    ]

    const readiness = getConnectorReadiness(connectors)

    expect(readiness.ready.map((connector) => connector.id)).toEqual(['openai'])
    expect(readiness.needsHuman.map((connector) => connector.id)).toEqual(['gmail'])
    expect(readiness.manualConfirm.map((connector) => connector.id)).toEqual(['whatsapp'])
  })
})
