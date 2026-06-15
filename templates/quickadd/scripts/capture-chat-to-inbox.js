/*
 * QuickAdd user script: capture chat text or screenshots into inbox.
 *
 * Usage:
 * 1. Copy chat text, or copy a chat screenshot to the macOS clipboard.
 * 2. Run QuickAdd command "Inbox - 聊天记录入库".
 *
 * Optional:
 * - Install tesseract for OCR: brew install tesseract tesseract-lang
 * - Set OPENAI_API_KEY in the environment that launches Obsidian for AI summary.
 */

module.exports = async function captureChatToInbox(params, settings = {}) {
  const { app, obsidian } = params;
  const Notice = obsidian && obsidian.Notice;
  const requireFromWindow = typeof window !== "undefined" && window.require;
  if (!requireFromWindow) {
    throw new Error("QuickAdd script requires Obsidian desktop with Node integration.");
  }

  const fs = requireFromWindow("fs");
  const path = requireFromWindow("path");
  const childProcess = requireFromWindow("child_process");
  const electron = requireFromWindow("electron");

  const clipboard = electron.clipboard;
  const vaultPath = app.vault.adapter.basePath;
  const now = new Date();
  const captureTime = formatDateTime(now);
  const stamp = formatStamp(now);
  const month = stamp.slice(0, 7);

  const textFromClipboard = (clipboard.readText() || "").trim();
  const image = clipboard.readImage();
  const hasImage = image && !image.isEmpty();

  let screenshotLink = "";
  let screenshotPath = "";
  let ocrText = "";
  let ocrStatus = "not-needed";

  if (hasImage) {
    const imageDirRel = `inbox/assets/chat/${month}`;
    const imageDirAbs = path.join(vaultPath, imageDirRel);
    fs.mkdirSync(imageDirAbs, { recursive: true });
    const imageName = `${stamp}-chat.png`;
    screenshotPath = path.join(imageDirAbs, imageName);
    fs.writeFileSync(screenshotPath, image.toPNG());
    screenshotLink = `![[${imageDirRel}/${imageName}]]`;

    const ocr = runOcrIfAvailable(childProcess, screenshotPath);
    ocrText = ocr.text.trim();
    ocrStatus = ocr.status;
  }

  const rawText = textFromClipboard || ocrText;
  if (!rawText && !hasImage) {
    if (Notice) new Notice("剪贴板里没有文本或图片，未生成 inbox 记录。");
    return;
  }

  const source = detectSource(rawText);
  const people = extractPeople(rawText);
  const conversationTime = extractConversationTime(rawText) || "待确认";
  const summary = await summarizeChat(rawText, settings);
  const title = buildTitle(summary, rawText, stamp);
  const fileRel = await uniqueInboxPath(app, `inbox/quick/${stamp}-${title}.md`);
  const fileBody = buildMarkdown({
    title,
    captureTime,
    conversationTime,
    source,
    people,
    summary,
    rawText,
    screenshotLink,
    ocrStatus,
  });

  await app.vault.create(fileRel, fileBody);
  const file = app.vault.getAbstractFileByPath(fileRel);
  if (file) {
    await app.workspace.getLeaf(true).openFile(file);
  }

  if (Notice) new Notice(`已录入聊天记录：${fileRel}`);
};

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatStamp(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function runOcrIfAvailable(childProcess, imagePath) {
  try {
    const tesseract = childProcess.execFileSync("/bin/zsh", ["-lc", "command -v tesseract || true"], {
      encoding: "utf8",
    }).trim();
    if (!tesseract) {
      return { status: "missing-tesseract", text: "" };
    }
    const text = childProcess.execFileSync(tesseract, [imagePath, "stdout", "-l", "chi_sim+eng", "--psm", "6"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return { status: "ok", text };
  } catch (error) {
    return { status: `failed: ${error.message || String(error)}`, text: "" };
  }
}

function detectSource(text) {
  if (/钉钉|DingTalk/i.test(text)) return "钉钉";
  if (/微信|WeChat/i.test(text)) return "微信";
  return "unknown";
}

function extractPeople(text) {
  if (!text) return "待确认";
  const names = new Set();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const stopWords = new Set([
    "今天",
    "昨天",
    "上午",
    "下午",
    "晚上",
    "微信",
    "钉钉",
    "群聊",
    "聊天记录",
    "撤回了一条消息",
  ]);

  for (const line of lines) {
    const colonMatch = /^([\u4e00-\u9fa5A-Za-z0-9_.·\s-]{2,24})[:：]\s*/.exec(line);
    const timeMatch = /^([\u4e00-\u9fa5A-Za-z0-9_.·\s-]{2,24})\s+(今天|昨天|上午|下午|晚上)?\s*\d{1,2}:\d{2}/.exec(line);
    const name = cleanName((colonMatch && colonMatch[1]) || (timeMatch && timeMatch[1]));
    if (!name || stopWords.has(name)) continue;
    if (/^\d/.test(name)) continue;
    names.add(name);
  }

  return names.size ? Array.from(names).slice(0, 12).join(", ") : "待确认";
}

function cleanName(value) {
  return (value || "").replace(/\s+/g, " ").trim().replace(/[：:]+$/, "");
}

function extractConversationTime(text) {
  if (!text) return "";
  const patterns = [
    /\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}[日]?\s*(?:上午|下午|晚上)?\s*\d{1,2}:\d{2}/,
    /\d{1,2}月\d{1,2}日\s*(?:上午|下午|晚上)?\s*\d{1,2}:\d{2}/,
    /(?:今天|昨天|前天)\s*(?:上午|下午|晚上)?\s*\d{1,2}:\d{2}/,
    /(?:上午|下午|晚上)\s*\d{1,2}:\d{2}/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].replace(/\s+/g, " ").trim();
  }
  return "";
}

async function summarizeChat(text, settings) {
  if (!text) return "截图已保存，但未获得可总结的文本。";
  const openAiSummary = await summarizeWithOpenAI(text, settings);
  if (openAiSummary) return openAiSummary;
  return heuristicSummary(text);
}

async function summarizeWithOpenAI(text, settings) {
  try {
    const apiKeyEnv = settings.openaiApiKeyEnv || "OPENAI_API_KEY";
    const apiKey = typeof process !== "undefined" && process.env ? process.env[apiKeyEnv] : "";
    if (!apiKey) return "";
    const model = settings.model || "gpt-4o-mini";
    const body = {
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "你是个人知识库助手。请把聊天记录总结成一段简短中文结论，不猜领域，不生成待办表。",
        },
        {
          role: "user",
          content: `请用 1-3 条要点总结以下聊天记录，保留关键结论和边界：\n\n${text.slice(0, 12000)}`,
        },
      ],
    };
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
  } catch (_error) {
    return "";
  }
}

