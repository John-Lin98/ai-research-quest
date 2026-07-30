import { useMemo, useState } from "react";

const SKILL_URL = "https://github.com/John-Lin98/ai-research-quest/releases/latest";
const CASE_URL = "./case-study-alphafold-casp14.html";
const VIDEO_URL = "./research-quest-demo-75s.webm";
const FULL_DEMO_URL = "./?view=full";
const CONTEXT_FILENAME = "research-quest-context.md";

const ADD_CONTEXT_LABEL = "我想补充上下文或任务线索";
const ASK_CLUE_LABEL = "暂不闯关，我还有一些问题";

type Mode = "case" | "custom";

type QuadrantSnapshot = {
  knownKnowns: string;
  unknownKnowns: string;
  knownUnknowns: string;
  unknownUnknowns: string;
};

type Choice = {
  label: string;
  impact: string;
};

type QuestionClue = {
  userQuestion: string;
  answer: string;
  rationale: string;
  savedPath: string;
  revisedQuestion: string;
  updatedSnapshot: QuadrantSnapshot;
};

type TaskClue = {
  userClue: string;
  clueType: string;
  evidenceStatus: "Candidate" | "Confirmed";
  interpretation: string;
  rationale: string;
  savedPath: string;
  revisedQuestion: string;
  updatedSnapshot: QuadrantSnapshot;
};

