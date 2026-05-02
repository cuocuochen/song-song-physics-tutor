上下文

 用户是一位高中物理教师，已有一个 physics-diagram Next.js 16 项目（AI识别+SVG模板渲染）。现在需要在
 C:\Users\Lenovo\Desktop\松松项目 新建独立应用，实现三页面物理题目辅导系统。

 复用策略：从 physics-diagram 复制 SVG 原语组件、AI客户端模式、上传组件，全新开发辅导流程和交互。

 技术栈

 ┌──────┬───────────────────────────────────────────────────┬────────────────────────────────────────┐
 │  层  │                       选择                        │                  理由                  │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ 框架 │ Next.js 16 (App Router)                           │ 与现有项目一致，用户熟悉               │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ UI   │ React 19 + Tailwind CSS v4                        │ 与现有项目一致                         │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ 动画 │ framer-motion                                     │ 已在现有项目中使用                     │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ 公式 │ KaTeX                                             │ 轻量（~280KB），同步渲染，高中物理够用 │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ AI   │ OpenAI SDK → DashScope (qwen-vl-max / qwen-turbo) │ 复用现有API密钥和模式                  │
 ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ 搜索 │ Firecrawl API (可选)                              │ Page 2 动态检索需要                    │
 └──────┴───────────────────────────────────────────────────┴────────────────────────────────────────┘

 文件树

 C:\Users\Lenovo\Desktop\松松项目\
 ├── package.json
 ├── next.config.ts / tsconfig.json / postcss.config.mjs / eslint.config.mjs
 ├── .env.local
 │
 ├── app/
 │   ├── globals.css                    # Tailwind v4 + physics color tokens
 │   ├── layout.tsx                     # 根布局 + 3tab导航
 │   ├── page.tsx                       # 页面一：模式识别解题助手
 │   ├── similar/page.tsx               # 页面二：同类题生成
 │   ├── learn/page.tsx                 # 页面三：你真的学懂了吗？
 │   └── api/
 │       ├── detect/route.ts            # POST 多题目检测
 │       ├── analyze/route.ts           # POST 完整解题分析
 │       ├── similar/route.ts           # POST 同类题生成
 │       ├── search/route.ts            # POST Firecrawl搜索
 │       └── learn/route.ts             # POST 交互式问答
 │
 ├── components/
 │   ├── shared/
 │   │   ├── ImageUpload.tsx            # 拖拽上传（适配自现有）
 │   │   ├── TextInput.tsx              # 文字输入（适配自现有）
 │   │   ├── LoadingSpinner.tsx         # 加载动画+中文提示
 │   │   ├── ErrorCard.tsx / EmptyState.tsx
 │   │   └── FormulaBlock.tsx           # KaTeX LaTeX渲染器
 │   ├── page1/
 │   │   ├── InputArea.tsx              # 图片/文字双tab输入
 │   │   ├── ProblemSelector.tsx        # 多题选择UI
 │   │   ├── AnalysisCard.tsx           # 分析结果卡片容器
 │   │   ├── SectionCharacteristic.tsx  # 题目特征
 │   │   ├── SectionApproach.tsx        # 解题思路
 │   │   └── SectionSolution.tsx        # 答案解答（含SVG+LaTeX）
 │   ├── page2/
 │   │   ├── KnowledgeSummary.tsx
 │   │   ├── SimilarProblemCard.tsx
 │   │   └── FirecrawlResults.tsx
 │   ├── page3/
 │   │   ├── ChatBubble.tsx / ChatInput.tsx
 │   │   ├── ProgressIndicator.tsx
 │   │   └── FeedbackMessage.tsx
 │   └── svg/
 │       ├── primitives/                # 从physics-diagram复制
 │       │   └── ForceArrow.tsx, Block.tsx, Ball.tsx, Wedge.tsx,
 │       │       Rope.tsx, Pulley.tsx, Spring.tsx, Ground.tsx,
 │       │       Ceiling.tsx, AngleArc.tsx, DashedLine.tsx, Point.tsx
 │       ├── ForceColors.ts             # 物理力矢量色系常量
 │       └── DynamicForceDiagram.tsx    # 将AI生成的diagramSpec渲染为SVG
 │
 ├── lib/
 │   ├── ai/
 │   │   ├── client.ts                  # DashScope OpenAI兼容客户端
 │   │   ├── callAI.ts                  # 带重试+超时的AI调用
 │   │   └── parseResponse.ts           # 从AI响应提取JSON
 │   ├── prompts/
 │   │   ├── detect.ts                  # 多题目检测prompt
 │   │   ├── analyze.ts                 # 完整解题分析prompt
 │   │   ├── similar.ts                 # 同类题生成prompt
 │   │   ├── learn.ts                   # 交互式学习prompt
 │   │   └── diagram.ts                 # 受力图spec生成prompt
 │   ├── types/
 │   │   ├── analysis.ts / similar.ts / learn.ts / diagram.ts
 │   └── utils/
 │       └── colors.ts                  # 物理颜色调色板

 页面路由与数据流

 [Page 1: /]  用户上传 → /api/detect(多题检测) → ProblemSelector(选题)
                   → /api/analyze(完整分析) → AnalysisCard{特征/思路/答案+SVG}
                   → 存入 sessionStorage(供Page2/3使用)

 [Page 2: /similar]  读取 sessionStorage
                   → /api/similar(生成3道同类题) → SimilarProblemCard×3
                   → /api/search(Firecrawl检索真实考题, 可选)

 [Page 3: /learn]  读取 sessionStorage
                   → /api/learn(action:start) → 首题
                   → 用户回答 → /api/learn(action:answer) → 反馈+下一题
                   → 3题完成 → 学习总结

 跨页面状态：使用 sessionStorage 存储分析结果，URL search params 传递简短参数（知识点列表等）。

 关键API规格

 POST /api/detect

 Request:  { image: base64 }
 Response: { count: N, problems: [{index, description, confidence}] }
 用 qwen-vl-max 识别图片中多道独立题目。count=1 或文本输入时跳过选题器。

 POST /api/analyze

 Request:  { type: 'image'|'text', content, problemIndex? }
 Response: {
   characteristic: { scenarioAndProcess, modelAndConditions }
   approach: { readingAndModeling, physicsConcepts, generalSteps[] }
   solution: {
     step1: { description, diagramSpec }
     step2: { description, equations[] }
     step3: { description, finalAnswer }
   }
   coreKnowledgePoints: string[]
 }

 POST /api/similar

 Request:  { knowledgePoints[], originalProblem }
 Response: { knowledgeSummary, similarProblems[{problem, briefAnswer, difficulty, keyHint}] }

 POST /api/learn

 Request:  { action: 'start'|'answer', context, userAnswer?, questionIndex? }
 Response: { type: 'question'|'feedback'|'complete', content, correctAnswer?, isCorrect?, progress? }

 动态受力图生成（核心技术难点）

 采用 diagramSpec JSON → 组件渲染 方案：

 AI 返回结构化的 diagramSpec（对象列表 + 力矢量列表），DynamicForceDiagram 组件将其映射到 SVG 原语组件。

 // diagramSpec 示例
 {
   type: "forceDiagram",
   viewBox: { width: 680, height: 440 },
   objects: [
     { type: "ground", x1: 60, x2: 580, y: 380 },
     { type: "slope_surface", x1: 165, y1: 350, angle: 30, length: 320 },
     { type: "block", cx: 340, cy: 260, w: 64, h: 36, angle: 30, label: "M" }
   ],
   forces: [
     { from: "block_center", direction: "down", label: "mg", color: "gravity" },
     { from: "block_center", angle: 120, label: "N", color: "normal" },
     { from: "block_center", direction: "up_slope", label: "f", color: "friction" }
   ],
   angle_marks: [{ cx: 165, cy: 350, startAngle: 0, endAngle: -30, label: "θ" }]
 }

 备选方案：如果 spec 解析失败，回退到显示文字版受力描述。

 实现步骤（17步）

 ┌─────┬─────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
 │  #  │              任务               │                            关键产出                             │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 1   │ 项目脚手架                      │ package.json, configs, .env.local                               │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 2   │ 全局样式+布局                   │ globals.css, layout.tsx, NavTabs                                │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 3   │ 共享组件                        │ ImageUpload, TextInput, LoadingSpinner, FormulaBlock, ErrorCard │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 4   │ SVG原语迁移                     │ 从physics-diagram复制12个原语，适配新颜色常量                   │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 5   │ AI客户端+工具                   │ client.ts, callAI.ts, parseResponse.ts, types                   │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 6   │ Prompt: detect + analyze        │ 多题检测和完整解题分析的System Prompt                           │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 7   │ API: /api/detect + /api/analyze │ 核心分析API                                                     │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 8   │ Page 1 组件                     │ InputArea, ProblemSelector, AnalysisCard, 三个Section           │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 9   │ 动态受力图                      │ DynamicForceDiagram, diagram.ts prompt, diagram types           │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 10  │ Page 1 集成                     │ app/page.tsx 完整流程                                           │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 11  │ Prompt: similar                 │ 同类题生成System Prompt                                         │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
 │ 12  │ API: /api/similar + /api/search │ 同类题和Firecrawl API                                           │
 ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
  三页面结构（Next.js 16 App Router）：

  ┌──────────────────┬──────────┬──────────────────────────────────────────────────────┐
  │       页面       │   路由   │                         功能                         │
  ├──────────────────┼──────────┼──────────────────────────────────────────────────────┤
  │ 模式识别解题助手 │ /        │ 上传→多题检测→选题→完整分析（特征/思路/解答+受力图） │
  ├──────────────────┼──────────┼──────────────────────────────────────────────────────┤
  │ 同类题生成       │ /similar │ 知识点总结→3道同类题→Firecrawl动态检索               │
  ├──────────────────┼──────────┼──────────────────────────────────────────────────────┤
  │ 交互式学习       │ /learn   │ 3轮问答→鼓励反馈→渐进揭示答案                        │
  └──────────────────┴──────────┴──────────────────────────────────────────────────────┘

  复用：从 physics-diagram 复制 SVG 原语组件（ForceArrow、Block、Ball等12个）、AI客户端模式、上传组件。

  新增核心能力：
  - AI驱动的多题目自动检测（避免多题截图被合并解析）
  - 动态受力图生成（AI 输出 diagramSpec JSON → 组件渲染为 SVG，而非固定模板）
  - KaTeX 公式渲染
  - 鼓励型教师角色的交互问答

  共17个实现步骤，从项目脚手架到端到端测试。

