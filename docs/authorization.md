# 授权与部署说明

## GitHub

GitHub CLI 已完成授权，当前可用账号由 `gh auth status` 显示。

部署路径：

1. 本地提交代码。
2. 推送到 GitHub 仓库 `foreign-trade-ai-workbench`。
3. GitHub Actions 自动运行 `.github/workflows/deploy-pages.yml`。
4. Pages 产物来自 `dist/`。

## Gmail

需要在 Google Cloud 创建 OAuth Client。

回调地址：

```text
http://127.0.0.1:5173/oauth/google/callback
```

建议权限：

```text
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.send
```

## Outlook / Exchange

需要在 Microsoft Entra ID 创建 OAuth 应用。

回调地址：

```text
http://127.0.0.1:5173/oauth/microsoft/callback
```

建议权限：

```text
Mail.ReadWrite
Mail.Send
offline_access
```

## WhatsApp

当前只打开官方 WhatsApp Web，并生成回复草稿。最终发送必须由人工确认。

地址：

```text
https://web.whatsapp.com/
```

## Chrome 扩展

扩展目录：

```text
extension/chrome-lead-capture
```

安装方式：

1. 打开 `chrome://extensions/`。
2. 开启开发者模式。
3. 点击“加载已解压的扩展程序”。
4. 选择 `E:\销售回复于一体\extension\chrome-lead-capture`。
