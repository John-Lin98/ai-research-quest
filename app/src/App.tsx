import { useEffect, useMemo, useRef, useState } from "react";
import { QuestDashboard, QuestShell } from "./components/index.ts";
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

export default function App() {
  const [state, setState] = useState<GameState>(() => store.getState());
  const [notice, setNotice] = useState("准备开始互动演示。");
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
      setNotice("75 秒自动演示已完成；它只展示流程，不计入用户正式理解分。可下载公开安全的状态和 Codex Goal。 ");
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
      "自动演示运行中：会以确定性步骤展示双战役、考试和导出准备；不会计入用户正式理解分。",
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
      setNotice("已通过浏览器本地 Blob 生成 Codex Goal Markdown 下载；不会上传或发送到网络。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Goal 导出尚不可用。");
    }
  };

  return (
    <QuestShell>
      <p className="rq-live-status" role="status">{notice}</p>
      <QuestDashboard
        state={state}
        view={view}
        onAnswerPrologue={(choiceId) => run(
          () => store.dispatch({ type: "ANSWER_PROLOGUE", choiceId }),
          "序章选择已记录。",
        )}
        onChooseLevel={(campaignId: CampaignId, levelId: LevelId, choiceId) => run(
          () => store.dispatch({ type: "SELECT_LEVEL_CHOICE", campaignId, levelId, choiceId }),
          "关卡选择已记录，并已更新受控状态。",
        )}
        onSubmitLevelQuiz={(campaignId, levelId, accuracy) => run(
          () => store.dispatch({ type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy }),
          accuracy >= 0.8 ? "关卡小测已通过，下一关已解锁。" : "本关小测未通过，请查看知识卡后重试。",
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
          "最终考试已开始。",
        )}
        onAnswerExam={(questionId, answer) => {
          const result = scoreExamAnswer(questionId, answer);
          run(
            () => store.dispatch({ type: "ANSWER_EXAM", questionId, answer, ...result }),
            result.isCorrect
              ? "考试回答符合公开演示 rubric，已保存。"
              : "回答已保存，但尚未命中本题公开演示 rubric。",
          );
        }}
        onSubmitExam={() => run(
          () => store.dispatch({ type: "SUBMIT_EXAM" }),
          "最终考试已提交。",
        )}
        onForgeGoal={() => run(
          () => store.dispatch({ type: "FORGE_GOAL" }),
          "Codex Goal 已锻造完成。",
        )}
        onStartAutoDemo={beginAutoDemo}
        onRestart={() => run(
          () => { startedAt.current = null; store.restart(); },
          "已重启为交互模式。",
        )}
        onExportState={() => { void exportState(); }}
        onExportGoal={() => { void exportGoal(); }}
      />
    </QuestShell>
  );
}
