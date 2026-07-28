import { useEffect, useMemo, useRef, useState } from "react";
import { ChatQuestDemo, QuestDashboard, QuestShell } from "./components/index.ts";
import { scoreExamAnswer, selectQuestView } from "./core/index.ts";
import { QuestStore } from "./state/index.ts";
import type { CampaignId, GameState, LevelId } from "./types/index.ts";

const store = new QuestStore();

function download(record: { content: string | null; filename: string | null; media_type: string }): boolean {
  if (!record.content || !record.filename) return false;
  const href = URL.createObjectURL(new Blob([record.content], { type: record.media_type }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = record.filename;
  anchor.click();
  URL.revokeObjectURL(href);
  return true;
}

function FullDashboardApp() {
  const [state, setState] = useState<GameState>(() => store.getState());
  const [notice, setNotice] = useState("准备把真实科研需求编译成执行 Goal。");
  const startedAt = useRef<number | null>(null);
  const view = useMemo(() => selectQuestView(state), [state]);

  useEffect(() => store.subscribe(setState), []);

  useEffect(() => {
    if (state.auto_demo.status !== "playing") return;
    if (startedAt.current === null) startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - (startedAt.current ?? Date.now())) / 1000;
      void store.tickAutoDemo(elapsed).catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "自动演示未能继续。");
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [state.auto_demo.status]);

  useEffect(() => {
    if (state.auto_demo.status === "completed") {
      startedAt.current = null;
      setNotice("约 75 秒自动演示已完成；它展示真实需求如何变成试点 Goal，但不计入用户正式理解分。");
    }
  }, [state.auto_demo.status]);

  const run = (action: () => void, success: string) => {
    try {
      action();
      setNotice(success);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法处理当前操作。");
    }
  };

  const beginAutoDemo = () => {
    startedAt.current = Date.now();
    run(
      () => { store.startAutoDemo(); },
      "自动演示运行中：会展示 AlphaFold2 活性位点试点如何经过双战役、考试和 Goal 导出；不会计入用户正式理解分。",
    );
  };

  const exportState = async () => {
    try {
      const result = await store.exportState();
      if (download(result.record)) store.markDownloaded("state");
      setNotice("已通过浏览器本地 Blob 生成 game-state JSON 下载；不会上传或发送到网络。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "状态导出失败。");
    }
  };

  const exportGoal = async () => {
    try {
      const result = await store.exportGoal();
      if (download(result.record)) store.markDownloaded("goal");
      setNotice("已通过浏览器本地 Blob 生成 AlphaFold2 活性位点试点 Goal；不会上传或发送到网络。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Goal 导出尚不可用。");
    }
  };

  return (
    <QuestShell>
      <nav className="rq-product-nav" aria-label="完整 Dashboard 导航">
        <a href="./">返回聊天式 Demo</a>
        <a href="https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.1.0">安装 Skill</a>
        <a href="./case-study-alphafold-casp14.html">案例博文</a>
      </nav>
      <p className="rq-live-status" role="status">{notice}</p>
      <QuestDashboard
        state={state}
        view={view}
        onAnswerPrologue={(choiceId) => run(
          () => store.dispatch({ type: "ANSWER_PROLOGUE", choiceId }),
          "真实科研问题已记录，第一条战役已解锁。",
        )}
        onChooseLevel={(campaignId: CampaignId, levelId: LevelId, choiceId) => run(
          () => store.dispatch({ type: "SELECT_LEVEL_CHOICE", campaignId, levelId, choiceId }),
          "关卡选择已记录；试点 Goal、认知地图和下一步已同步更新。",
        )}
        onSubmitLevelQuiz={(campaignId, levelId, accuracy) => run(
          () => {
            const before = store.getState();
            const campaign = campaignId === "learning-cognition"
              ? before.campaigns.learning_cognition
              : before.campaigns.research_decision;
            const knowledgeId = campaign.levels.find((item) => item.level_id === levelId)
              ?.cognition_map_delta.candidate_added[0];
            store.dispatch({ type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy });
            if (accuracy >= 0.8 && knowledgeId) {
              let current = store.getState();
              if (current.known_knowns.candidate.some((item) => item.knowledge_id === knowledgeId)) {
                store.dispatch({
                  type: "CONFIRM_KNOWLEDGE",
                  knowledgeId,
                  evidenceType: "user-confirmation",
                  sourceRef: "public-demo:choice-and-quiz",
                  score: 100,
                });
              }
              current = store.getState();
              if (current.known_knowns.confirmed.some((item) => item.knowledge_id === knowledgeId)) {
                store.dispatch({
                  type: "VERIFY_KNOWLEDGE",
                  knowledgeId,
                  evidenceType: "level-quiz",
                  sourceRef: "public-demo:auto-level-quiz",
                  score: 100,
                });
              }
            }
          },
          accuracy >= 0.8
            ? "关卡小测已通过；系统已自动记录 Confirmed / Verified 证据并解锁下一关。"
            : "本关小测未通过；回答不会进入后续 Goal，请查看知识卡后重试。",
        )}
        onConfirmKnowledge={(knowledgeId) => run(
          () => store.dispatch({ type: "CONFIRM_KNOWLEDGE", knowledgeId }),
          "知识已从 Candidate 确认到 Confirmed。",
        )}
        onVerifyKnowledge={(knowledgeId) => run(
          () => store.dispatch({ type: "VERIFY_KNOWLEDGE", knowledgeId, evidenceType: "level-quiz" }),
          "知识已验证，已计入正式理解指标。",
        )}
        onStartExam={() => run(
          () => store.dispatch({ type: "START_EXAM" }),
          "真实科研任务最终考试已开始。",
        )}
        onAnswerExam={(questionId, answer) => {
          const result = scoreExamAnswer(questionId, answer);
          run(
            () => store.dispatch({ type: "ANSWER_EXAM", questionId, answer, ...result }),
            result.isCorrect
              ? "研究判断符合公开演示 rubric，已保存。"
              : "回答已保存，但尚未命中本题公开演示 rubric。",
          );
        }}
        onSubmitExam={() => run(
          () => store.dispatch({ type: "SUBMIT_EXAM" }),
          "最终考试已提交。",
        )}
        onForgeGoal={() => run(
          () => store.dispatch({ type: "FORGE_GOAL" }),
          "AlphaFold2 酶活性位点公开试点 Codex Goal 已锻造完成。",
        )}
        onStartAutoDemo={beginAutoDemo}
        onRestart={() => run(
          () => { startedAt.current = null; store.restart(); },
          "已重启真实科研任务互动流程。",
        )}
        onExportState={() => { void exportState(); }}
        onExportGoal={() => { void exportGoal(); }}
      />
    </QuestShell>
  );
}

export default function App() {
  const view = new URLSearchParams(window.location.search).get("view");
  return view === "full" ? <FullDashboardApp /> : <ChatQuestDemo />;
}
