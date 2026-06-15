
# LLM Wiki Rules

## 目标
这个仓库用于维护一个可持续进化的知识系统。

## 目录约定
- inbox/: 统一捕获入口，不按领域拆分，用于 QuickAdd、日常沟通、会议纪要和结论候选
- inbox/quick/: 日常沟通速记
- inbox/meetings/: 会议纪要
- inbox/conclusions/: 结论候选
- inbox/assets/chat/: 聊天截图等 inbox 临时附件
- inbox/processed/: 已处理的 inbox 原文
- raw/: 原始资料，按知识领域分目录，例如 `raw/llm-agent/`、`raw/telematics/`、`raw/computer-science/`
- wiki/: 整理后的知识页，按知识领域分目录
- templates/quickadd/: QuickAdd 捕获模板
- wiki/首页.md：全库入口，只链接到各领域入口页
- wiki/<domain>/首页.md：领域入口页
- wiki/<domain>/sources/: 来源总结页
- wiki/<domain>/concepts/: 概念页
- wiki/<domain>/notes/: 观点、重点、结论页
- wiki/<domain>/maps/: 主题索引或领域地图
- AGENTS.md（本文件）：仓库根目录下的工作规则

## ingest 原则
当有新资料进入 `raw/<domain>/` 或 `inbox/` 时：
1. 生成对应的来源页
2. 提炼关键观点
3. 更新相关的 wiki 页面
4. 增加必要的交叉链接
5. 如无对应页面，则创建新页面
6. 如属于新领域，先创建 `wiki/<domain>/首页.md` 和必要的 `sources/`、`concepts/`、`notes/`、`maps/` 目录
7. 跨领域知识不要直接平铺在 `wiki/` 或 `raw/` 根目录下；应放入对应 domain，必要时通过领域首页或主题地图互链
8. `inbox/` 内容先判断领域，再归档到对应 `raw/<domain>/`；不要让 inbox 文件长期承担正式知识页职责

## 查询原则
回答问题时，先判断问题所属领域，优先参考对应 `wiki/<domain>/` 中已经整理过的页面；必要时再回看对应 `raw/<domain>/`。

## Token 成本控制原则

知识库操作默认采用增量和限定范围策略，避免每次整理都全量读取 `raw/` 或整个 `wiki/`。

- `整理 inbox` 默认只处理未归档的 inbox 文件，不全量重读历史 raw/wiki。
- 判断领域时，优先读取 `wiki/首页.md`、相关领域首页和 `maps/`；只有证据不足时才读取对应领域的 `sources/`、`notes/`、`concepts/` 或 `raw/`。
- `整理知识库：整理 <领域> 知识库` 默认只整理指定领域目录，不跨领域扫描。
- 只有用户明确要求“全库整理”“跨领域整理”或类似指令时，才扩大到多个领域或全库。
- 查询时优先使用 `wiki/` 中的稳定知识页，`raw/` 仅作为证据核对和信息缺口补充。
- 对大文件、长聊天记录、长会议纪要，先做来源摘要和重点页；后续查询优先读取摘要，不反复读取全文。

## Inbox 捕获与整理

`inbox/` 是低摩擦捕获区。用户可以把日常沟通、会议结论、临时判断统一写入 `inbox/`，无需先选择领域。整理时由 agent 判断领域并归档。

### QuickAdd 推荐路径

- 日常沟通速记：`inbox/quick/{{DATE:YYYY-MM-DD-HHmm}}-{{VALUE:title}}.md`
- 会议纪要：`inbox/meetings/{{DATE:YYYY-MM-DD}}-{{VALUE:title}}.md`
- 结论候选：`inbox/conclusions/{{DATE:YYYY-MM-DD-HHmm}}-{{VALUE:title}}.md`
- 聊天记录入库：QuickAdd Macro `Inbox - 聊天记录入库`，读取剪贴板文本或截图，写入 `inbox/quick/`

### 聊天记录捕获规则

- 微信、钉钉等不能批量复制多条消息时，优先使用截图/OCR 捕获。
- 捕获页必须保留 `Capture Time`；如果能从原文或 OCR 中识别时间，再填写 `Conversation Time`，否则写 `待确认`。
- 捕获页可以尝试提取 `People`，但识别不到时写 `待确认`，整理时再人工或由 agent 修正。
- 捕获页不猜领域，统一保持 `Domain: unknown`，整理 inbox 时再判断归属领域。
- 截图原件先保存到 `inbox/assets/chat/`；整理入库时，再随原始记录一起归档到对应 `raw/<domain>/`。

### Inbox 整理规则

当用户说 `整理 inbox`、`整理 inbox/meetings` 或类似指令时：

