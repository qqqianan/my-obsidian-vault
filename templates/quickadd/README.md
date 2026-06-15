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

### 多张截图

剪贴板一次只能保存一张图片。多张聊天截图使用两个命令：

1. 每截一张图后执行 `Inbox - 聊天截图暂存`，脚本会把当前剪贴板图片保存到 `inbox/assets/chat/staging/`。
2. 所有截图暂存完成后，执行 `Inbox - 暂存截图合并入库`。
3. 合并入库会按暂存文件名顺序把多张截图一起交给 AI 视觉模型识别，并要求模型去掉重叠内容和引用重复。
4. 合并成功后，暂存截图会移动/保存到当月附件目录，暂存区会清空。

可选增强：

- OCR 兜底：`brew install tesseract tesseract-lang`
- AI 总结/截图识别：推荐复制 `secrets/chat-capture.local.example.json` 为 `secrets/chat-capture.local.json`，在本地文件里配置 `baseUrl`、`apiKey`、`model`。如截图识别需要单独模型，可配置 `visionModel`。`secrets/*.local.json` 已被 git 忽略。
- 环境变量兜底：也可以用 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`。不要把 API Key 写入仓库文件。

## 会议录音入库 Macro

推荐入口：`Inbox - 最近录音入库`

使用方式：

1. 用 Obsidian 录音插件或系统录音工具保存会议音频。
2. 在 Obsidian 命令面板执行 QuickAdd 命令 `Inbox - 最近录音入库`。
3. 脚本会查找库内最新的 `.m4a`、`.mp3`、`.wav`、`.webm`、`.mp4`、`.aac`、`.flac`、`.ogg` 文件。
4. 录音会复制到 `inbox/assets/audio/YYYY-MM/`，转写后写入 `inbox/meetings/`。
5. 生成的会议记录包含 `Capture Time`、`Meeting Time`、`People`、`简短结论`、`会议摘要`、`待确认` 和原始转写。

如果录音文件不在库内，先复制音频文件路径，再执行 `Inbox - 指定音频入库`。该命令会优先读取剪贴板中的路径；如果剪贴板不是有效路径，会弹出输入框。

音频转写配置：

```json
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-REPLACE_WITH_LOCAL_KEY",
  "model": "gpt-4o-mini",
  "audioBaseUrl": "https://api.openai.com/v1",
  "audioApiKey": "sk-REPLACE_WITH_LOCAL_AUDIO_KEY",
  "audioModel": "whisper-1",
  "audioLanguage": "zh"
}
```

如果 `audioBaseUrl` 或 `audioApiKey` 不配置，脚本会复用 `baseUrl` 和 `apiKey`。`audioModel` 默认是 `whisper-1`，用于兼容 Whisper-compatible API。

## 原则

QuickAdd 只负责低摩擦捕获，不直接写入 `wiki/`。整理时由 Codex 判断领域、归档 raw、沉淀 wiki、更新索引和交叉链接。