type Turn = {
  round: number;
  title: string;
  message: string;
  adaptive: string;
  progress: number;
  score: number;
  remaining: string;
  goalVersion: string;
  goalChange: string;
  snapshot: QuadrantSnapshot;
  question?: string;
  options?: Choice[];
  questionClue?: QuestionClue;
  taskClue?: TaskClue;
  finalContext?: string;
  finalGoal?: string;
};

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyText(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
  } catch {
    // Fall through to a local textarea fallback.
  }
  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function compact(value: string, fallback: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

function contextSaved(choice: string, next: string) {
  return `你刚才选择了“${choice}”。这项决定已写入当前会话 Context，导出时会保存为 ${CONTEXT_FILENAME}。${next}`;
}

function buildQuestionClues(
  purpose: string,
  materials: string,
  boundary: string,
): Record<number, QuestionClue> {
  return {
    1: {
      userQuestion: "为什么不能直接让 Codex 自己判断我到底想做什么？",
      answer: "Codex 可以选择技术实现，但无法替你决定真正想支持的是局部结构初筛、分子对接，还是催化机制分析。这三种目标需要不同资料、指标和结果范围。先把目标说清楚，能避免 Codex 做出看似完整、实际上回答错问题的方案。",
      rationale: "你的追问暴露了一个新的已知的未知：为什么执行前必须先对齐目标。主任务暂不推进，先回答这个问题，再把 grill-me 问题改得更贴近真实决策。",
      savedPath: `${CONTEXT_FILENAME} → 第 1 回合 / 关卡线索`,
      revisedQuestion: "为了让 Codex 不走错方向，你最希望它先帮助你作出哪一种实际判断？",
      updatedSnapshot: {
        knownKnowns: "已经知道研究对象，也理解模糊目标会让 Codex 走向不同执行路线。",
        unknownKnowns: "你已经重视执行效率和目标准确性，这一偏好刚刚被明确表达。",
        knownUnknowns: "还需要确定首轮到底支持局部初筛、对接筛选还是机制分析。",
        unknownUnknowns: "同一句需求可能对应完全不同的完成标准和证据要求。",
      },
    },
    2: {
      userQuestion: "为什么需要同时准备预测结构、实验结构和催化残基注释？",
      answer: "预测结构是要检查的对象，实验结构是比较参考，催化残基注释告诉我们应该重点看蛋白的哪个局部区域。缺少其中任何一项，首轮任务都会变化：没有实验结构就无法直接比较，没有催化残基注释就无法稳定定义活性位点。",
      rationale: "你的问题把‘手里有什么资料’从清单问题变成了资料用途问题。认知地图因此新增了一条已知的已知，并把下一问改成更容易判断的真实资料状态。",
      savedPath: `${CONTEXT_FILENAME} → 第 2 回合 / 关卡线索`,
      revisedQuestion: "明白三类资料各自的作用后，下面哪一项最接近你现在的真实情况？",
      updatedSnapshot: {
        knownKnowns: `已确定首轮目标：${purpose}；也知道预测结构、实验结构和催化残基注释分别用来做什么。`,
        unknownKnowns: "你可能已经用过其中一类资料，只是还没有说明具体经验。",
        knownUnknowns: "还需要确认三类资料是否齐全，以及缺少哪一项。",
        unknownUnknowns: "即使资料齐全，链和残基编号也可能无法直接对应。",
      },
    },
    3: {
      userQuestion: "这里说的‘结果最多能说明什么’到底是什么意思？",
      answer: "它是在提醒我们区分‘计算结果看到什么’和‘最终能下什么结论’。局部结构比较可以说明活性位点附近是否相似、哪里容易失败；但仅凭这些结果，不能直接证明酶真的有催化活性、能结合某个底物，或适合药物发现。",
      rationale: "这个问题关闭了一个基础概念空缺。下一道 grill-me 问题不再使用‘证据边界’这种抽象说法，而是直接问你愿意把结论写到哪一步。",
      savedPath: `${CONTEXT_FILENAME} → 第 3 回合 / 关卡线索`,
      revisedQuestion: "按照上面的区别，首轮结果最稳妥地可以写到哪一步？",
      updatedSnapshot: {
        knownKnowns: `目标：${purpose}；现有资料：${materials}；已经区分“看到结构差异”和“证明真实功能”。`,
        unknownKnowns: "你可能已有局部区域、阈值或失败案例的判断经验。",
        knownUnknowns: "还需要选择首轮结论写到局部初筛、加入对接，还是暂不形成正式结论。",
        unknownUnknowns: "高置信度或高相似度仍可能被误读成功能正确。",
      },
    },
    4: {
      userQuestion: "为什么要先规定 10 个目标和至少 8 个有效结果？",
      answer: "这不是在预设研究一定成功，而是在给 Codex 一个清楚的结束条件。10 个目标让首轮试点规模可控；至少 8 个有效结果用于避免只展示少数成功案例。如果达不到，就应报告失败原因，而不是无限扩张任务或只挑好看的结果。",
      rationale: "你的追问说明你正在检查完成标准是否合理。认知地图新增了对覆盖率和选择偏差的理解，下一问改为直接比较三种完成方式。",
      savedPath: `${CONTEXT_FILENAME} → 第 4 回合 / 关卡线索`,
      revisedQuestion: "为了让首轮任务既可完成又不会只挑成功案例，你更愿意采用哪一种完成标准？",
      updatedSnapshot: {
        knownKnowns: "目标、资料和结果范围已确认；也理解样本数和有效结果数是任务结束与覆盖率规则。",
        unknownKnowns: "你更偏好小规模快速验证，还是更大规模分层分析，仍可继续表达。",
        knownUnknowns: "还需要在小规模试点、较大分层分析和纯流程测试之间作出选择。",
        unknownUnknowns: "只报告成功样本会产生选择偏差，失败样本也必须被记录。",
      },
    },
  };
}

function buildTaskClues(
  purpose: string,
  materials: string,
  boundary: string,
): Record<number, TaskClue> {
  return {
    1: {
      userClue: "补充一个任务线索：最终需要把任务交给 Codex 执行，我最担心它理解错目标。",
      clueType: "目标与用户偏好",
      evidenceStatus: "Confirmed",
      interpretation: "这是用户对自己交付方式和风险偏好的直接说明，可以确认：最终产物必须包含清楚的 Context 与 Codex Goal，且目标对齐优先于立即执行。",
      rationale: "这条线索补充了一个未知的已知：你更关心 Codex 是否准确理解目标。它强化了当前目标问题，但没有替你选择具体下游用途，因此主问题会缩小后重新出现。",
      savedPath: `${CONTEXT_FILENAME} → 第 1 回合 / 上下文与任务线索`,
      revisedQuestion: "已确认最终要交给 Codex 执行。为了让它不误解，你最希望先冻结哪一种具体判断？",
      updatedSnapshot: {
        knownKnowns: "已经知道研究对象，并确认最终要生成可交给 Codex 的 Context 与 Goal。",
        unknownKnowns: "你把‘避免 Codex 误解目标’放在首位，这一偏好已被表达。",
        knownUnknowns: "仍需确定 Codex 首轮到底要支持哪一种下游判断。",
        unknownUnknowns: "不同下游目标会改变资料、指标和完成标准。",
      },
    },
    2: {
      userClue: "补充一份资料线索：我还有一份活性位点注释表，但字段和残基编号还没有核对。",
      clueType: "资料与待核对事实",
      evidenceStatus: "Candidate",
      interpretation: "已记录存在一份注释表，但在读取文件、核对字段和编号之前，不能把它当成可直接使用的资料。Codex Goal 应加入注释表审查与编号核对步骤。",
      rationale: "这条线索新增了一项 Candidate 资料，并暴露了编号对齐风险。原来的资料问题已被部分回答，下一问会直接确认其他两类资料是否齐全。",
      savedPath: `${CONTEXT_FILENAME} → 第 2 回合 / 上下文与任务线索`,
      revisedQuestion: "活性位点注释表已记为待核对资料。预测结构和对应实验 PDB 目前是什么情况？",
      updatedSnapshot: {
        knownKnowns: `已确定首轮目标：${purpose}。`,
        unknownKnowns: "你已经主动整理过活性位点资料，可能熟悉注释来源和字段。",
        knownUnknowns: "注释表字段与残基编号仍需核对；还需确认预测结构和实验 PDB 是否齐全。",
        unknownUnknowns: "注释编号、PDB 编号和预测序列编号可能采用不同体系。",
      },
    },
    3: {
      userClue: "补充一个约束：首轮只能使用公开资料，不使用内部数据或未公开结果。",
      clueType: "公开范围与硬约束",
      evidenceStatus: "Confirmed",
      interpretation: "这是用户对任务范围的明确约束，可以直接确认并写入 Goal：所有数据、来源和结果必须可公开追溯，内部资料不得进入首轮试点。",
      rationale: "这条线索关闭了数据公开范围问题，并缩小了可能的结论。下一问只需确定公开计算结果最终可以写到什么程度。",
      savedPath: `${CONTEXT_FILENAME} → 第 3 回合 / 上下文与任务线索`,
      revisedQuestion: "已确认首轮只使用公开资料。在这个前提下，结果最多应该说明到哪一步？",
      updatedSnapshot: {
        knownKnowns: `目标：${purpose}；现有资料：${materials}；公开资料限定已确认。`,
        unknownKnowns: "你优先考虑可公开复现和安全发布，这一偏好已明确。",
        knownUnknowns: "仍需确认局部结构比较结果能支持和不能支持什么。",
        unknownUnknowns: "公开资料之间仍可能存在注释版本和映射差异。",
      },
    },
    4: {
      userClue: "补充一个时间线索：首轮希望一天内完成，优先验证流程，不追求一次覆盖所有酶家族。",
      clueType: "时间限制与执行偏好",
      evidenceStatus: "Confirmed",
      interpretation: "已确认首轮是一天内完成的小规模流程验证。Goal 应优先选择可追溯的小样本，并把扩展到更多家族留到后续版本。",
      rationale: "这条线索暴露了你偏好快速小步验证。大规模分层方案不再是首轮最高价值选择，下一问会聚焦小规模完成标准。",
      savedPath: `${CONTEXT_FILENAME} → 第 4 回合 / 上下文与任务线索`,
      revisedQuestion: "已确认一天内优先验证流程。下面哪个小规模完成标准最合适？",
      updatedSnapshot: {
        knownKnowns: `目标、资料、结果范围和一天内完成的时间限制已确认；当前结果范围：${boundary}。`,
        unknownKnowns: "你偏好先跑通流程、再逐步扩展，这一执行偏好已表达。",
        knownUnknowns: "还需在 10 个目标的可复核试点和纯最小测试之间选择。",
        unknownUnknowns: "时间限制可能让资料核对失败成为首轮主要风险。",
      },
    },
  };
}

function buildCaseTurns(
  answers: string[],
  openedQuestionClues: number[],
  openedTaskClues: number[],
): Turn[] {
  const purpose = answers[0] ?? "还没有确定最先要支持的判断";
  const materials = answers[1] ?? "还没有说明手里有哪些资料";
  const boundary = answers[2] ?? "还没有确定结果最多能说明什么";
  const acceptance = answers[3] ?? "还没有约定做到什么才算完成";
  const questionClues = buildQuestionClues(purpose, materials, boundary);
  const taskClues = buildTaskClues(purpose, materials, boundary);

  const questionClueLog = openedQuestionClues.length
    ? openedQuestionClues.map((round) => {
        const clue = questionClues[round];
        return clue
          ? `### 第 ${round} 回合关卡线索\n- 用户问题：${clue.userQuestion}\n- AI 回答：${clue.answer}\n- 保存位置：${clue.savedPath}`
          : "";
      }).filter(Boolean).join("\n\n")
    : "本次没有打开额外关卡线索。";

  const taskClueLog = openedTaskClues.length
    ? openedTaskClues.map((round) => {
        const clue = taskClues[round];
        return clue
          ? `### 第 ${round} 回合上下文与任务线索\n- 用户补充：${clue.userClue}\n- 类型：${clue.clueType}\n- 证据状态：${clue.evidenceStatus}\n- AI 整理：${clue.interpretation}\n- 保存位置：${clue.savedPath}`
          : "";
      }).filter(Boolean).join("\n\n")
    : "本次没有主动追加上下文或任务线索。";

  const finalContext = `# Research Quest Frozen Context｜AlphaFold2 活性位点试点

## 原始需求
用户希望判断 AlphaFold2 / AlphaFold DB 预测能否用于酶活性位点分析。

## 本轮读取和使用的资料
- AlphaFold2 与 CASP14 的公开背景；
- AlphaFold DB 预测结构；
- 可匹配的实验 PDB 结构；
- 可公开追溯的催化残基注释；
- 本次聊天中的用户选择、问题与主动补充线索。

## 已确认决定
- 最先支持的判断：${purpose}
- 手里已有的资料：${materials}
- 结果最多能说明：${boundary}
- 做到什么算完成：${acceptance}

## Known–Unknown 四象限认知地图
### Known Knowns｜已知的已知
- 用户已经明确研究对象、目标用途、现有资料、结果范围和完成标准；
- 用户对自己的目标、偏好、约束与截止时间的明确陈述可以直接记为 Confirmed；
- 外部事实、实验结果与文档内容在核验前只能记为 Candidate。

### Unknown Knowns｜未知的已知
- 用户可能已有结构比较、数据库筛选、阈值选择或失败分析经验，但尚未完整表达；
- 用户主动补充的偏好和取舍规则应保留为后续执行依据。

### Known Unknowns｜已知的未知
- 实际能成功匹配多少目标；
- 局部活性位点误差如何分布；
- 哪些失败来自链、编号、缺失残基或结构状态差异。

### Unknown Unknowns｜未知的未知
- 真实执行中可能出现新的映射冲突、数据偏差或评价盲点；
- 新风险出现时应写回 Context，并重新调整 Goal。

## 用户问题与关卡线索
${questionClueLog}

## 用户主动补充的上下文与任务线索
${taskClueLog}

## Goal 版本记录
- Goal v0.1：确定研究对象，目标用途未定；
- Goal v0.2：确定最先支持的判断；
- Goal v0.3：记录手里已有的资料；
- Goal v0.4：确定结果最多能说明什么；
- Goal v1.0：补齐完成标准并形成执行合同。

## 保存与交接
- 当前网页只保存在页面内存中；
- 用户主动导出后保存为 ${CONTEXT_FILENAME}；
- Codex 开始前必须读取该 Context，不重复询问已经确认的决定。

## 结论范围
不把 pLDDT、结构相似性或局部几何结果直接写成催化活性、底物结合或药物发现结论。`;

  const finalGoal = `# Codex Goal｜AlphaFold2 活性位点公开试点

开始前读取 ${CONTEXT_FILENAME}，并把它作为本任务的需求依据。先使用其中已经确认的决定，不重复询问；只有真实执行暴露新的关键缺口时，才提出一个最高价值问题。

## 目标
围绕“${purpose}”完成一个公开、可追溯的小规模试点。

## 你可以使用的资料
${materials}

## 执行步骤
1. 建立公开目标清单，并记录每个目标为什么被纳入或排除；
2. 匹配 AlphaFold DB 预测、实验 PDB 链和催化残基注释；
3. 分别报告整体结构和活性位点附近的局部误差；
4. 记录成功率、失败原因和无法判断的样本；
5. 只在“${boundary}”范围内写结论；
6. 以“${acceptance}”作为完成标准；
7. 完成测试、独立审查、中文 PR 和安全合并。

## 交互规则
- 先查 Context、文档和代码，再提问；
- 每轮默认只问一个最影响结果的问题，确有必要时最多三个；
- 用户可以随时暂停并提出问题，也可以主动追加上下文、资料、约束、偏好或任务线索；
- 新线索先分类、去重、检查冲突并判断 Candidate / Confirmed，再更新四象限和当前问题；
- 每个新决定、关卡线索和任务线索都写回 Context 与 Goal 版本记录；
- 同一关键问题经过 3–5 轮不同尝试仍失败时，输出根因分析。`;

  return [
    {
      round: 1,
      title: "先说清楚要解决什么",
      message: "我先不把这句需求直接交给 Codex。‘用于活性位点分析’范围太大，先确认你最想支持的判断，后面的资料、指标和结论才不会选错。",
      adaptive: "现有需求只说明了研究对象，还没有说明最先要解决什么。认知地图里最大的空缺是已知的未知，因此本轮只问一个目标问题。",
      progress: 12,
      score: 0,
      remaining: "约 6–9 分钟",
      goalVersion: "Goal v0.1",
      goalChange: "研究对象已明确，但最先要支持的判断还没有定下来。",
      snapshot: {
        knownKnowns: "已经知道研究对象是 AlphaFold2 和酶活性位点。",
        unknownKnowns: "你可能已有结构分析经验，但还没有说出来。",
        knownUnknowns: "还不知道这项工作最先要帮助你作出什么判断。",
        unknownUnknowns: "还没有检查结构编号和构象差异可能带来的问题。",
      },
      question: "你最希望这项工作先帮助你判断什么？",
      options: [
        { label: "先判断活性位点附近的结构是否可靠", impact: "重点比较局部结构和失败样本。" },
        { label: "先筛选哪些结构值得继续做分子对接", impact: "还需要补充配体、口袋和对照设置。" },
        { label: "直接分析催化机制", impact: "需要更强的实验或化学证据，不能只看预测结构。" },
      ],
      questionClue: questionClues[1],
      taskClue: taskClues[1],
    },
    {
      round: 2,
      title: "看看你手里有什么资料",
      message: contextSaved(purpose, "当前目标已经更清楚了；现在只需要确认你手里有哪些资料，避免 Codex 开始后再临时猜数据来源。"),
      adaptive: "上一轮已经确定目标，但已知的已知里还没有可用资料。根据 grill-me-with-docs，本轮先用已有术语确认材料，不引入新的方法名。",
      progress: 34,
      score: 10,
      remaining: "约 5–7 分钟",
      goalVersion: "Goal v0.2",
      goalChange: `当前先支持：${purpose}。`,
      snapshot: {
        knownKnowns: `已经确认最先要支持：${purpose}。`,
        unknownKnowns: "你可能已经用过 AlphaFold DB、PDB 或结构比较工具。",
        knownUnknowns: "还不知道现有资料是否足以完成公开配对分析。",
        unknownUnknowns: "预测结构与实验结构的链和残基编号可能对不上。",
      },
      question: "下面哪一项最接近你现在手里的资料？",
      options: [
        { label: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释", impact: "可以直接设计一个小规模公开试点。" },
        { label: "只有预测结构，实验结构和注释还需要补齐", impact: "先增加资料收集和筛选步骤。" },
        { label: "资料还没有整理，希望 AI 先列出需要准备什么", impact: "先生成资料清单和缺口报告。" },
      ],
      questionClue: questionClues[2],
      taskClue: taskClues[2],
    },
    {
      round: 3,
      title: "确认结果最多能说明什么",
      message: contextSaved(materials, "资料够不够和结论能写多强是两回事；接下来只确认这一步最多能说明什么。"),
      adaptive: "认知地图中的已知的未知已从‘手里有什么’变成‘这些资料最多能说明什么’。因此本轮不继续问技术细节，只关闭结论范围这个关键空缺。",
      progress: 56,
      score: 20,
      remaining: "约 3–5 分钟",
      goalVersion: "Goal v0.3",
      goalChange: "你手里已有的资料和仍需补齐的部分已进入 Context。",
      snapshot: {
        knownKnowns: `目标：${purpose}；现有资料：${materials}。`,
        unknownKnowns: "你可能已有局部区域、阈值或失败分析偏好。",
        knownUnknowns: "还需要明确结构比较结果能支持什么、不能支持什么。",
        unknownUnknowns: "高置信度可能被误读成功能或催化正确。",
      },
      question: "首轮结果最多应该说明到哪一步？",
      options: [
        { label: "只判断局部结构是否适合初步筛选，并报告失败情况", impact: "不把结果扩大解释成催化或结合结论。" },
        { label: "结构比较和分子对接都报告，但分开解释", impact: "需要额外加入配体、基线和对接对照。" },
        { label: "先不下正式结论，完成小试点后再决定", impact: "当前 Goal 保留待确认项，不写成正式结果。" },
      ],
      questionClue: questionClues[3],
      taskClue: taskClues[3],
    },
    {
      round: 4,
      title: "约定做到什么才算完成",
      message: contextSaved(boundary, "目标、资料和结果范围已经说清楚了；最后只差一个简单的完成标准，让 Codex 知道什么时候可以结束任务。"),
      adaptive: "四象限中的基础问题已经基本关闭。当前唯一会直接影响执行范围的已知的未知是完成标准，所以本轮只问验收，不再增加知识负担。",
      progress: 78,
      score: 30,
      remaining: "约 1–3 分钟",
      goalVersion: "Goal v0.4",
      goalChange: `结果范围已确定：${boundary}。`,
      snapshot: {
        knownKnowns: "目标、资料和结果范围已经确认。",
        unknownKnowns: "你可能更偏好先做小规模、能快速复核的试点。",
        knownUnknowns: "还缺少样本数量、成功率和失败退出标准。",
        unknownUnknowns: "只报告成功样本可能造成选择偏差。",
      },
      question: "哪个标准最适合用来判断首轮任务已经完成？",
      options: [
        { label: "检查 10 个公开目标，至少 8 个得到可复核结果", impact: "规模小、结果可追溯，适合首轮验证。" },
        { label: "检查 30 个以上目标，并按酶家族分别统计", impact: "结果更完整，但首轮时间和成本更高。" },
        { label: "先只跑一个最小测试，不设正式成功率", impact: "适合排查流程，但不能当成正式结果。" },
      ],
      questionClue: questionClues[4],
      taskClue: taskClues[4],
    },
    {
      round: 5,
      title: "整理 Context，生成 Codex 目标",
      message: contextSaved(acceptance, "影响首轮执行的关键问题已经有答案，现在可以停止继续追问，把已确认内容整理成 Context 和 Codex Goal。"),
      adaptive: "认知地图中的核心已知的未知已经有关闭条件。剩余问题必须由真实执行回答，因此 grill-me-with-docs 在这里停止提问，转入 Codex 执行。",
      progress: 100,
      score: 50,
      remaining: "已完成",
      goalVersion: "Goal v1.0",
      goalChange: `已确定：${purpose}；${materials}；${boundary}；${acceptance}。`,
      snapshot: {
        knownKnowns: "目标、现有资料、结果范围和完成标准已经确认。",
        unknownKnowns: "执行中仍可从已有讨论提取你的分析经验和偏好。",
        knownUnknowns: "实际匹配成功率、误差分布和失败类型需要通过执行回答。",
        unknownUnknowns: "新出现的编号、缺失残基和构象冲突将写回下一轮。",
      },
      finalContext,
      finalGoal,
    },
  ];
}

function MiniQuadrant({ snapshot, label }: { snapshot: QuadrantSnapshot; label: string }) {
  const items = [
    ["Known Knowns", "已知的已知", "kk", snapshot.knownKnowns],
    ["Unknown Knowns", "未知的已知", "uk", snapshot.unknownKnowns],
    ["Known Unknowns", "已知的未知", "ku", snapshot.knownUnknowns],
    ["Unknown Unknowns", "未知的未知", "uu", snapshot.unknownUnknowns],
  ] as const;
  return (
    <section className="cq-mini-map" aria-label={label}>
      <div className="cq-mini-map__grid">
        {items.map(([english, chinese, key, content]) => (
          <article className={`cq-quadrant cq-quadrant--${key}`} key={english}>
            <strong>{english}</strong><small>{chinese}</small><p>{content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductLinks() {
  return (
    <nav className="cq-product-links" aria-label="Research Quest 产品入口">
      <a href={SKILL_URL}>安装 Skill</a>
      <a href={FULL_DEMO_URL}>完整 Dashboard</a>
      <a href={CASE_URL}>案例博文</a>
      <a href={VIDEO_URL}>完整机制视频</a>
    </nav>
  );
}

function UserMessage({ children, label = "你" }: { children: string; label?: string }) {
  return (
    <article className="cq-user-turn" aria-label={`${label}的消息`}>
      <div className="cq-user-content">
        <small className="cq-user-label">{label}</small>
        <div className="cq-user-bubble"><p>{children}</p></div>
      </div>
      <span className="cq-avatar cq-avatar--user" aria-hidden="true">你</span>
    </article>
  );
}

function ProgressFeedback({ turn, mode = "main" }: { turn: Turn; mode?: "main" | "question" | "task" }) {
  const paused = mode !== "main";
  const goalText = mode === "question"
    ? "暂不冻结新决定；先记录并回答用户问题。"
    : mode === "task"
      ? "新线索已分类并写入 Context；主关卡尚未完成。"
      : turn.goalChange;
  return (
    <div className="cq-feedback" aria-label={paused ? "中断反馈" : "本轮正反馈"}>
      <section className="cq-feedback__progress"><span>{paused ? "主目标进度暂停" : "目标进度"}</span><strong>{turn.progress}%</strong><div className="cq-progress-track" aria-hidden="true"><i style={{ width: `${turn.progress}%` }} /></div></section>
      <span>认知分 <strong>{paused ? `${turn.score}（主分不变）` : turn.score}</strong></span>
      <span>预计剩余 <strong>{turn.remaining}</strong></span>
      <span className="cq-goal-change">当前目标变化 ({turn.goalVersion}) <strong>{goalText}</strong></span>
    </div>
  );
}

function ChoiceList({
  question,
  options,
  onChoose,
  onAddContext,
  onAskQuestion,
}: {
  question: string;
  options: Choice[];
  onChoose?: (choice: Choice) => void;
  onAddContext?: () => void;
  onAskQuestion?: () => void;
}) {
  const [copyFeedback, setCopyFeedback] = useState<{ label: string; text: string } | null>(null);

  const activate = async (label: string, action?: () => void) => {
    if (copyFeedback) return;
    const copied = await copyText(label);
    setCopyFeedback({ label, text: copied ? "已复制" : "已选择" });
    window.setTimeout(() => {
      setCopyFeedback(null);
      window.setTimeout(() => action?.(), 180);
    }, 650);
  };

  const optionButton = (label: string, detail: string, className: string, action?: () => void) => {
    const active = copyFeedback?.label === label;
    return (
      <div className={`cq-option-row ${className}`} key={label}>
        <button
          className={`cq-option-select${active ? " is-copying" : ""}`}
          type="button"
          disabled={Boolean(copyFeedback)}
          onClick={() => void activate(label, action)}
          aria-label={`选择：${label}`}
        >
          <span aria-live="polite">{active ? copyFeedback.text : label}</span>
          <small>{active ? "正在生成你的回复…" : detail}</small>
        </button>
      </div>
    );
  };

  return (
    <section className="cq-question" aria-label="关键提问">
      <strong>{question}</strong>
      <div className="cq-options">
        {options.map((choice) => optionButton(choice.label, choice.impact, "", () => onChoose?.(choice)))}
        {optionButton(ADD_CONTEXT_LABEL, "主动补充资料、约束、偏好、截止时间或纠错；AI 会分类并更新下一问。", "cq-option-row--task", onAddContext)}
        {optionButton(ASK_CLUE_LABEL, "暂停主关卡，先让 AI 回答你的问题；进度不会丢失。", "cq-option-row--clue", onAskQuestion)}
      </div>
    </section>
  );
}

function AssistantTurn({
  turn,
  showQuestion,
  onChoose,
  onAddContext,
  onAskQuestion,
}: {
  turn: Turn;
  showQuestion: boolean;
  onChoose?: (choice: Choice) => void;
  onAddContext?: () => void;
  onAskQuestion?: () => void;
}) {
  return (
    <article className="cq-message cq-message--assistant" aria-label={`Research Quest 第 ${turn.round} 回合`}>
      <header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>第 {turn.round}/5 回合 · {turn.title}</small></div></header>
      <p>{turn.message}</p>
      <aside className="cq-adaptive"><strong>为什么这一步最值得问</strong><p>{turn.adaptive}</p></aside>
      <MiniQuadrant snapshot={turn.snapshot} label={`第 ${turn.round} 回合 Known–Unknown 四象限`} />
      <ProgressFeedback turn={turn} />
      {showQuestion && turn.question && turn.options ? <ChoiceList question={turn.question} options={turn.options} onChoose={onChoose} onAddContext={onAddContext} onAskQuestion={onAskQuestion} /> : null}
      {turn.finalContext && turn.finalGoal ? (
        <section className="cq-frozen" aria-label="Frozen Context 与 Codex Goal">
          <div><strong>完整 Context</strong><pre>{turn.finalContext}</pre><button type="button" onClick={() => downloadText(CONTEXT_FILENAME, turn.finalContext!)}>下载 context.md</button></div>
          <div><strong>Codex Goal</strong><pre>{turn.finalGoal}</pre><button type="button" onClick={() => downloadText("research-quest-codex-goal.md", turn.finalGoal!)}>下载目标提示词</button></div>
          <ProductLinks />
        </section>
      ) : null}
    </article>
  );
}

function QuestionClueTurn({ turn, onChoose, onAddContext, onAskQuestion }: {
  turn: Turn;
  onChoose?: (choice: Choice) => void;
  onAddContext?: () => void;
  onAskQuestion?: () => void;
}) {
  const clue = turn.questionClue;
  if (!clue || !turn.options) return null;
  return (
    <article className="cq-message cq-message--assistant cq-message--clue" aria-label={`第 ${turn.round} 回合关卡线索`}>
      <header><span className="cq-avatar cq-avatar--clue">?</span><div><strong>Research Quest · 关卡线索</strong><small>主关卡暂停，先回答你的问题</small></div></header>
      <aside className="cq-clue-answer"><strong>问题答案</strong><p>{clue.answer}</p></aside>
      <p className="cq-context-save">已保存到：<strong>{clue.savedPath}</strong></p>
      <aside className="cq-adaptive"><strong>这条线索如何改变认知地图</strong><p>{clue.rationale}</p></aside>
      <MiniQuadrant snapshot={clue.updatedSnapshot} label={`第 ${turn.round} 回合关卡线索后的四象限`} />
      <ProgressFeedback turn={turn} mode="question" />
      <ChoiceList question={clue.revisedQuestion} options={turn.options} onChoose={onChoose} onAddContext={onAddContext} onAskQuestion={onAskQuestion} />
    </article>
  );
}

function TaskClueTurn({ turn, onChoose, onAddContext, onAskQuestion }: {
  turn: Turn;
  onChoose?: (choice: Choice) => void;
  onAddContext?: () => void;
  onAskQuestion?: () => void;
}) {
  const clue = turn.taskClue;
  if (!clue || !turn.options) return null;
  return (
    <article className="cq-message cq-message--assistant cq-message--task" aria-label={`第 ${turn.round} 回合上下文与任务线索`}>
      <header><span className="cq-avatar cq-avatar--task">+</span><div><strong>Research Quest · 上下文与任务线索</strong><small>已暂停主问题，先整理你主动补充的信息</small></div></header>
      <aside className="cq-task-summary"><strong>线索分类</strong><p>{clue.clueType} · <b>{clue.evidenceStatus}</b></p><p>{clue.interpretation}</p></aside>
      <p className="cq-context-save">已保存到：<strong>{clue.savedPath}</strong></p>
      <aside className="cq-adaptive"><strong>这条线索如何改变认知地图</strong><p>{clue.rationale}</p></aside>
      <MiniQuadrant snapshot={clue.updatedSnapshot} label={`第 ${turn.round} 回合任务线索后的四象限`} />
      <ProgressFeedback turn={turn} mode="task" />
      <ChoiceList question={clue.revisedQuestion} options={turn.options} onChoose={onChoose} onAddContext={onAddContext} onAskQuestion={onAskQuestion} />
    </article>
  );
}

function FixedCaseChat() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [openedQuestionClues, setOpenedQuestionClues] = useState<number[]>([]);
  const [openedTaskClues, setOpenedTaskClues] = useState<number[]>([]);
  const [copyNotice, setCopyNotice] = useState("");
  const turns = useMemo(
    () => buildCaseTurns(answers, openedQuestionClues, openedTaskClues),
    [answers, openedQuestionClues, openedTaskClues],
  );
  const visibleCount = Math.min(answers.length + 1, turns.length);
  const visibleTurns = turns.slice(0, visibleCount);
  const latest = visibleTurns.at(-1) ?? turns[0];

  const choose = (index: number, choice: Choice) => {
    if (answers.length !== index) return;
    setAnswers((current) => [...current, choice.label]);
  };

  const openQuestionClue = (index: number, turn: Turn) => {
    if (answers.length !== index || !turn.questionClue) return;
    if (openedQuestionClues.includes(turn.round)) {
      setCopyNotice("本轮关卡线索已经展开。你可以继续选择主答案，或继续输入自己的问题。");
      return;
    }
    setOpenedQuestionClues((current) => [...current, turn.round]);
    setCopyNotice(`主关卡已暂停；问题与回答将保存到 ${turn.questionClue.savedPath}。`);
  };

  const openTaskClue = (index: number, turn: Turn) => {
    if (answers.length !== index || !turn.taskClue) return;
    if (openedTaskClues.includes(turn.round)) {
      setCopyNotice("本轮上下文与任务线索已经加入。你可以继续补充真实线索，或返回主问题。");
      return;
    }
    setOpenedTaskClues((current) => [...current, turn.round]);
    setCopyNotice(`已接收主动补充；线索将保存到 ${turn.taskClue.savedPath}。`);
  };

  return (
    <section className="cq-chat-mode" aria-labelledby="fixed-case-title">
      <div className="cq-overview">
        <div><p className="cq-eyebrow">认知地图 + grill-me-with-docs</p><h2 id="fixed-case-title">AlphaFold2 活性位点试点</h2><p>AI 先读已有资料，再根据四象限每轮只问一个最关键问题。用户可以随时提问，也可以主动补充资料、约束、偏好和任务线索。</p></div>
        <MiniQuadrant snapshot={latest.snapshot} label="当前完整 Known–Unknown 四象限" />
      </div>
      <p className="cq-live-note" aria-live="polite">{copyNotice || `当前决定保存在页面内存；导出时写入 ${CONTEXT_FILENAME}。`}</p>
      <div className="cq-thread" aria-label="固定案例聊天记录">
        <UserMessage>我想评估 AlphaFold2 预测能不能用于酶活性位点分析。</UserMessage>
        {visibleTurns.map((turn, index) => {
          const questionOpened = openedQuestionClues.includes(turn.round);
          const taskOpened = openedTaskClues.includes(turn.round);
          const answered = Boolean(answers[index]);
          return (
            <div key={turn.round} className="cq-turn-pair">
              <AssistantTurn
                turn={turn}
                showQuestion={!questionOpened && !taskOpened && !answered}
                onChoose={(choice) => choose(index, choice)}
               
                onAddContext={() => openTaskClue(index, turn)}
                onAskQuestion={() => openQuestionClue(index, turn)}
              />
              {taskOpened && turn.taskClue ? <><UserMessage label="你 · 主动补充">{turn.taskClue.userClue}</UserMessage><TaskClueTurn turn={turn} onChoose={(choice) => choose(index, choice)} onAddContext={() => openTaskClue(index, turn)} onAskQuestion={() => openQuestionClue(index, turn)} /></> : null}
              {questionOpened && turn.questionClue ? <><UserMessage label="你 · 追问">{turn.questionClue.userQuestion}</UserMessage><QuestionClueTurn turn={turn} onChoose={(choice) => choose(index, choice)} onAddContext={() => openTaskClue(index, turn)} onAskQuestion={() => openQuestionClue(index, turn)} /></> : null}
              {answers[index] ? <UserMessage>{answers[index]}</UserMessage> : null}
            </div>
          );
        })}
      </div>
      {answers.length || openedQuestionClues.length || openedTaskClues.length ? <button className="cq-secondary-button" type="button" onClick={() => { setAnswers([]); setOpenedQuestionClues([]); setOpenedTaskClues([]); setCopyNotice(""); }}>重新体验 5 轮案例</button> : null}
    </section>
  );
}

function initialCustomQuadrant(requirement: string, deliverable: string): QuadrantSnapshot {
  return {
    knownKnowns: `你已明确提出：${compact(requirement, "还没有填写需求")}；希望得到：${compact(deliverable, "待确认")}。`,
    unknownKnowns: "你可能已有相关经验、偏好或失败教训，但还没有说出来。",
    knownUnknowns: "数据、评价标准、完成条件和不能做什么仍需继续确认。",
    unknownUnknowns: "隐藏依赖、反例和执行风险需要通过真实对话与工具调用发现。",
  };
}

function CustomRequirementChat() {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [requirement, setRequirement] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [materials, setMaterials] = useState("");
  const [error, setError] = useState("");

  const containsSensitive = (value: string) => /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:sk|ghp|github_pat)[-_A-Za-z0-9]{12,}|[A-Za-z]:\\|\/(?:home|Users|data\d*)\/)/.test(value);

  const context = useMemo(() => {
    const req = compact(requirement, "待补充");
    const output = compact(deliverable, "待通过 Research Quest 对话确认");
    const available = compact(materials, "尚未提供；AI 应先从现有文档和会话中整理，再询问缺口");
    return `# Research Quest Initial Context

## 原始科研需求
${req}

## 最终希望得到
${output}

## 现在手里有什么资料或限制
${available}

## 核心逻辑：认知地图 + grill-me-with-docs
1. 先读取用户提供的文档、历史讨论和已有 Context；
2. 不询问文档中已经能够回答的问题；
3. 从四象限中选出最影响最终结果的一个空缺；
4. 每轮默认只问一个关键问题，确有必要时最多三个；
5. 每个关键问题最后提供“${ADD_CONTEXT_LABEL}”和“${ASK_CLUE_LABEL}”；
6. 用户提问时暂停主关卡，先回答、更新四象限，再重写当前问题；
7. 用户主动补充上下文时，分类、去重、检查冲突、判断 Candidate / Confirmed，再更新 Goal 与问题；
8. 使用用户和文档中已经出现的术语；
9. 每次回答后更新四象限、保存位置和当前目标变化 (Goal vN)。

## 初始 Known–Unknown 四象限
### Known Knowns｜已知的已知
用户已经明确表达需求与期望产物。

### Unknown Knowns｜未知的已知
用户可能已有但尚未表达的经验、偏好和失败教训。

### Known Unknowns｜已知的未知
数据、指标、完成标准、结果范围和执行方式仍需确认。

### Unknown Unknowns｜未知的未知
隐藏依赖、反例和执行风险需由真实对话与工具调用发现。

## 状态
这是网页本地生成的初始草图，尚未经过 AI 访谈、确认或验证。`;
  }, [requirement, deliverable, materials]);

  const prompt = useMemo(() => `请启用 Research Quest Skill，并基于下面的 Initial Context 启动聊天式科研对齐。\n\n${context}\n\n执行要求：\n1. 先读取文档和已有 Context，再展示预计轮次、总时间和最终产物；\n2. 每轮默认只问 1 个最影响目标的问题，确有必要时最多 3 个；\n3. 每个关键问题倒数第二项加入“${ADD_CONTEXT_LABEL}”，最后一项加入“${ASK_CLUE_LABEL}”；\n4. 用户可随时输入任意问题，或主动追加资料、约束、偏好、截止时间、结果和纠错；\n5. 对新增线索先分类、去重、检查冲突并判断 Candidate / Confirmed；\n6. 更新四象限和 Context 后，重新生成当前 grill-me 问题；\n7. 每轮展示完整四象限、认知分、目标进度、预计剩余时间、保存位置和当前目标变化 (Goal vN)；\n8. 只有经过确认或验证的信息才能进入 Frozen Context；\n9. 完成认知对齐后，生成引用 Frozen Context 的完整 Codex Goal。`, [context]);

  const generate = () => {
    const combined = `${requirement}\n${deliverable}\n${materials}`;
    if (requirement.trim().length < 10) {
      setError("请先用至少 10 个字描述真实科研需求。");
      setStage(1);
      return;
    }
    if (containsSensitive(combined)) {
      setError("检测到邮箱、密钥或私人绝对路径。请先脱敏，再生成公开启动材料。");
      return;
    }
    setError("");
    setStage(3);
  };

  const snapshot = initialCustomQuadrant(requirement, deliverable);

  return (
    <section className="cq-custom" aria-labelledby="custom-title">
      <div className="cq-overview">
        <div><p className="cq-eyebrow">输入自己的科研需求</p><h2 id="custom-title">两步生成启动材料</h2><p>网页只做本地整理；真正的文档阅读、自由追问、主动补充上下文、认知地图更新和自适应 grill-me 由安装 Skill 的 ChatGPT / Agent 完成。</p></div>
        <MiniQuadrant snapshot={snapshot} label="自定义需求初始 Known–Unknown 四象限草图" />
      </div>
      <div className="cq-thread">
        <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>自定义启动 · 第 {stage === 1 ? 1 : 2}/2 步</small></div></header><p>{stage === 1 ? "先用一段话告诉我你真正想完成的科研任务。" : "再补充两个最影响 Context 精度的信息。"}</p></article>
        <article className="cq-message cq-message--user cq-form-message">
          {stage === 1 ? <label><span>我的科研需求</span><textarea maxLength={1500} value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="例如：我想设计一个 RNA 二级结构逆折叠实验方案，并找到可复现的近五年 baseline。" /></label> : null}
          {stage >= 2 ? <><label><span>最终希望获得什么产物？</span><input maxLength={300} value={deliverable} onChange={(event) => setDeliverable(event.target.value)} placeholder="例如：实验方案、Codex Goal 和验收标准" /></label><label><span>当前有哪些资料或限制？</span><textarea maxLength={1200} value={materials} onChange={(event) => setMaterials(event.target.value)} placeholder="例如：已有数据、代码仓库、算力、截止时间或不能改变的边界" /></label></> : null}
          {error ? <p className="cq-error" role="alert">{error}</p> : null}
          {stage === 1 ? <button type="button" onClick={() => requirement.trim().length >= 10 ? (setError(""), setStage(2)) : setError("请用至少 10 个字描述真实科研需求。")}>继续补充 Context</button> : null}
          {stage === 2 ? <button type="button" onClick={generate}>生成启动提示词与 context.md</button> : null}
        </article>
        {stage === 3 ? <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>本地准备完成</small></div></header><p>已生成初始 Context 和启动提示词。它们只是进入真实 AI 对话的起点，不是已经验证的科研方案。</p><MiniQuadrant snapshot={snapshot} label="自定义需求完整初始四象限" /><section className="cq-generated"><div><strong>context.md</strong><pre>{context}</pre><button type="button" onClick={() => downloadText("research-quest-initial-context.md", context)}>下载 context.md</button></div><div><strong>Research Quest 启动提示词</strong><pre>{prompt}</pre><button type="button" onClick={() => downloadText("research-quest-start-prompt.md", prompt)}>下载启动提示词</button></div></section><ProductLinks /></article> : null}
      </div>
      {stage > 1 ? <button className="cq-secondary-button" type="button" onClick={() => { setStage(1); setError(""); }}>重新填写</button> : null}
    </section>
  );
}

export function ChatQuestDemo() {
  const [mode, setMode] = useState<Mode>("case");
  return (
    <main className="cq-app">
      <header className="cq-header">
        <div><p className="cq-eyebrow">Research Quest｜AI Research Game</p><h1>把科研聊天变成更精准的任务对齐</h1><p>核心逻辑是 Known–Unknown 四象限 + grill-me-with-docs。用户既可以回答问题，也可以随时追问或主动补充上下文；AI 会把新信息写入 Context、更新认知地图并重新生成下一问。</p></div>
        <ProductLinks />
      </header>
      <section className="cq-mode-switch" aria-label="选择演示模式">
        <button type="button" className={mode === "case" ? "is-active" : ""} onClick={() => setMode("case")}>体验 5 轮真实案例</button>
        <button type="button" className={mode === "custom" ? "is-active" : ""} onClick={() => setMode("custom")}>输入我的科研需求</button>
      </section>
      {mode === "case" ? <FixedCaseChat /> : <CustomRequirementChat />}
      <footer className="cq-footer">
        <p className="cq-interaction-note">交互说明：点击选项会自动复制，并生成一条用户回复；在真实 ChatGPT 中也可以直接输入自己的答案、问题或任务线索。</p>
        <p>页面只在浏览器本地演示交互；请勿输入敏感或未公开资料。<a href={FULL_DEMO_URL}>完整 Dashboard</a>、<a href={CASE_URL}>案例博文</a>、<a href={VIDEO_URL}>原完整机制视频</a>与 <a href={SKILL_URL}>Skill 安装包</a>均继续保留。</p>
      </footer>
    </main>
  );
}
