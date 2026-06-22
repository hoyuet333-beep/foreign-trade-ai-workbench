const statusEl = document.querySelector('#status')
const companyEl = document.querySelector('#company')
const contactEl = document.querySelector('#contact')
const notesEl = document.querySelector('#notes')
const captureEl = document.querySelector('#capture')

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function hydrateFromTab() {
  const tab = await getActiveTab()
  companyEl.value = tab.title || ''
  notesEl.value = tab.url ? `来源页面：${tab.url}` : ''
}

captureEl.addEventListener('click', async () => {
  const tab = await getActiveTab()
  const lead = {
    company: companyEl.value.trim(),
    contact: contactEl.value.trim(),
    notes: notesEl.value.trim(),
    sourceUrl: tab.url,
    capturedAt: new Date().toISOString(),
  }

  await chrome.storage.local.set({ lastCapturedLead: lead })
  statusEl.textContent = '已保存到扩展本地存储。打开工作台后可导入这条线索。'
})

hydrateFromTab().catch(() => {
  statusEl.textContent = '当前页面信息读取失败，请手动填写。'
})