1. 扫描对应范围内未处理的 inbox 文件；默认跳过 `inbox/processed/`。
2. 根据标题、正文、关键词、`wiki/首页.md`、领域首页和主题地图判断 domain；不要为了判断领域全量读取所有 raw/wiki。
3. 如果能判断领域，将原始记录归档到 `raw/<domain>/`，并把稳定知识沉淀到 `wiki/<domain>/sources/`、`concepts/`、`notes/`、`maps/`。
4. 如果不能判断领域，将文件保留在 inbox，并标记或汇报 `Domain: unknown`，不要强行归类。
5. 整理完成后，将已处理 inbox 文件移动到 `inbox/processed/YYYY-MM/`，或在原文件中标记 `Status: processed`、`Domain: <domain>`、`Processed: <date>`。
6. 更新对应领域首页和主题地图，补充交叉链接。
7. 最后汇报新增文件、更新文件、已处理 inbox 文件、仍未归类文件。

QuickAdd 不应直接写入 `wiki/`；`wiki/` 只保存整理后的稳定知识。

## 凭据与敏感信息处理

知识库可以记录系统名称、访问入口、账号名、权限角色、使用场景和凭据存放位置，但不要在 `raw/`、`wiki/` 或 `AGENTS.md` 中保存明文口令、Token、API Key、Cookie、会话信息、私钥或一次性验证码。

当来源资料中包含明文凭据时：

1. 入库时保留操作含义和访问上下文。
2. 将明文凭据替换为 `<凭据已省略>`、`<口令见本地密码管理器>` 或类似占位。
3. 在来源页说明“原文包含敏感凭据，知识库已省略明文”。
4. 如用户需要长期保存凭据，应放入本机密码管理器、系统钥匙串或单独的本地密钥文件；wiki 只记录该凭据的查找位置，不记录明文值。
5. 不把用户在对话中临时提供的登录信息写入仓库文件。

## 知识库操作能力

后续用户可以用固定句式触发知识库操作。执行时应优先遵守领域目录约定，不把不同领域内容平铺混放。

### 1. 加入知识库

触发句式：

- `加入知识库：把 <资料/链接/文件> 加入 <领域> 知识库`
- `加入知识库：把 <inbox 文件> 加入 <领域> 知识库`

执行规则：

1. 识别 `<领域>`，映射为 domain 目录名；如是新领域，创建 `raw/<domain>/` 与 `wiki/<domain>/{sources,concepts,notes,maps}/`。
2. 将资料保存、复制或登记到 `raw/<domain>/`。如果资料来自 `inbox/`，保留原始记录并标注 inbox 来源；如果资料是链接，来源页必须记录 URL、标题、作者、日期和访问/整理日期；如果无法抓取全文，应明确标注信息不足。
3. 在 `wiki/<domain>/sources/` 创建来源总结页。
4. 提炼关键观点，更新或创建 `wiki/<domain>/concepts/`、`wiki/<domain>/notes/`、`wiki/<domain>/maps/` 中的相关页面。
5. 更新 `wiki/<domain>/首页.md` 与必要主题地图，增加交叉链接。
6. 最后汇报：新增文件、更新文件、未能确认的信息。

### 2. 查询知识库

触发句式：

- `查询知识库：基于 <领域> 知识库，回答 <问题>`

执行规则：

1. 只在对应 `wiki/<domain>/` 中优先检索和阅读。
2. 如果 wiki 信息不足，再回看对应 `raw/<domain>/`；仍不足时说明缺口，不跨领域猜测。
3. 回答应引用所依据的 wiki 页面名称或路径。
4. 如果发现查询结果适合沉淀为结论，可询问是否要执行“沉淀知识库”，但不要擅自写入。

### 3. 沉淀知识库

触发句式：

- `沉淀知识库：把刚才结论沉淀到 <领域> 知识库`

执行规则：

1. 将上一轮回答中的稳定结论整理为 `wiki/<domain>/notes/` 下的观点页或重点页。
2. 如果结论涉及新概念，创建或更新 `wiki/<domain>/concepts/`。
3. 在相关来源页、概念页、主题地图和领域首页中补充链接。
4. 保留结论边界：哪些来自已有 wiki，哪些是基于已有内容的推论。
5. 最后汇报：新增文件、更新文件、关联到哪些页面。

### 4. 整理知识库

触发句式：

- `整理知识库：整理 <领域> 知识库，更新索引和重复内容`
- `整理 inbox`
- `整理 inbox/<范围>`

执行规则：

1. 如果目标是领域知识库，默认只扫描 `wiki/<domain>/` 的领域首页、maps 和必要的 sources、concepts、notes。
2. 如果目标是 inbox，按 “Inbox 整理规则” 增量判断领域、归档 raw、沉淀 wiki。
3. 查找重复概念、孤立页面、断裂链接、命名不一致、缺少来源的结论。
4. 合并或重定向重复内容；必要时保留一个主页面，其他页面改为索引或指向主页面。
5. 更新领域首页和主题地图，使阅读路径清晰。
6. 不删除原始资料；如需删除 wiki 页面，应先说明原因并尽量改为合并/归档。
7. 最后汇报：整理动作、合并内容、更新索引、仍需人工判断的问题。
