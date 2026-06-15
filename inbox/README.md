# Inbox

`inbox/` 是统一捕获入口，用于保存日常沟通、会议纪要和结论候选。这里的内容可以粗糙、未归类、未链接；整理时再判断领域并沉淀到 `raw/<domain>/` 和 `wiki/<domain>/`。

## 目录

- `quick/`：日常沟通速记
- `meetings/`：会议纪要
- `conclusions/`：结论候选
- `assets/chat/`：聊天截图等 inbox 临时附件
- `assets/audio/`：会议录音等 inbox 临时附件
- `processed/`：已处理的 inbox 原文

## 使用方式

日常用 QuickAdd 写入本目录。之后可以对 Codex 说：

```text
整理 inbox
```

或指定范围：

```text
整理 inbox/meetings
```

整理后，原始记录会归档到 `raw/<domain>/`，稳定知识会进入 `wiki/<domain>/`。

## 聊天记录快速录入

微信、钉钉等聊天工具如果不能复制多条消息，可以截图后触发 QuickAdd 命令：

```text
Inbox - 聊天记录入库
```

该命令会优先读取剪贴板文本；如果剪贴板是图片，则保存截图并优先用 AI 视觉识别，失败时再回退 OCR。录入时不判断领域，统一写入 `inbox/quick/`，整理时再归档到对应 `raw/<domain>/`。

## 会议录音快速录入

录音先由 Obsidian 录音插件或系统录音工具保存到本地，然后触发 QuickAdd 命令：

```text
Inbox - 最近录音入库
```

该命令会在库内查找最新的音频文件，复制到 `inbox/assets/audio/YYYY-MM/`，调用 Whisper-compatible API 转写，再生成 `inbox/meetings/` 下的会议记录。

如果录音不在库内，先复制音频文件路径，再触发：

```text
Inbox - 指定音频入库
```

语音转文字走本地转写工具，大模型只负责总结转写文本。自动化录音入库默认对接 whisper.cpp server 这类 Whisper-compatible HTTP 服务，地址是 `http://127.0.0.1:9000/v1/audio/transcriptions`。如果本地 Whisper 服务不是 9000 端口，在 `secrets/chat-capture.local.json` 里配置 `audioBaseUrl`；如果服务给的是完整转写接口地址，直接填写 `audioTranscriptionsUrl`。

如果使用 MacWhisper，推荐先在 MacWhisper 中打开录音并导出 `.txt`，再把转写文本录入 inbox；MacWhisper 本身更偏桌面手动工具，不等同于脚本可直接调用的 HTTP 服务。
