import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  PlugZap,
  Send,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import './App.css'
import { integrationConnectors } from './data/integrations'
import { connectors, customers, products, today } from './data/seed'
import { buildAuthorizationChecklist, connectorActionLabel, summarizeDeploymentState } from './domain/auth'
import { buildProductIntroduction } from './domain/copy'
import { buildDailyWorkflow, getConnectorReadiness } from './domain/workflow'
import type { Channel } from './domain/types'

function App() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('email')
  const workflow = useMemo(
    () =>
      buildDailyWorkflow({
        customers,
        products,
        businessLineId: 'factory-a',
        today,
        model: 'local-template',
      }),
    [],
  )
  const introduction = useMemo(() => buildProductIntroduction(), [])
  const connectorReadiness = useMemo(() => getConnectorReadiness(connectors), [])
  const integrationSummary = useMemo(() => summarizeDeploymentState(integrationConnectors), [])
  const authorizationChecklist = useMemo(() => buildAuthorizationChecklist(integrationConnectors), [])
  const selectedDraft = workflow.drafts.find((draft) => draft.channel === selectedChannel) ?? workflow.drafts[0]
  const topCustomer = workflow.recommendations[0]

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="模块导航">
        <div className="brand-block">
          <div className="brand-mark">
            <Bot size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">AI Workbench</p>
            <strong>外贸增长团队空间</strong>
          </div>
        </div>

        <nav className="nav-list">
          <a href="#overview">
            <Database size={18} aria-hidden="true" />
            总览
          </a>
          <a href="#customers">
            <UsersRound size={18} aria-hidden="true" />
            客户开发
          </a>
          <a href="#drafts">
            <MessageSquareText size={18} aria-hidden="true" />
            AI 草稿
          </a>
          <a href="#connectors">
            <LockKeyhole size={18} aria-hidden="true" />
            连接器
          </a>
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>WhatsApp 和邮箱发送均保留人工确认，避免自动垃圾消息。</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar" id="overview">
          <div>
            <p className="eyebrow">2026-06-20 / 箱包出口业务线</p>
            <h1>外贸 AI 自动闭环工作台</h1>
            <p className="lead">
              从客户推荐、产品上下文、邮件与 WhatsApp 草稿，到跟进任务和团队数据沉淀，默认流程已经串起来。
            </p>
          </div>
          <button type="button" className="primary-action">
            <Send size={18} aria-hidden="true" />
            生成今日闭环
          </button>
        </header>

        <section className="metric-grid" aria-label="今日工作状态">
          <Metric icon={<UsersRound size={18} />} label="今日推荐客户" value={workflow.recommendations.length.toString()} />
          <Metric icon={<MessageSquareText size={18} />} label="AI 草稿" value={workflow.drafts.length.toString()} />
          <Metric icon={<Clock3 size={18} />} label="跟进任务" value={workflow.tasks.length.toString()} />
          <Metric icon={<CheckCircle2 size={18} />} label="可用连接器" value={connectorReadiness.ready.length.toString()} />
        </section>

        <section className="main-grid">
          <article className="panel recommendation-panel" id="customers">
            <PanelHeader icon={<Building2 size={19} />} title="今日推荐客户" detail="按客户价值、跟进节奏和业务线隔离排序" />
            {workflow.recommendations.map((customer) => (
              <div className="customer-row" key={customer.id}>
                <div>
                  <strong>{customer.company}</strong>
                  <p>{customer.contactName} / {customer.country} / {customer.industry}</p>
                  <p className="muted">{customer.reason}</p>
                </div>
                <span>{customer.stage}</span>
              </div>
            ))}
          </article>

          <article className="panel draft-panel" id="drafts">
            <PanelHeader icon={<MessageSquareText size={19} />} title="AI 草稿" detail="从客户档案和产品库自动带入上下文" />
            <div className="segmented" role="group" aria-label="选择草稿渠道">
              {workflow.drafts.map((draft) => (
                <button
                  type="button"
                  key={draft.channel}
                  className={selectedChannel === draft.channel ? 'active' : ''}
                  onClick={() => setSelectedChannel(draft.channel)}
                >
                  {channelLabel(draft.channel)}
                </button>
              ))}
            </div>
            <div className="draft-card">
              <h2>{selectedDraft.title}</h2>
              <pre>{selectedDraft.body}</pre>
            </div>
          </article>
        </section>

        <section className="secondary-grid">
          <article className="panel">
            <PanelHeader icon={<Clock3 size={19} />} title="跟进任务" detail="草稿生成后自动进入待办" />
            {workflow.tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <p>负责人：{task.owner} / 截止：{task.dueAt}</p>
                </div>
                <span>{task.status === 'open' ? '待处理' : '已完成'}</span>
              </div>
            ))}
          </article>

          <article className="panel">
            <PanelHeader icon={<Database size={19} />} title="沉淀记录" detail="推荐、草稿和任务都写入团队空间" />
            <ol className="event-list">
              {workflow.events.map((event) => (
                <li key={event.id}>
                  <span>{event.type}</span>
                  <p>{event.summary}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="panel connectors-panel" id="connectors">
            <PanelHeader icon={<LockKeyhole size={19} />} title="连接器状态" detail="除授权外尽量自动执行" />
            {connectors.map((connector) => (
              <div className="connector-row" key={connector.id}>
                <div>
                  <strong>{connector.name}</strong>
                  <p>{connector.description}</p>
                </div>
                <StatusBadge status={connector.status} />
              </div>
            ))}
          </article>
        </section>

        <section className="auth-section" id="authorization">
          <div className="copy-heading">
            <div>
              <p className="eyebrow">Authorization Center</p>
              <h2>授权与部署中心</h2>
              <p>
                GitHub CLI 已完成授权；邮箱和 WhatsApp 仍需要账号本人确认，Chrome 扩展已生成本地加载路径。
              </p>
            </div>
            <PlugZap size={28} aria-hidden="true" />
          </div>
          <div className="auth-summary">
            <Metric icon={<CheckCircle2 size={18} />} label="已部署/可用" value={integrationSummary.deployed.length.toString()} />
            <Metric icon={<LockKeyhole size={18} />} label="待本人授权" value={integrationSummary.waitingForUser.length.toString()} />
            <Metric icon={<ShieldCheck size={18} />} label="人工确认发送" value={integrationSummary.manualOnly.length.toString()} />
          </div>
          <div className="auth-grid">
            {integrationConnectors.map((connector) => {
              const checklist = authorizationChecklist.find((item) => item.id === connector.id)
              return (
                <article className="auth-card" key={connector.id}>
                  <div>
                    <h3>{connector.name}</h3>
                    <p>{checklist?.nextAction}</p>
                    {connector.callbackUrl ? <code>{connector.callbackUrl}</code> : null}
                    {connector.localPath ? <code>{connector.localPath}</code> : null}
                  </div>
                  {connector.authUrl ? (
                    <a className="auth-link" href={connector.authUrl} target="_blank" rel="noreferrer">
                      {connectorActionLabel(connector.status)}
                    </a>
                  ) : (
                    <span className="status-badge ready">已就绪</span>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <section className="copy-section">
          <div className="copy-heading">
            <div>
              <p className="eyebrow">官网 / 产品手册 / 销售材料</p>
              <h2>{introduction.headline}</h2>
              <p>{introduction.subheadline}</p>
            </div>
            <Globe2 size={28} aria-hidden="true" />
          </div>
          <div className="copy-grid">
            {introduction.sections.map((section) => (
              <article className="copy-block" key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <footer className="footer-strip">
          <span>{topCustomer.company}</span>
          <ArrowRight size={16} aria-hidden="true" />
          <span>{selectedDraft.title}</span>
          <ArrowRight size={16} aria-hidden="true" />
          <span>跟进任务已创建</span>
        </footer>
      </section>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric-card">
      <span aria-hidden="true">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function PanelHeader({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="panel-header">
      <span aria-hidden="true">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === 'ready'
      ? '已可用'
      : status === 'needs-auth'
        ? '需授权'
        : status === 'manual-confirm'
          ? '人工确认'
          : '待配置'

  return <span className={`status-badge ${status}`}>{label}</span>
}

function channelLabel(channel: Channel) {
  const labels: Record<Channel, string> = {
    email: '邮件',
    whatsapp: 'WhatsApp',
    content: '内容',
    website: '网站',
  }
  return labels[channel]
}

export default App
