import { describe, expect, it } from 'vitest'
import {
  buildAuthorizationChecklist,
  buildOAuthUrl,
  connectorActionLabel,
  summarizeDeploymentState,
} from './auth'
import type { IntegrationConnector } from './auth'

const connectors: IntegrationConnector[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    provider: 'google',
    status: 'needs-user-oauth',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/gmail.modify'],
    callbackUrl: 'http://127.0.0.1:5173/oauth/google/callback',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    provider: 'whatsapp',
    status: 'manual-confirm-only',
    authUrl: 'https://web.whatsapp.com/',
    scopes: [],
    callbackUrl: null,
  },
  {
    id: 'chrome',
    name: 'Chrome 线索采集扩展',
    provider: 'chrome',
    status: 'deployed-local',
    authUrl: null,
    scopes: [],
    callbackUrl: null,
  },
]

describe('authorization deployment model', () => {
  it('builds oauth urls with encoded redirect and scope values', () => {
    const url = buildOAuthUrl({
      baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: 'client-123',
      redirectUri: 'http://127.0.0.1:5173/oauth/google/callback',
      scopes: ['email', 'https://www.googleapis.com/auth/gmail.modify'],
      state: 'gmail',
    })

    expect(url).toContain('client_id=client-123')
    expect(url).toContain('redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Foauth%2Fgoogle%2Fcallback')
    expect(url).toContain('scope=email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify')
    expect(url).toContain('state=gmail')
  })

  it('summarizes deployed, waiting, and manual-only connectors', () => {
    const summary = summarizeDeploymentState(connectors)

    expect(summary.deployed).toEqual(['chrome'])
    expect(summary.waitingForUser).toEqual(['gmail'])
    expect(summary.manualOnly).toEqual(['whatsapp'])
  })

  it('creates an operator checklist with exact next actions', () => {
    const checklist = buildAuthorizationChecklist(connectors)

    expect(checklist[0].nextAction).toBe('打开授权链接并登录 Gmail')
    expect(checklist[1].nextAction).toBe('打开 WhatsApp Web，扫码登录后由人工确认发送')
    expect(checklist[2].nextAction).toBe('在 Chrome 扩展管理页加载 extension/chrome-lead-capture')
  })

  it('labels connector actions based on safe deployment state', () => {
    expect(connectorActionLabel('needs-user-oauth')).toBe('打开授权')
    expect(connectorActionLabel('manual-confirm-only')).toBe('打开确认页面')
    expect(connectorActionLabel('deployed-local')).toBe('查看部署路径')
  })
})