● User approved Claude's plan
  ⎿  Plan saved to: .claude\plans\humming-wobbling-lovelace.md · /plan to edit
     高中物理题目解析王牌教师 — 松松项目 实施计划

     上下文

     用户是一位高中物理教师，已有一个 physics-diagram Next.js 16 项目（AI识别+SVG模板渲染）。现在需要在
     C:\Users\Lenovo\Desktop\松松项目 新建独立应用，实现三页面物理题目辅导系统。

     复用策略：从 physics-diagram 复制 SVG 原语组件、AI客户端模式、上传组件，全新开发辅导流程和交互。

     技术栈

     ┌──────┬───────────────────────────────────────────────────┬────────────────────────────────────────┐
     │  层  │                       选择                        │                  理由                  │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ 框架 │ Next.js 16 (App Router)                           │ 与现有项目一致，用户熟悉               │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ UI   │ React 19 + Tailwind CSS v4                        │ 与现有项目一致                         │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ 动画 │ framer-motion                                     │ 已在现有项目中使用                     │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ 公式 │ KaTeX                                             │ 轻量（~280KB），同步渲染，高中物理够用 │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ AI   │ OpenAI SDK → DashScope (qwen-vl-max / qwen-turbo) │ 复用现有API密钥和模式                  │
     ├──────┼───────────────────────────────────────────────────┼────────────────────────────────────────┤
     │ 搜索 │ Firecrawl API (可选)                              │ Page 2 动态检索需要                    │
     └──────┴───────────────────────────────────────────────────┴────────────────────────────────────────┘

     文件树

     C:\Users\Lenovo\Desktop\松松项目\
     ├── package.json
     ├── next.config.ts / tsconfig.json / postcss.config.mjs / eslint.config.mjs
     ├── .env.local
     │
     ├── app/
     │   ├── globals.css                    # Tailwind v4 + physics color tokens
     │   ├── layout.tsx                     # 根布局 + 3tab导航
     │   ├── page.tsx                       # 页面一：模式识别解题助手
     │   ├── similar/page.tsx               # 页面二：同类题生成
     │   ├── learn/page.tsx                 # 页面三：你真的学懂了吗？
     │   └── api/
     │       ├── detect/route.ts            # POST 多题目检测
     │       ├── analyze/route.ts           # POST 完整解题分析
     │       ├── similar/route.ts           # POST 同类题生成
     │       ├── search/route.ts            # POST Firecrawl搜索
     │       └── learn/route.ts             # POST 交互式问答
     │
     ├── components/
     │   ├── shared/
     │   │   ├── ImageUpload.tsx            # 拖拽上传（适配自现有）
     │   │   ├── TextInput.tsx              # 文字输入（适配自现有）
     │   │   ├── LoadingSpinner.tsx         # 加载动画+中文提示
     │   │   ├── ErrorCard.tsx / EmptyState.tsx
     │   │   └── FormulaBlock.tsx           # KaTeX LaTeX渲染器
     │   ├── page1/
     │   │   ├── InputArea.tsx              # 图片/文字双tab输入
     │   │   ├── ProblemSelector.tsx        # 多题选择UI
     │   │   ├── AnalysisCard.tsx           # 分析结果卡片容器
     │   │   ├── SectionCharacteristic.tsx  # 题目特征
     │   │   ├── SectionApproach.tsx        # 解题思路
     │   │   └── SectionSolution.tsx        # 答案解答（含SVG+LaTeX）
     │   ├── page2/
     │   │   ├── KnowledgeSummary.tsx
     │   │   ├── SimilarProblemCard.tsx
     │   │   └── FirecrawlResults.tsx
     │   ├── page3/
     │   │   ├── ChatBubble.tsx / ChatInput.tsx
     │   │   ├── ProgressIndicator.tsx
     │   │   └── FeedbackMessage.tsx
     │   └── svg/
     │       ├── primitives/                # 从physics-diagram复制
     │       │   └── ForceArrow.tsx, Block.tsx, Ball.tsx, Wedge.tsx,
     │       │       Rope.tsx, Pulley.tsx, Spring.tsx, Ground.tsx,
     │       │       Ceiling.tsx, AngleArc.tsx, DashedLine.tsx, Point.tsx
     │       ├── ForceColors.ts             # 物理力矢量色系常量
     │       └── DynamicForceDiagram.tsx    # 将AI生成的diagramSpec渲染为SVG
     │
     ├── lib/
     │   ├── ai/
     │   │   ├── client.ts                  # DashScope OpenAI兼容客户端
     │   │   ├── callAI.ts                  # 带重试+超时的AI调用
     │   │   └── parseResponse.ts           # 从AI响应提取JSON
     │   ├── prompts/
     │   │   ├── detect.ts                  # 多题目检测prompt
     │   │   ├── analyze.ts                 # 完整解题分析prompt
     │   │   ├── similar.ts                 # 同类题生成prompt
     │   │   ├── learn.ts                   # 交互式学习prompt
     │   │   └── diagram.ts                 # 受力图spec生成prompt
     │   ├── types/
     │   │   ├── analysis.ts / similar.ts / learn.ts / diagram.ts
     │   └── utils/
     │       └── colors.ts                  # 物理颜色调色板

     页面路由与数据流

     [Page 1: /]  用户上传 → /api/detect(多题检测) → ProblemSelector(选题)
                       → /api/analyze(完整分析) → AnalysisCard{特征/思路/答案+SVG}
                       → 存入 sessionStorage(供Page2/3使用)

     [Page 2: /similar]  读取 sessionStorage
                       → /api/similar(生成3道同类题) → SimilarProblemCard×3
                       → /api/search(Firecrawl检索真实考题, 可选)

     [Page 3: /learn]  读取 sessionStorage
                       → /api/learn(action:start) → 首题
                       → 用户回答 → /api/learn(action:answer) → 反馈+下一题
                       → 3题完成 → 学习总结

     跨页面状态：使用 sessionStorage 存储分析结果，URL search params 传递简短参数（知识点列表等）。

     关键API规格

     POST /api/detect

     Request:  { image: base64 }
     Response: { count: N, problems: [{index, description, confidence}] }
     用 qwen-vl-max 识别图片中多道独立题目。count=1 或文本输入时跳过选题器。

     POST /api/analyze

     Request:  { type: 'image'|'text', content, problemIndex? }
     Response: {
       characteristic: { scenarioAndProcess, modelAndConditions }
       approach: { readingAndModeling, physicsConcepts, generalSteps[] }
       solution: {
         step1: { description, diagramSpec }
         step2: { description, equations[] }
         step3: { description, finalAnswer }
       }
       coreKnowledgePoints: string[]
     }

     POST /api/similar

     Request:  { knowledgePoints[], originalProblem }
     Response: { knowledgeSummary, similarProblems[{problem, briefAnswer, difficulty, keyHint}] }

     POST /api/learn

     Request:  { action: 'start'|'answer', context, userAnswer?, questionIndex? }
     Response: { type: 'question'|'feedback'|'complete', content, correctAnswer?, isCorrect?, progress? }

     动态受力图生成（核心技术难点）

     采用 diagramSpec JSON → 组件渲染 方案：

     AI 返回结构化的 diagramSpec（对象列表 + 力矢量列表），DynamicForceDiagram 组件将其映射到 SVG 原语组件。

     // diagramSpec 示例
     {
       type: "forceDiagram",
       viewBox: { width: 680, height: 440 },
       objects: [
         { type: "ground", x1: 60, x2: 580, y: 380 },
         { type: "slope_surface", x1: 165, y1: 350, angle: 30, length: 320 },
         { type: "block", cx: 340, cy: 260, w: 64, h: 36, angle: 30, label: "M" }
       ],
       forces: [
         { from: "block_center", direction: "down", label: "mg", color: "gravity" },
         { from: "block_center", angle: 120, label: "N", color: "normal" },
         { from: "block_center", direction: "up_slope", label: "f", color: "friction" }
       ],
       angle_marks: [{ cx: 165, cy: 350, startAngle: 0, endAngle: -30, label: "θ" }]
     }

     备选方案：如果 spec 解析失败，回退到显示文字版受力描述。

     实现步骤（17步）

     ┌─────┬─────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
     │  #  │              任务               │                            关键产出                             │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 1   │ 项目脚手架                      │ package.json, configs, .env.local                               │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 2   │ 全局样式+布局                   │ globals.css, layout.tsx, NavTabs                                │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 3   │ 共享组件                        │ ImageUpload, TextInput, LoadingSpinner, FormulaBlock, ErrorCard │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 4   │ SVG原语迁移                     │ 从physics-diagram复制12个原语，适配新颜色常量                   │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 5   │ AI客户端+工具                   │ client.ts, callAI.ts, parseResponse.ts, types                   │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 6   │ Prompt: detect + analyze        │ 多题检测和完整解题分析的System Prompt                           │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 7   │ API: /api/detect + /api/analyze │ 核心分析API                                                     │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 8   │ Page 1 组件                     │ InputArea, ProblemSelector, AnalysisCard, 三个Section           │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 9   │ 动态受力图                      │ DynamicForceDiagram, diagram.ts prompt, diagram types           │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 10  │ Page 1 集成                     │ app/page.tsx 完整流程                                           │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 11  │ Prompt: similar                 │ 同类题生成System Prompt                                         │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 12  │ API: /api/similar + /api/search │ 同类题和Firecrawl API                                           │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 13  │ Page 2 组件+集成                │ SimilarProblemCard, FirecrawlResults, app/similar/page.tsx      │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 14  │ Prompt: learn                   │ 交互式学习System Prompt (教师角色)                              │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 15  │ API: /api/learn                 │ 交互式问答API                                                   │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 16  │ Page 3 组件+集成                │ ChatBubble, ChatInput, ProgressIndicator, app/learn/page.tsx    │
     ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 17  │ 端到端测试+打磨                 │ 跨页面状态、移动端适配、错误兜底                                │
     └─────┴─────────────────────────────────┴─────────────────────────────────────────────────────────────────┘

     验证方式

     1. Page 1：上传一张典型斜面受力题图片，验证多题检测→选题→分析→受力图渲染→LaTeX公式完整流程
     2. Page 2：从Page 1跳转，验证同类题生成结果（3道题，考点一致，场景不同）
     3. Page 3：从Page 2跳转，验证问答交互（答对鼓励、答错提示、三轮渐进揭示答案）
     4. 跨页面：验证 sessionStorage 数据传递、URL参数传递
     5. 移动端：Chrome DevTools 模拟手机，验证卡片布局、≥16px字体、≥1rem内边距
     6. 错误处理：断网、API超时、AI返回无效JSON、Firecrawl不可用等情况