function heuristicSummary(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map(stripSpeakerPrefix)
    .filter((line) => line.length >= 4)
    .filter((line) => !/^(今天|昨天|前天|上午|下午|晚上)?\s*\d{1,2}:\d{2}$/.test(line))
    .filter((line) => !/^\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}/.test(line));

  const conclusionLine = lines.find((line) => /(结论|确认|决定|所以|需要|不需要|可以|不能|失败|成功|风险|问题|方案)/.test(line));
  const first = conclusionLine || lines[0] || "待人工补充";
  const second = lines.find((line) => line !== first && line.length >= 8);
  const points = [`- ${truncate(first, 120)}`];
  if (second) points.push(`- ${truncate(second, 120)}`);
  points.push("- 该总结为本地规则生成，整理 inbox 时可进一步归纳。");
  return points.join("\n");
}

function buildTitle(summary, rawText, stamp) {
  const source = `${summary || rawText || "聊天记录"}`.replace(/[`*_#[\]()>~-]/g, "");
  const first = source
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-\d. ]+/, "").trim())
    .find(Boolean) || "聊天记录";
  return sanitizeFileName(truncate(first, 22)) || `聊天记录-${stamp}`;
}

function stripSpeakerPrefix(line) {
  return String(line || "").replace(/^[\u4e00-\u9fa5A-Za-z0-9_.·\s-]{2,24}[:：]\s*/, "").trim();
}

function truncate(text, maxLength) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function sanitizeFileName(name) {
  return String(name || "")
    .replace(/[\\/:*?"<>|#^[\]]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .trim();
}

async function uniqueInboxPath(app, basePath) {
  if (!app.vault.getAbstractFileByPath(basePath)) return basePath;
  const dot = basePath.lastIndexOf(".");
  const prefix = dot === -1 ? basePath : basePath.slice(0, dot);
  const ext = dot === -1 ? "" : basePath.slice(dot);
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${prefix}-${index}${ext}`;
    if (!app.vault.getAbstractFileByPath(candidate)) return candidate;
  }
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${prefix}-${suffix}${ext}`;
}

function buildMarkdown(data) {
  const rawBlock = data.rawText
    ? `\n\`\`\`text\n${data.rawText.replace(/```/g, "'''")}\n\`\`\`\n`
    : "\n未获得可识别文本。若来源为截图，请确认 OCR 配置或后续人工补充。\n";

  const screenshotSection = data.screenshotLink
    ? `\n## 原始截图\n\n${data.screenshotLink}\n\n`
    : "\n";

  return `# ${data.title}

- Capture Time: ${data.captureTime}
- Conversation Time: ${data.conversationTime}
- Type: chat-summary
- Source: ${data.source}
- Domain: unknown
- Status: inbox
- People: ${data.people}
- OCR Status: ${data.ocrStatus}

## 简短结论

${data.summary}

## 原始聊天记录
${rawBlock}${screenshotSection}## 整理提示

- 录入时不判断领域；整理 inbox 时再决定归属领域并归档到 raw。
- 如果 Conversation Time、People 或 OCR 内容不准确，整理时以原始截图/原始记录为准。
`;
}
