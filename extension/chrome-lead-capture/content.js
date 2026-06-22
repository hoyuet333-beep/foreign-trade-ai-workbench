chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'COLLECT_PAGE_CONTEXT') return

  sendResponse({
    title: document.title,
    url: location.href,
    selectedText: window.getSelection()?.toString() || '',
    description:
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  })
})
