# QuickAdd Templates

这些模板用于 Obsidian QuickAdd 的 Capture。

## 推荐 Capture 配置

### 日常沟通速记

- File Name Format: `inbox/quick/{{DATE:YYYY-MM-DD-HHmm}}-{{VALUE:title}}`
- Template Path: `templates/quickadd/日常沟通速记.md`

### 会议纪要

- File Name Format: `inbox/meetings/{{DATE:YYYY-MM-DD}}-{{VALUE:title}}`
- Template Path: `templates/quickadd/会议纪要.md`

### 结论候选

- File Name Format: `inbox/conclusions/{{DATE:YYYY-MM-DD-HHmm}}-{{VALUE:title}}`
- Template Path: `templates/quickadd/结论候选.md`

## 聊天记录入库 Macro

统一入口：`Inbox - 聊天记录入库`

使用方式：

1. 在微信、钉钉或其他聊天工具中复制聊天文本；如果不能复制多条消息，就截图并让截图留在剪贴板。
2. 在 Obsidian 命令面板执行 QuickAdd 命令 `Inbox - 聊天记录入库`。
3. 脚本会把内容写入 `inbox/quick/`，并生成 `Capture Time`、`Conversation Time`、`People`、`简短结论` 和原始记录。
4. 如果剪贴板是截图，图片会保存到 `inbox/assets/chat/YYYY-MM/`；脚本会优先用 AI 视觉模型识别聊天内容，失败时才回退到 OCR。

可选增强：

- OCR 兜底：`brew install tesseract tesseract-lang`
- AI 总结/截图识别：推荐复制 `secrets/chat-capture.local.example.json` 为 `secrets/chat-capture.local.json`，在本地文件里配置 `baseUrl`、`apiKey`、`model`。如截图识别需要单独模型，可配置 `visionModel`。`secrets/*.local.json` 已被 git 忽略。
- 环境变量兜底：也可以用 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`。不要把 API Key 写入仓库文件。

## 原则

QuickAdd 只负责低摩擦捕获，不直接写入 `wiki/`。整理时由 Codex 判断领域、归档 raw、沉淀 wiki、更新索引和交叉链接。
