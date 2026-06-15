# Inbox

`inbox/` 是统一捕获入口，用于保存日常沟通、会议纪要和结论候选。这里的内容可以粗糙、未归类、未链接；整理时再判断领域并沉淀到 `raw/<domain>/` 和 `wiki/<domain>/`。

## 目录

- `quick/`：日常沟通速记
- `meetings/`：会议纪要
- `conclusions/`：结论候选
- `assets/chat/`：聊天截图等 inbox 临时附件
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

该命令会优先读取剪贴板文本；如果剪贴板是图片，则保存截图并在本机安装 `tesseract` 时执行 OCR。录入时不判断领域，统一写入 `inbox/quick/`，整理时再归档到对应 `raw/<domain>/`。
