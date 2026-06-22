# 外贸 AI 自动闭环工作台

这是根据桌面文件 `C:/Users/Administrator/Desktop/新建 文本文档 (3).txt` 落地的本地可运行工作台。

## 已部署闭环

- 客户/线索推荐：按业务线、跟进日期和客户价值推荐今日客户。
- 产品上下文：从产品库带入规格、卖点、应用场景和 FAQ。
- AI 草稿：生成邮件、WhatsApp、内容营销和网站文案草稿。
- 跟进任务：草稿生成后自动创建下一步销售待办。
- 团队沉淀：推荐、草稿和任务写入事件流。
- 产品介绍文案：内置一版适合官网/产品手册/销售材料的中文 B2B SaaS 文案。

## 需要人工授权的部分

- Gmail / Outlook：需要官方 OAuth 登录后才能读取收件箱、归档回复和追踪发信。
- WhatsApp Web：只生成草稿，最终发送必须人工确认。
- GitHub 网站托管：需要授权仓库后才能一键创建、提交和部署网站。
- Chrome 扩展：需要后续打包安装扩展后才能采集网页线索。

## 使用

```powershell
npm install
npm run dev
```

打开终端显示的本地地址即可使用。

## 验证

```powershell
npm test
npm run lint
npm run build
```

## 部署

- GitHub CLI 已授权后，可推送到 GitHub 仓库并由 `.github/workflows/deploy-pages.yml` 自动部署到 GitHub Pages。
- Chrome 扩展目录在 `extension/chrome-lead-capture`，可通过 `chrome://extensions/` 加载。
- Gmail、Outlook、WhatsApp 的人工授权说明见 `docs/authorization.md`。
