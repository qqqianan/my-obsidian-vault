/*
 * QuickAdd user script: capture chat text or screenshots into inbox.
 *
 * Usage:
 * 1. Copy chat text, or copy a chat screenshot to the macOS clipboard.
 * 2. Run QuickAdd command "Inbox - 聊天记录入库".
 *
 * Optional:
 * - Install tesseract for OCR: brew install tesseract tesseract-lang
 * - Configure AI in secrets/chat-capture.local.json, or set OPENAI_API_KEY / OPENAI_BASE_URL.
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
  const effectiveSettings = {
    ...settings,
    ...loadLocalConfig(fs, path, vaultPath, settings.configPath),
    nodeRequire: requireFromWindow,
  };
  const now = new Date();
  const captureTime = formatDateTime(now);
  const stamp = formatStamp(now);
  const month = stamp.slice(0, 7);

  const textFromClipboard = (clipboard.readText() || "").trim();
  const image = clipboard.readImage();
  const hasImage = image && !image.isEmpty();

  if (settings.mode === "stage-image") {
    if (!hasImage) {
      if (Notice) new Notice("剪贴板里没有图片，未暂存。");
      return;
    }
    const stagedRel = stageClipboardImage(fs, path, vaultPath, image.toPNG(), stamp);
    if (Notice) new Notice(`已暂存聊天截图：${stagedRel}`);
    return;
  }

  if (settings.mode === "capture-staged") {
    const stagedImages = readStagedImages(fs, path, vaultPath);
    if (!stagedImages.length) {
      if (Notice) new Notice("没有暂存截图。请先执行“聊天截图暂存”。");
      return;
    }
    await captureFromImageBuffers({
      app,
      fs,
      path,
      vaultPath,
      effectiveSettings,
      imageBuffers: stagedImages.map((item) => item.buffer),
      stagedFiles: stagedImages.map((item) => item.abs),
      captureTime,
      stamp,
      month,
      childProcess,
      Notice,
    });
    return;
  }

  let screenshotLink = "";
  let screenshotPath = "";
  let extractedText = "";
  let extractionStatus = textFromClipboard ? "clipboard-text" : "not-needed";
  let extractedSource = "";
  let extractedPeople = "";
  let extractedConversationTime = "";
  let extractedSummary = "";

  if (hasImage) {
    const saved = saveImageBuffers(fs, path, vaultPath, [image.toPNG()], stamp, month);
    screenshotPath = saved[0].abs;
    screenshotLink = saved.map((item) => `![[${item.rel}]]`).join("\n");

    if (!textFromClipboard) {
      const vision = await extractChatFromImages([image.toPNG()], effectiveSettings);
      if (vision.text) {
        extractedText = vision.text;
        extractedSource = vision.source;
        extractedPeople = vision.people;
        extractedConversationTime = vision.conversationTime;
        extractedSummary = vision.summary;
        extractionStatus = vision.status;
      } else {
        const ocr = runOcrIfAvailable(childProcess, screenshotPath);
        extractedText = cleanChatText(ocr.text.trim());
        extractionStatus = `ocr-fallback (${vision.status}; ${ocr.status})`;
      }
    }
  }

  const rawText = textFromClipboard || extractedText;
  if (!rawText && !hasImage) {
    if (Notice) new Notice("剪贴板里没有文本或图片，未生成 inbox 记录。");
    return;
  }

  const source = extractedSource || detectSource(rawText);
  const people = extractedPeople || extractPeople(rawText);
  const conversationTime = extractedConversationTime || extractConversationTime(rawText) || "待确认";
  const summaryResult = extractedSummary
    ? { status: extractionStatus, summary: extractedSummary }
    : await summarizeChat(rawText, effectiveSettings);
  const summary = summaryResult.summary;
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
    extractionStatus,
    aiStatus: summaryResult.status,
  });

  await app.vault.create(fileRel, fileBody);
  const file = app.vault.getAbstractFileByPath(fileRel);
  if (file) {
    await app.workspace.getLeaf(true).openFile(file);
  }

  if (Notice) new Notice(`已录入聊天记录：${fileRel}`);
};

async function captureFromImageBuffers(context) {
  const {
    app,
    fs,
    path,
    vaultPath,
    effectiveSettings,
    imageBuffers,
    stagedFiles,
    captureTime,
    stamp,
    month,
    childProcess,
    Notice,
  } = context;

  const saved = saveImageBuffers(fs, path, vaultPath, imageBuffers, stamp, month);
  const screenshotLink = saved.map((item) => `![[${item.rel}]]`).join("\n");
  const vision = await extractChatFromImages(imageBuffers, effectiveSettings);
  let extractedText = "";
  let extractionStatus = vision.status;
  let extractedSource = "";
  let extractedPeople = "";
  let extractedConversationTime = "";
  let extractedSummary = "";

  if (vision.text) {
    extractedText = vision.text;
    extractedSource = vision.source;
    extractedPeople = vision.people;
    extractedConversationTime = vision.conversationTime;
    extractedSummary = vision.summary;
  } else {
    const ocrTexts = saved.map((item) => runOcrIfAvailable(childProcess, item.abs).text).join("\n");
    extractedText = cleanChatText(ocrTexts.trim());
    extractionStatus = `ocr-fallback (${vision.status})`;
  }

  const rawText = extractedText;
  const source = extractedSource || detectSource(rawText);
  const people = extractedPeople || extractPeople(rawText);
  const conversationTime = extractedConversationTime || extractConversationTime(rawText) || "待确认";
  const summaryResult = extractedSummary
    ? { status: extractionStatus, summary: extractedSummary }
    : await summarizeChat(rawText, effectiveSettings);
  const summary = summaryResult.summary;
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
    extractionStatus,
    aiStatus: summaryResult.status,
  });

  await app.vault.create(fileRel, fileBody);
  removeFiles(fs, stagedFiles);
  const file = app.vault.getAbstractFileByPath(fileRel);
  if (file) {
    await app.workspace.getLeaf(true).openFile(file);
  }
  if (Notice) new Notice(`已合并 ${imageBuffers.length} 张截图入库：${fileRel}`);
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatStamp(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function stageClipboardImage(fs, path, vaultPath, imageBuffer, stamp) {
  const stagingRel = "inbox/assets/chat/staging";
  const stagingAbs = path.join(vaultPath, stagingRel);
  fs.mkdirSync(stagingAbs, { recursive: true });
  const imageName = `${stamp}-${Date.now()}-chat.png`;
  const imageAbs = path.join(stagingAbs, imageName);
  fs.writeFileSync(imageAbs, imageBuffer);
  return `${stagingRel}/${imageName}`;
}

function readStagedImages(fs, path, vaultPath) {
  const stagingAbs = path.join(vaultPath, "inbox/assets/chat/staging");
  if (!fs.existsSync(stagingAbs)) return [];
  return fs.readdirSync(stagingAbs)
    .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name))
    .sort()
    .map((name) => {
      const abs = path.join(stagingAbs, name);
      return { abs, buffer: fs.readFileSync(abs) };
    });
}

function saveImageBuffers(fs, path, vaultPath, imageBuffers, stamp, month) {
  const imageDirRel = `inbox/assets/chat/${month}`;
  const imageDirAbs = path.join(vaultPath, imageDirRel);
  fs.mkdirSync(imageDirAbs, { recursive: true });
  return imageBuffers.map((buffer, index) => {
    const suffix = imageBuffers.length === 1 ? "chat" : `chat-${String(index + 1).padStart(2, "0")}`;
    const rel = `${imageDirRel}/${stamp}-${suffix}.png`;
    const abs = path.join(vaultPath, rel);
    fs.writeFileSync(abs, buffer);
    return { rel, abs };
  });
}

function removeFiles(fs, files) {
  for (const file of files || []) {
    try {
      fs.unlinkSync(file);
    } catch (_error) {
      // Best effort cleanup only.
    }
  }
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

async function extractChatFromImages(imageBuffers, settings) {
  try {
    const apiKeyEnv = settings.openaiApiKeyEnv || "OPENAI_API_KEY";
    const baseUrlEnv = settings.openaiBaseUrlEnv || "OPENAI_BASE_URL";
    const env = typeof process !== "undefined" && process.env ? process.env : {};
    const apiKey = settings.apiKey || env[apiKeyEnv] || "";
    if (!apiKey) return emptyVisionResult("missing-api-key");

    const model = settings.visionModel || settings.model || "gpt-4o-mini";
    const baseUrl = normalizeBaseUrl(settings.baseUrl || env[baseUrlEnv] || "https://api.openai.com/v1");
    const imageParts = imageBuffers.map((buffer) => ({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${Buffer.from(buffer).toString("base64")}` },
    }));
    const body = {
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: [
            "你是聊天截图入库助手。",
            "请直接识别截图中的聊天内容，不要使用 OCR 噪声。",
            "用户可能提供一张或多张连续聊天截图；多张截图按输入顺序从上到下、从早到晚合并。",
            "多张截图之间可能有重叠内容，请合并去重，不要重复写入 cleanedText 或 summary。",
            "需要区分真实聊天消息和 UI 元素，例如未读人数、回复按钮、图片占位、头像、应用导航。",
            "如果是钉钉截图，source 填“钉钉”；如果是微信截图，source 填“微信”；无法判断填 unknown。",
            "如果某条消息引用/回复了别人的旧消息，引用内容只作为背景上下文；cleanedText 中可以标注为【引用上下文：...】，但 summary 不要把引用内容当作本次新结论。",
            "summary 必须优先总结截图中新发生的沟通结果：谁提出请求、谁确认/回复、当前结论是什么。",
            "summary 不要平铺复述引用里的历史细节；只有当后续新消息明确确认、否定或改变了引用内容时，才把它写入结论。",
            "如果截图中只有转发/引用并要求某人确认，summary 应写成“某人转发/询问某事，接收人已收到/待确认”，而不是把被引用内容扩写成最终结论。",
            "只返回 JSON，不要 Markdown。",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "请从这张聊天截图中提取结构化信息，返回 JSON：",
                imageBuffers.length > 1 ? `共有 ${imageBuffers.length} 张连续聊天截图，请按顺序合并识别并去重。` : "共有 1 张聊天截图。",
                "{",
                '  "source": "微信/钉钉/unknown",',
                '  "conversationTime": "能识别到的对话时间，识别不到填待确认",',
                '  "people": "参与人，逗号分隔，识别不到填待确认",',
                '  "cleanedText": "按时间顺序整理后的聊天原文，去掉未读、回复按钮、头像、导航等 UI 噪声；引用消息只保留一次并标注为引用上下文",',
                '  "summary": "1-3 条简短结论，只总结本次截图中新发生的沟通结果；引用上下文只作为背景，不要扩写成结论；不猜领域，不生成待办表"',
                "}",
              ].join("\n"),
            },
            ...imageParts,
          ],
        },
      ],
    };
    const response = await postJson(settings.nodeRequire, `${baseUrl}/chat/completions`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
    if (response.status < 200 || response.status >= 300) {
      return emptyVisionResult(`vision-http-${response.status}: ${truncate(response.text, 160)}`);
    }
    const content = (response.json.choices && response.json.choices[0] && response.json.choices[0].message && response.json.choices[0].message.content || "").trim();
    const parsed = parseJsonObject(content);
    if (!parsed) return emptyVisionResult("vision-empty-or-invalid-json");
    return {
      status: `vision-ok (${model})`,
      source: normalizeUnknown(parsed.source),
      conversationTime: normalizeUnknown(parsed.conversationTime),
      people: normalizeUnknown(parsed.people),
      text: cleanChatText(parsed.cleanedText || ""),
      summary: normalizeUnknown(parsed.summary),
    };
  } catch (error) {
    return emptyVisionResult(`vision-request-failed: ${error.message || String(error)}`);
  }
}

function emptyVisionResult(status) {
  return {
    status,
    source: "",
    conversationTime: "",
    people: "",
    text: "",
    summary: "",
  };
}

function parseJsonObject(content) {
  try {
    return JSON.parse(content);
  } catch (_error) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (__error) {
      return null;
    }
  }
}

function normalizeUnknown(value) {
  const normalized = String(value || "").trim();
  return normalized && normalized !== "unknown" && normalized !== "待确认" ? normalized : "";
}

function loadLocalConfig(fs, path, vaultPath, configPath) {
  const configRel = configPath || "secrets/chat-capture.local.json";
  const configAbs = path.isAbsolute(configRel) ? configRel : path.join(vaultPath, configRel);
  if (!fs.existsSync(configAbs)) return {};
  try {
    return JSON.parse(fs.readFileSync(configAbs, "utf8"));
  } catch (error) {
    console.warn(`Failed to read chat capture config ${configAbs}:`, error);
    return {};
  }
}

function detectSource(text) {
  if (/钉钉|DingTalk|DING|未读|回复/.test(text) && !/微信|WeChat/.test(text)) return "钉钉";
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
  if (!text) return { status: "skipped-no-text", summary: "截图已保存，但未获得可总结的文本。" };
  const openAiSummary = await summarizeWithOpenAI(text, settings);
  if (openAiSummary.summary) return openAiSummary;
  return {
    status: `fallback-local-rule (${openAiSummary.status})`,
    summary: heuristicSummary(text),
  };
}

async function summarizeWithOpenAI(text, settings) {
  try {
    const apiKeyEnv = settings.openaiApiKeyEnv || "OPENAI_API_KEY";
    const baseUrlEnv = settings.openaiBaseUrlEnv || "OPENAI_BASE_URL";
    const env = typeof process !== "undefined" && process.env ? process.env : {};
    const apiKey = settings.apiKey || env[apiKeyEnv] || "";
    if (!apiKey) return { status: "missing-api-key", summary: "" };
    const model = settings.model || "gpt-4o-mini";
    const baseUrl = normalizeBaseUrl(settings.baseUrl || env[baseUrlEnv] || "https://api.openai.com/v1");
    const body = {
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "你是个人知识库助手。请把聊天记录总结成一段简短中文结论，不猜领域，不生成待办表。",
            "如果聊天里包含引用/转发的旧消息，引用内容只作为背景；优先总结引用之后的新沟通结果、确认结果和当前状态。",
            "不要把引用里的历史细节平铺复述成新的结论，除非后续消息明确确认、否定或改变了它。",
          ].join("\n"),
        },
        {
          role: "user",
          content: `请用 1-3 条要点总结以下聊天记录，保留关键结论和边界：\n\n${text.slice(0, 12000)}`,
        },
      ],
    };
    const response = await postJson(settings.nodeRequire, `${baseUrl}/chat/completions`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
    if (response.status < 200 || response.status >= 300) {
      return { status: `http-${response.status}: ${truncate(response.text, 160)}`, summary: "" };
    }
    const data = response.json;
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || data.choices && data.choices[0] && data.choices[0].text || "").trim();
    return content ? { status: `ok (${model})`, summary: content } : { status: "empty-response", summary: "" };
  } catch (error) {
    return { status: `request-failed: ${error.message || String(error)}`, summary: "" };
  }
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
}

function postJson(nodeRequire, url, options) {
  return new Promise((resolve, reject) => {
    try {
      if (!nodeRequire) {
        reject(new Error("Node require is unavailable"));
        return;
      }
      const parsed = new URL(url);
      const transport = nodeRequire(parsed.protocol === "http:" ? "http" : "https");
      const body = JSON.stringify(options.body || {});
      const request = transport.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || undefined,
          path: `${parsed.pathname}${parsed.search}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
            ...(options.headers || {}),
          },
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            let json = {};
            try {
              json = text ? JSON.parse(text) : {};
            } catch (_error) {
              json = {};
            }
            resolve({ status: response.statusCode || 0, text, json });
          });
        },
      );
      request.on("error", reject);
      request.setTimeout(30000, () => {
        request.destroy(new Error("request timeout"));
      });
      request.write(body);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

function heuristicSummary(text) {
  const lines = cleanChatText(text)
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

function cleanChatText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d+人未读$/.test(line))
    .filter((line) => !/^(回复|收到|图片|\\[图片\\])$/.test(line))
    .filter((line) => !/^[A-Za-z0-9]{3,}\s+\d+人未读$/.test(line));

  const seen = new Set();
  const cleaned = [];
  for (const line of lines) {
    const normalized = normalizeLineForDedupe(line);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    cleaned.push(line);
  }
  return cleaned.join("\n");
}

function normalizeLineForDedupe(line) {
  return stripSpeakerPrefix(line)
    .replace(/@\S+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "")
    .trim();
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
- Extraction Status: ${data.extractionStatus}
- AI Status: ${data.aiStatus}

## 简短结论

${data.summary}

## 原始聊天记录
${rawBlock}${screenshotSection}## 整理提示

- 录入时不判断领域；整理 inbox 时再决定归属领域并归档到 raw。
- 如果 Conversation Time、People 或 OCR 内容不准确，整理时以原始截图/原始记录为准。
`;
}
