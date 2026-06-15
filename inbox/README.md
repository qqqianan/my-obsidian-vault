# Inbox

`inbox/` 是统一捕获入口，用于保存日常沟通、会议纪要和结论候选。这里的内容可以粗糙、未归类、未链接；整理时再判断领域并沉淀到 `raw/<domain>/` 和 `wiki/<domain>/`。

## 目录

- `quick/`：日常沟通速记
- `meetings/`：会议纪要
- `conclusions/`：结论候选
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

