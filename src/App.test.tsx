import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the automated closed-loop workbench with module outputs', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '外贸 AI 自动闭环工作台' })).toBeInTheDocument()
    expect(screen.getAllByText('今日推荐客户').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AI 草稿').length).toBeGreaterThan(0)
    expect(screen.getAllByText('跟进任务').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: '连接器状态' })).toBeInTheDocument()
    expect(screen.getByText('面向外贸团队的 AI 工作台')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '授权与部署中心' })).toBeInTheDocument()
    expect(screen.getAllByText('GitHub 网站托管').length).toBeGreaterThan(0)
  })

  it('switches draft channels without losing the generated workflow', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

    expect(screen.getByRole('heading', { name: /WhatsApp草稿/ })).toBeInTheDocument()
    expect(screen.getByText(/人工确认后发送/)).toBeInTheDocument()
    expect(screen.getAllByText('Northstar Retail').length).toBeGreaterThan(0)
  })
})
