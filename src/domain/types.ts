export type Channel = 'email' | 'whatsapp' | 'content' | 'website'

export type ConnectorStatus = 'ready' | 'needs-auth' | 'manual-confirm' | 'not-configured'

export type ConnectorKind = 'email' | 'messaging' | 'ai' | 'website' | 'browser'

export interface Customer {
  id: string
  businessLineId: string
  company: string
  contactName: string
  country: string
  language: string
  industry: string
  stage: string
  valueScore: number
  source: string
  tags: string[]
  lastContactAt: string
  nextFollowUpAt: string
  notes: string[]
}

export interface Product {
  id: string
  businessLineId: string
  name: string
  category: string
  specs: string[]
  sellingPoints: string[]
  applications: string[]
  faq: string[]
}

export interface Connector {
  id: string
  name: string
  kind: ConnectorKind
  status: ConnectorStatus
  description?: string
}

export interface Recommendation extends Customer {
  reason: string
  priorityScore: number
}

export interface Draft {
  id: string
  channel: Channel
  title: string
  body: string
  metadata: {
    customerId: string
    productId: string
    model: string
    requiresManualSend: boolean
  }
}

export interface FollowUpTask {
  id: string
  customerId: string
  owner: string
  title: string
  dueAt: string
  status: 'open' | 'done'
  sourceChannel: Channel
}

export interface WorkflowEvent {
  id: string
  type: 'recommendation' | 'draft_created' | 'task_created'
  customerId: string
  summary: string
  createdAt: string
}

export interface DailyWorkflow {
  recommendations: Recommendation[]
  drafts: Draft[]
  tasks: FollowUpTask[]
  events: WorkflowEvent[]
}
