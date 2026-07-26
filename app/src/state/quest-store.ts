import {
  advanceAutoDemo,
  createInitialGameState,
  exportCodexGoal,
  exportGameState,
  markExportDownloaded,
  restartGame,
  startAutoDemo,
  transition,
} from "../core/index.ts";
import type {
  CreateGameOptions,
  ExportResult,
  TransitionOptions,
} from "../core/index.ts";
import type {
  GameEvent,
  GameState,
  QuestContent,
} from "../types/index.ts";

export type QuestListener = (state: Readonly<GameState>) => void;

export interface QuestStoreOptions extends CreateGameOptions {
  initialState?: GameState;
}

export class QuestStore {
  #state: GameState;
  readonly #content?: QuestContent;
  readonly #listeners = new Set<QuestListener>();

  constructor(options: QuestStoreOptions = {}) {
    this.#content = options.content;
    this.#state =
      options.initialState ?? createInitialGameState(options);
  }

  getState(): GameState {
    return structuredClone(this.#state);
  }

  subscribe(listener: QuestListener): () => void {
    this.#listeners.add(listener);
    listener(this.getState());
    return () => this.#listeners.delete(listener);
  }

  #publish(): GameState {
    const snapshot = this.getState();
    for (const listener of this.#listeners) listener(snapshot);
    return snapshot;
  }

  dispatch(event: GameEvent, options: TransitionOptions = {}): GameState {
    this.#state = transition(this.#state, event, options);
    return this.#publish();
  }

  restart(now?: string | Date): GameState {
    this.#state = restartGame(this.#state, {
      content: this.#content,
      now,
      interactionMode: "interactive",
    });
    return this.#publish();
  }

  startAutoDemo(now?: string | Date): GameState {
    this.#state = startAutoDemo(this.#state, {
      content: this.#content,
      now,
    });
    return this.#publish();
  }

  async tickAutoDemo(
    elapsedSeconds: number,
    now?: string | Date,
  ): Promise<GameState> {
    this.#state = await advanceAutoDemo(this.#state, elapsedSeconds, now);
    return this.#publish();
  }

  async exportState(now?: string | Date): Promise<ExportResult> {
    const result = await exportGameState(this.#state, now);
    this.#state = result.state;
    this.#publish();
    return { state: this.getState(), record: { ...result.record } };
  }

  async exportGoal(now?: string | Date): Promise<ExportResult> {
    const result = await exportCodexGoal(this.#state, now);
    this.#state = result.state;
    this.#publish();
    return { state: this.getState(), record: { ...result.record } };
  }

  markDownloaded(
    kind: "state" | "goal",
    now?: string | Date,
  ): GameState {
    this.#state = markExportDownloaded(this.#state, kind, now);
    return this.#publish();
  }
}
