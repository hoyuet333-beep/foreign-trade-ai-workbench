export type IntegrationStatus =
  | 'ready'
  | 'needs-user-oauth'
  | 'manual-confirm-only'
  | 'deployed-local'
  | 'not-configured'

export type IntegrationProvider = 'google' | 'microsoft' | 'github' | 'whatsapp' | 'chrome'

export interface IntegrationConnector {
  id: string
  name: string
  provider: IntegrationProvider
  status: IntegrationStatus
  authUrl: string | null
  scopes: string[]
  callbackUrl: string | null
  localPath?: string
}

export interface OAuthUrlOptions {
  baseUrl: string
  clientId: string
  redirectUri: string
  scopes: string[]
  state: string
}

export function buildOAuthUrl(options: OAuthUrlOptions) {
  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: options.scopes.join(' '),
    state: options.state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${options.baseUrl}?${params.toString()}`
}

export function summarizeDeploymentState(connectors: IntegrationConnector[]) {
  return {
    deployed: connectors
      .filter((connector) => connector.status === 'ready' || connector.status === 'deployed-local')
      .map((connector) => connector.id),
    waitingForUser: connectors
      .filter((connector) => connector.status === 'needs-user-oauth')
      .map((connector) => connector.id),
    manualOnly: connectors
      .filter((connector) => connector.status === 'manual-confirm-only')
      .map((connector) => connector.id),
    notConfigured: connectors
      .filter((connector) => connector.status === 'not-configured')
      .map((connector) => connector.id),
  }
}

export function buildAuthorizationChecklist(connectors: IntegrationConnector[]) {
  return connectors.map((connector) => {
    if (connector.id === 'chrome') {
      return {
        id: connector.id,
        name: connector.name,
        nextAction: '在 Chrome 扩展管理页加载 extension/chrome-lead-capture',
      }
    }

    if (connector.status === 'manual-confirm-only') {
      return {
        id: connector.id,
        name: connector.name,
        nextAction: `打开 ${connector.name}，扫码登录后由人工确认发送`,
      }
    }

    if (connector.status === 'needs-user-oauth') {
      return {
        id: connector.id,
        name: connector.name,
        nextAction: `打开授权链接并登录 ${connector.name}`,
      }
    }

    return {
      id: connector.id,
      name: connector.name,
      nextAction: '已可用',
    }
  })
}

export function connectorActionLabel(status: IntegrationStatus) {
  if (status === 'needs-user-oauth') return '打开授权'
  if (status === 'manual-confirm-only') return '打开确认页面'
  if (status === 'deployed-local' || status === 'ready') return '查看部署路径'
  return '查看配置'
}
