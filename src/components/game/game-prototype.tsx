"use client";

import Image from "next/image";
import { useEffect, useMemo, useReducer, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import {
  backgroundAssetMap,
  deriveOutcome,
  getChoiceBlocksForPhase,
  getChoiceById,
  getGameplayStage,
  openingCutscene,
  patientProfile,
  phaseDefinitions,
  playablePhaseIds,
  playableScenario,
  portraitAssetMap,
  titleScreenCopy,
} from "@/features/game/scenario";
import type {
  BackgroundId,
  Choice,
  CutsceneScene,
  DialogueLine,
  ExpressionId,
  GameState,
  PhaseChoiceBlock,
  PhaseDefinition,
  PhaseId,
  PortraitId,
  PortraitSide,
  PortraitState,
  RevealedTextState,
  ScoreState,
  ScreenId,
  ScenarioSummary,
  SelectionCategory,
} from "@/features/game/types";

type Action =
  | { type: "start-game" }
  | { type: "select-scenario"; scenarioId: string }
  | { type: "tick-text"; total: number }
  | { type: "reveal-dialogue-all"; total: number }
  | { type: "advance-dialogue" }
  | { type: "toggle-choice"; choice: Choice; limit: number }
  | { type: "advance-phase" }
  | { type: "toggle-memo"; open?: boolean }
  | { type: "replay" }
  | { type: "reset" };

type CommandEntry =
  | { type: "choice"; choice: Choice }
  | { type: "next"; disabled: boolean };

const initialScores = deriveOutcome([]).scores;

const initialRevealState: RevealedTextState = {
  visibleCount: 0,
  isComplete: false,
};

const initialState: GameState = {
  currentScreen: "title",
  currentPhase: null,
  cutsceneSceneIndex: 0,
  dialogueIndex: 0,
  selectedScenarioId: null,
  selectedIds: [],
  discoveredInfo: [],
  scores: initialScores,
  memoOpen: false,
  revealedTextState: initialRevealState,
};

function screenToPhase(screen: ScreenId): PhaseId | null {
  if (
    screen === "interview" ||
    screen === "hypothesis" ||
    screen === "evaluation" ||
    screen === "treatment" ||
    screen === "result"
  ) {
    return screen;
  }

  return null;
}

function getTextLength(text: string) {
  return Array.from(text).length;
}

function sliceText(text: string, visibleCount: number) {
  return Array.from(text).slice(0, visibleCount).join("");
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start-game":
      return {
        ...state,
        currentScreen: "scenario-select",
        currentPhase: null,
        memoOpen: false,
      };
    case "select-scenario":
      return {
        ...state,
        currentScreen: "opening-cutscene",
        currentPhase: null,
        cutsceneSceneIndex: 0,
        dialogueIndex: 0,
        selectedScenarioId: action.scenarioId,
        selectedIds: [],
        discoveredInfo: [],
        scores: initialScores,
        memoOpen: false,
        revealedTextState: initialRevealState,
      };
    case "tick-text": {
      if (state.currentScreen !== "opening-cutscene") {
        return state;
      }

      if (state.revealedTextState.isComplete) {
        return state;
      }

      const nextVisibleCount = Math.min(
        action.total,
        state.revealedTextState.visibleCount + 2,
      );

      return {
        ...state,
        revealedTextState: {
          visibleCount: nextVisibleCount,
          isComplete: nextVisibleCount >= action.total,
        },
      };
    }
    case "reveal-dialogue-all":
      return {
        ...state,
        revealedTextState: {
          visibleCount: action.total,
          isComplete: true,
        },
      };
    case "advance-dialogue": {
      if (state.currentScreen !== "opening-cutscene") {
        return state;
      }

      const currentScene = openingCutscene[state.cutsceneSceneIndex];
      const hasNextLine = state.dialogueIndex < currentScene.lines.length - 1;

      if (hasNextLine) {
        return {
          ...state,
          dialogueIndex: state.dialogueIndex + 1,
          revealedTextState: initialRevealState,
        };
      }

      const hasNextScene = state.cutsceneSceneIndex < openingCutscene.length - 1;

      if (hasNextScene) {
        return {
          ...state,
          cutsceneSceneIndex: state.cutsceneSceneIndex + 1,
          dialogueIndex: 0,
          revealedTextState: initialRevealState,
        };
      }

      return {
        ...state,
        currentScreen: "interview",
        currentPhase: "interview",
        cutsceneSceneIndex: 0,
        dialogueIndex: 0,
        revealedTextState: initialRevealState,
      };
    }
    case "toggle-choice": {
      const { choice, limit } = action;
      const existingChoice = getChoiceById(choice.id);

      if (!existingChoice) {
        return state;
      }

      const categorySelections = state.selectedIds.filter(
        (id) => getChoiceById(id)?.category === choice.category,
      );
      const isSelected = categorySelections.includes(choice.id);

      if (isSelected) {
        const nextSelectedIds = state.selectedIds.filter((id) => id !== choice.id);
        const nextDiscoveredInfo = choice.infoGain
          ? state.discoveredInfo.filter((info) => info !== choice.infoGain)
          : state.discoveredInfo;

        return {
          ...state,
          selectedIds: nextSelectedIds,
          discoveredInfo: nextDiscoveredInfo,
          scores: deriveOutcome(nextSelectedIds).scores,
        };
      }

      if (categorySelections.length >= limit) {
        return state;
      }

      const nextSelectedIds = [...state.selectedIds, choice.id];
      const nextDiscoveredInfo = choice.infoGain
        ? [...state.discoveredInfo, choice.infoGain]
        : state.discoveredInfo;

      return {
        ...state,
        selectedIds: nextSelectedIds,
        discoveredInfo: nextDiscoveredInfo,
        scores: deriveOutcome(nextSelectedIds).scores,
      };
    }
    case "advance-phase": {
      if (!state.currentPhase || state.currentPhase === "result") {
        return state;
      }

      const currentIndex = playablePhaseIds.indexOf(state.currentPhase);
      const nextPhase = playablePhaseIds[currentIndex + 1];

      if (!nextPhase) {
        return state;
      }

      return {
        ...state,
        currentScreen: nextPhase,
        currentPhase: nextPhase,
        memoOpen: false,
      };
    }
    case "toggle-memo":
      return {
        ...state,
        memoOpen: action.open ?? !state.memoOpen,
      };
    case "replay":
      return {
        ...state,
        currentScreen: "interview",
        currentPhase: "interview",
        selectedIds: [],
        discoveredInfo: [],
        scores: initialScores,
        memoOpen: false,
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

function getCategoryCount(selectedIds: string[], category: SelectionCategory) {
  return selectedIds.filter((id) => getChoiceById(id)?.category === category).length;
}

function getBlockSelections(selectedIds: string[], block: PhaseChoiceBlock) {
  return selectedIds
    .map((id) => getChoiceById(id))
    .filter((choice): choice is Choice => !!choice && choice.category === block.category);
}

export function GamePrototype() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [commandIndex, setCommandIndex] = useState(0);

  const currentPhase = useMemo(
    () =>
      state.currentPhase
        ? phaseDefinitions.find((phase) => phase.id === state.currentPhase) ?? null
        : null,
    [state.currentPhase],
  );

  const phaseBlocks = useMemo(
    () => (state.currentPhase ? getChoiceBlocksForPhase(state.currentPhase) : []),
    [state.currentPhase],
  );

  const activeBlock = useMemo(() => {
    if (phaseBlocks.length === 0) {
      return null;
    }

    return (
      phaseBlocks.find(
        (block) => getCategoryCount(state.selectedIds, block.category) < block.limit,
      ) ?? phaseBlocks[phaseBlocks.length - 1]
    );
  }, [phaseBlocks, state.selectedIds]);

  const canAdvance = useMemo(() => {
    if (!currentPhase || currentPhase.id === "result") {
      return false;
    }

    return phaseBlocks.every(
      (block) => getCategoryCount(state.selectedIds, block.category) === block.limit,
    );
  }, [currentPhase, phaseBlocks, state.selectedIds]);

  const currentCutscene = useMemo(
    () =>
      state.currentScreen === "opening-cutscene"
        ? openingCutscene[state.cutsceneSceneIndex]
        : null,
    [state.currentScreen, state.cutsceneSceneIndex],
  );

  const currentDialogueLine = useMemo(
    () =>
      currentCutscene ? currentCutscene.lines[state.dialogueIndex] ?? null : null,
    [currentCutscene, state.dialogueIndex],
  );

  const revealedDialogueText = useMemo(() => {
    if (!currentDialogueLine) {
      return "";
    }

    return sliceText(
      currentDialogueLine.text,
      state.revealedTextState.visibleCount,
    );
  }, [currentDialogueLine, state.revealedTextState.visibleCount]);

  const selectedChoices = useMemo(
    () =>
      state.selectedIds
        .map((id) => getChoiceById(id))
        .filter((choice): choice is Choice => !!choice),
    [state.selectedIds],
  );

  const outcomeBundle = useMemo(
    () => deriveOutcome(state.selectedIds),
    [state.selectedIds],
  );

  const commandEntries = useMemo(() => {
    if (!activeBlock) {
      return [];
    }

    return [
      ...activeBlock.choices.map(
        (choice): CommandEntry => ({
          type: "choice",
          choice,
        }),
      ),
      {
        type: "next",
        disabled: !canAdvance,
      } satisfies CommandEntry,
    ];
  }, [activeBlock, canAdvance]);

  const boundedCommandIndex =
    commandEntries.length === 0
      ? 0
      : Math.min(commandIndex, commandEntries.length - 1);

  const currentCommand = commandEntries[boundedCommandIndex];
  const focusedChoice =
    currentCommand?.type === "choice"
      ? currentCommand.choice
      : activeBlock?.choices[0] ?? null;

  useEffect(() => {
    if (!currentDialogueLine || state.currentScreen !== "opening-cutscene") {
      return;
    }

    if (state.revealedTextState.isComplete) {
      return;
    }

    const total = getTextLength(currentDialogueLine.text);
    const timer = window.setTimeout(() => {
      dispatch({ type: "tick-text", total });
    }, 28);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    currentDialogueLine,
    state.currentScreen,
    state.revealedTextState.visibleCount,
    state.revealedTextState.isComplete,
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (state.memoOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          dispatch({ type: "toggle-memo", open: false });
        }
        return;
      }

      if (state.currentScreen === "title") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dispatch({ type: "start-game" });
        }
        return;
      }

      if (state.currentScreen === "scenario-select") {
        if (
          event.key === "ArrowUp" ||
          event.key === "ArrowDown" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
        }

        if (event.key === "Enter" || event.key === " ") {
          dispatch({
            type: "select-scenario",
            scenarioId: playableScenario.id,
          });
        }
        return;
      }

      if (state.currentScreen === "opening-cutscene" && currentDialogueLine) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const total = getTextLength(currentDialogueLine.text);

          if (state.revealedTextState.isComplete) {
            dispatch({ type: "advance-dialogue" });
          } else {
            dispatch({ type: "reveal-dialogue-all", total });
          }
        }
        return;
      }

      if (currentPhase && currentPhase.id !== "result" && activeBlock) {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setCommandIndex((currentIndex) =>
            currentIndex === 0 ? commandEntries.length - 1 : currentIndex - 1,
          );
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setCommandIndex((currentIndex) =>
            currentIndex === commandEntries.length - 1 ? 0 : currentIndex + 1,
          );
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const entry = commandEntries[boundedCommandIndex];

          if (!entry) {
            return;
          }

          if (entry.type === "choice") {
            dispatch({
              type: "toggle-choice",
              choice: entry.choice,
              limit: activeBlock.limit,
            });
            return;
          }

          if (canAdvance) {
            dispatch({ type: "advance-phase" });
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeBlock,
    canAdvance,
    commandEntries,
    boundedCommandIndex,
    currentDialogueLine,
    currentPhase,
    state.currentScreen,
    state.memoOpen,
    state.revealedTextState.isComplete,
  ]);

  function handleDialogueAdvance() {
    if (!currentDialogueLine) {
      return;
    }

    const total = getTextLength(currentDialogueLine.text);

    if (state.revealedTextState.isComplete) {
      dispatch({ type: "advance-dialogue" });
      return;
    }

    dispatch({ type: "reveal-dialogue-all", total });
  }

  return (
    <main className="min-h-[100dvh] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl">
        {state.currentScreen === "title" && (
          <TitleScreen onStart={() => dispatch({ type: "start-game" })} />
        )}

        {state.currentScreen === "scenario-select" && (
          <ScenarioMenuScreen
            scenario={playableScenario}
            onSelect={() =>
              dispatch({
                type: "select-scenario",
                scenarioId: playableScenario.id,
              })
            }
          />
        )}

        {state.currentScreen === "opening-cutscene" &&
          currentCutscene &&
          currentDialogueLine && (
            <OpeningCutscene
              scene={currentCutscene}
              line={currentDialogueLine}
              sceneIndex={state.cutsceneSceneIndex}
              sceneCount={openingCutscene.length}
              revealedText={revealedDialogueText}
              isTextComplete={state.revealedTextState.isComplete}
              onAdvance={handleDialogueAdvance}
            />
          )}

        {currentPhase &&
          currentPhase.id !== "result" &&
          activeBlock &&
          focusedChoice && (
            <GameplayScene
              currentPhase={currentPhase}
              activeBlock={activeBlock}
              phaseBlocks={phaseBlocks}
              selectedIds={state.selectedIds}
              scores={state.scores}
              commandEntries={commandEntries}
              commandIndex={boundedCommandIndex}
              focusedChoice={focusedChoice}
              canAdvance={canAdvance}
              onCommandFocus={setCommandIndex}
              onChoiceToggle={(choice) =>
                dispatch({
                  type: "toggle-choice",
                  choice,
                  limit: activeBlock.limit,
                })
              }
              onAdvance={() => dispatch({ type: "advance-phase" })}
              onOpenMemo={() => dispatch({ type: "toggle-memo", open: true })}
            />
          )}

        {state.currentScreen === "result" && (
          <ResultScene
            currentPhase={
              currentPhase ??
              phaseDefinitions.find((phase) => phase.id === "result")!
            }
            scores={outcomeBundle.scores}
            outcome={outcomeBundle.outcome}
            onReplay={() => dispatch({ type: "replay" })}
            onReset={() => dispatch({ type: "reset" })}
          />
        )}
      </div>

      {state.memoOpen && (
        <MemoOverlay
          discoveredInfo={state.discoveredInfo}
          selectedChoices={selectedChoices}
          onClose={() => dispatch({ type: "toggle-memo", open: false })}
        />
      )}
    </main>
  );
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <StageFrame className="min-h-[calc(100dvh-1.5rem)] overflow-hidden">
      <BackgroundArtwork backgroundId="title-haze" priority overlay="title" />
      <div className="relative flex min-h-[calc(100dvh-1.5rem)] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="animate-title-rise space-y-6">
          <p className="text-xs font-semibold tracking-[0.4em] text-[rgba(255,240,208,0.78)] uppercase">
            {titleScreenCopy.subtitle}
          </p>
          <div className="space-y-3">
            <div className="mx-auto h-px w-24 bg-[linear-gradient(90deg,transparent,#ebd6a2,transparent)]" />
            <h1 className="text-5xl leading-tight text-[var(--paper-strong)] sm:text-6xl lg:text-7xl">
              {titleScreenCopy.title}
            </h1>
            <div className="mx-auto h-px w-24 bg-[linear-gradient(90deg,transparent,#ebd6a2,transparent)]" />
          </div>
          <div className="space-y-3">
            <p className="animate-prompt-blink text-xs font-semibold tracking-[0.32em] text-[rgba(255,240,208,0.78)] uppercase">
              {titleScreenCopy.prompt}
            </p>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(255,240,208,0.46)] bg-[linear-gradient(180deg,#f0d8a6,#d7a95f)] px-8 py-3 text-sm font-semibold tracking-[0.18em] text-[#2f241e] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(0,0,0,0.34)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(255,240,208,0.8)]"
            >
              {titleScreenCopy.startLabel}
            </button>
          </div>
        </div>
      </div>
    </StageFrame>
  );
}

function ScenarioMenuScreen({
  scenario,
  onSelect,
}: {
  scenario: ScenarioSummary;
  onSelect: () => void;
}) {
  return (
    <StageFrame className="min-h-[calc(100dvh-1.5rem)] overflow-hidden">
      <BackgroundArtwork backgroundId="clinic-lobby" overlay="scene" />
      <div className="relative flex min-h-[calc(100dvh-1.5rem)] flex-col justify-center px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-5">
          <div className="rounded-[28px] border border-[rgba(227,189,121,0.18)] bg-[rgba(15,10,20,0.58)] px-5 py-5 backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--gold)] uppercase">
              Scenario Select
            </p>
            <h2 className="mt-3 text-3xl text-[var(--paper-strong)] sm:text-4xl">
              シナリオを選んでください
            </h2>
          </div>

          <div className="dialogue-panel space-y-4">
            <div className="rounded-[22px] border border-[rgba(227,189,121,0.16)] bg-[rgba(255,247,231,0.06)] p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center rounded-full border border-[rgba(227,189,121,0.24)] bg-[rgba(227,189,121,0.12)] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--gold)] uppercase">
                    {scenario.routeLabel}
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.14em] text-[rgba(255,247,231,0.72)] uppercase">
                      {scenario.subtitle}
                    </p>
                    <h3 className="mt-2 text-3xl text-[var(--paper-strong)]">
                      {scenario.title}
                    </h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-8 text-[rgba(255,247,231,0.78)]">
                    {scenario.teaser}
                  </p>
                </div>
                <div className="grid gap-3 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,7,15,0.34)] px-4 py-4 text-sm text-[rgba(255,247,231,0.82)] md:min-w-52">
                  <InfoRow label="想定プレイ時間" value={scenario.playTime} />
                  <InfoRow label="難易度" value={scenario.difficulty} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onSelect}
              className="command-menu-item is-focused flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="command-cursor text-[var(--gold)]">▶</span>
                <div>
                  <p className="text-sm font-semibold tracking-[0.12em] text-[var(--paper-strong)] uppercase">
                    はじめる
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[rgba(255,247,231,0.74)]">
                    {scenario.title}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[rgba(227,189,121,0.2)] bg-[rgba(227,189,121,0.12)] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--gold)] uppercase">
                Enter / Space
              </span>
            </button>
          </div>
        </div>
      </div>
    </StageFrame>
  );
}

function OpeningCutscene({
  scene,
  line,
  sceneIndex,
  sceneCount,
  revealedText,
  isTextComplete,
  onAdvance,
}: {
  scene: CutsceneScene;
  line: DialogueLine;
  sceneIndex: number;
  sceneCount: number;
  revealedText: string;
  isTextComplete: boolean;
  onAdvance: () => void;
}) {
  const isLastLine =
    scene.lines[scene.lines.length - 1]?.id === line.id;

  return (
    <StageFrame className="min-h-[calc(100dvh-1.5rem)] overflow-hidden">
      <div className="relative min-h-[calc(100dvh-1.5rem)]">
        <BackgroundArtwork backgroundId={scene.backgroundId} overlay="scene" />
        <div className="relative flex min-h-[calc(100dvh-1.5rem)] flex-col justify-between px-4 py-4 sm:px-6 sm:py-6">
          <div className="rounded-[24px] border border-[rgba(227,189,121,0.18)] bg-[rgba(15,10,20,0.54)] px-4 py-4 backdrop-blur sm:max-w-xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold)] uppercase">
                {scene.kicker}
              </p>
              <p className="text-xs tracking-[0.18em] text-[rgba(255,247,231,0.62)] uppercase">
                {sceneIndex + 1}/{sceneCount}
              </p>
            </div>
            <h2 className="mt-3 text-3xl text-[var(--paper-strong)] sm:text-4xl">
              {scene.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[rgba(255,247,231,0.72)]">
              {scene.sceneLabel}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-28 top-24 hidden sm:block">
            {line.portraits.map((portrait) => (
              <PortraitSprite
                key={`${line.id}-${portrait.portraitId}-${portrait.expressionId}`}
                portrait={portrait}
                isActive={line.speakerId === portrait.portraitId}
                size="large"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onAdvance}
            className="dialogue-panel relative mt-auto text-left transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span
                  className={[
                    "mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-[0.16em] uppercase",
                    line.speakerId === "patient"
                      ? "bg-[rgba(119,199,180,0.18)] text-[var(--mint)]"
                      : "bg-[rgba(227,189,121,0.18)] text-[var(--gold)]",
                  ].join(" ")}
                >
                  {line.speakerId === "patient" ? "PAT" : "YOU"}
                </span>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--paper-strong)]">
                      {line.speaker}
                    </p>
                    {line.speakerRole && (
                      <p className="text-xs tracking-[0.18em] text-[rgba(255,247,231,0.58)] uppercase">
                        {line.speakerRole}
                      </p>
                    )}
                  </div>
                  <p className="max-w-3xl text-sm leading-8 text-[rgba(255,247,231,0.88)] sm:text-base">
                    {revealedText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.08)] px-3 py-1 text-xs tracking-[0.14em] text-[rgba(255,247,231,0.68)] uppercase">
                  {isLastLine ? scene.advanceLabel : "つぎへ"}
                </span>
                <span
                  className={[
                    "text-lg text-[var(--gold)] transition-opacity duration-300",
                    isTextComplete ? "animate-caret-blink opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  ▼
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </StageFrame>
  );
}

function GameplayScene({
  currentPhase,
  activeBlock,
  phaseBlocks,
  selectedIds,
  scores,
  commandEntries,
  commandIndex,
  focusedChoice,
  canAdvance,
  onCommandFocus,
  onChoiceToggle,
  onAdvance,
  onOpenMemo,
}: {
  currentPhase: PhaseDefinition;
  activeBlock: PhaseChoiceBlock;
  phaseBlocks: PhaseChoiceBlock[];
  selectedIds: string[];
  scores: ScoreState;
  commandEntries: CommandEntry[];
  commandIndex: number;
  focusedChoice: Choice;
  canAdvance: boolean;
  onCommandFocus: (index: number) => void;
  onChoiceToggle: (choice: Choice) => void;
  onAdvance: () => void;
  onOpenMemo: () => void;
}) {
  const stage = getGameplayStage(currentPhase.id as Exclude<PhaseId, "result">);
  const currentCommand = commandEntries[commandIndex];

  return (
    <div className="space-y-4">
      <PhaseHud
        currentPhase={currentPhase}
        scores={scores}
        onOpenMemo={onOpenMemo}
      />

      <StageFrame className="overflow-hidden">
        <div className="relative min-h-[72dvh]">
          <BackgroundArtwork backgroundId={stage.backgroundId} overlay="scene" />
          <div className="relative flex min-h-[72dvh] flex-col justify-between px-4 py-4 sm:px-6 sm:py-6">
            <div className="rounded-[24px] border border-[rgba(227,189,121,0.18)] bg-[rgba(15,10,20,0.54)] px-4 py-4 backdrop-blur sm:max-w-xl">
              <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold)] uppercase">
                {stage.kicker}
              </p>
              <h2 className="mt-3 text-3xl text-[var(--paper-strong)] sm:text-4xl">
                {currentPhase.sceneTitle}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[rgba(255,247,231,0.72)]">
                {stage.stageLabel}
              </p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-36 top-24 hidden sm:block">
              <PortraitSprite
                portrait={{
                  portraitId: "therapist",
                  expressionId: stage.therapistExpression,
                  side: "left",
                }}
                isActive={stage.focusPortrait === "therapist"}
                size="large"
              />
              <PortraitSprite
                portrait={{
                  portraitId: "patient",
                  expressionId: stage.patientExpression,
                  side: "right",
                }}
                isActive={stage.focusPortrait === "patient"}
                size="large"
              />
            </div>

            <div className="dialogue-panel mt-auto">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--paper-strong)]">
                      {stage.promptSpeaker}
                    </p>
                    <p className="text-xs tracking-[0.16em] text-[rgba(255,247,231,0.58)] uppercase">
                      {stage.promptRole}
                    </p>
                  </div>
                  <p className="text-sm leading-8 text-[rgba(255,247,231,0.84)]">
                    {stage.promptText}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {phaseBlocks.map((block) => {
                      const selections = getBlockSelections(selectedIds, block);
                      const isActive = block.category === activeBlock.category;

                      return (
                        <div
                          key={block.title}
                          className={[
                            "rounded-[18px] border px-3 py-3",
                            isActive
                              ? "border-[rgba(227,189,121,0.24)] bg-[rgba(227,189,121,0.12)]"
                              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.05)]",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-[var(--paper-strong)]">
                              {block.title}
                            </span>
                            <span className="text-xs tracking-[0.12em] text-[rgba(255,247,231,0.62)] uppercase">
                              {selections.length}/{block.limit}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selections.length > 0 ? (
                              selections.map((choice) => (
                                <span
                                  key={choice.id}
                                  className="rounded-full bg-[rgba(255,247,231,0.1)] px-2.5 py-1 text-[11px] text-[rgba(255,247,231,0.78)]"
                                >
                                  {choice.title}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] leading-5 text-[rgba(255,247,231,0.54)]">
                                未選択
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="space-y-2 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,7,15,0.34)] p-3">
                    {commandEntries.map((entry, index) => {
                      if (entry.type === "choice") {
                        const isSelected = selectedIds.includes(entry.choice.id);

                        return (
                          <button
                            key={entry.choice.id}
                            type="button"
                            onMouseEnter={() => onCommandFocus(index)}
                            onFocus={() => onCommandFocus(index)}
                            onClick={() => onChoiceToggle(entry.choice)}
                            className={[
                              "command-menu-item flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left",
                              index === commandIndex ? "is-focused" : "",
                              isSelected ? "is-selected" : "",
                            ].join(" ")}
                          >
                            <span className="command-cursor">
                              {index === commandIndex ? "▶" : "・"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[var(--paper-strong)]">
                                {entry.choice.title}
                              </p>
                              <p className="mt-1 text-xs tracking-[0.14em] text-[rgba(255,247,231,0.56)] uppercase">
                                {toneLabelMap[entry.choice.tone]}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="rounded-full bg-[rgba(119,199,180,0.16)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[var(--mint)] uppercase">
                                選択中
                              </span>
                            )}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`${currentPhase.id}-next`}
                          type="button"
                          onMouseEnter={() => onCommandFocus(index)}
                          onFocus={() => onCommandFocus(index)}
                          onClick={onAdvance}
                          disabled={entry.disabled}
                          className={[
                            "command-menu-item flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left",
                            index === commandIndex ? "is-focused" : "",
                            entry.disabled ? "is-disabled" : "is-next",
                          ].join(" ")}
                        >
                          <span className="command-cursor">
                            {index === commandIndex ? "▶" : "・"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--paper-strong)]">
                              {currentPhase.id === "treatment"
                                ? "結果を見る"
                                : "次の幕へ進む"}
                            </p>
                            <p className="mt-1 text-xs tracking-[0.14em] text-[rgba(255,247,231,0.56)] uppercase">
                              {entry.disabled ? "必要数を選択してください" : "決定"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.06)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--paper-strong)]">
                        {activeBlock.title}
                      </p>
                      <span className="rounded-full border border-[rgba(227,189,121,0.18)] bg-[rgba(227,189,121,0.12)] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--gold)] uppercase">
                        {getBlockSelections(selectedIds, activeBlock).length}/
                        {activeBlock.limit}
                      </span>
                    </div>
                    <div className="mt-3 space-y-4">
                      <p className="text-sm leading-8 text-[rgba(255,247,231,0.78)]">
                        {currentCommand?.type === "next"
                          ? "このフェーズの必要数を満たしたら、次の幕へ進めます。"
                          : focusedChoice.detail}
                      </p>
                      <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,7,15,0.34)] px-3 py-3">
                        <p className="text-xs font-semibold tracking-[0.16em] text-[rgba(255,247,231,0.54)] uppercase">
                          Reward
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[rgba(255,247,231,0.8)]">
                          {currentCommand?.type === "next"
                            ? activeBlock.helper
                            : focusedChoice.reward}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StageFrame>
    </div>
  );
}

function ResultScene({
  currentPhase,
  scores,
  outcome,
  onReplay,
  onReset,
}: {
  currentPhase: PhaseDefinition;
  scores: ScoreState;
  outcome: ReturnType<typeof deriveOutcome>["outcome"];
  onReplay: () => void;
  onReset: () => void;
}) {
  const revealBlocks = [
    {
      title: "今回よかった判断",
      items: outcome.spotlight,
      delay: "120ms",
    },
    {
      title: "見落とした点",
      items: outcome.misses,
      delay: "220ms",
    },
    {
      title: "次回の改善ヒント",
      items: [outcome.nextHint],
      delay: "320ms",
    },
  ];

  return (
    <div className="space-y-4">
      <PhaseHud currentPhase={currentPhase} scores={scores} compact />

      <StageFrame className="overflow-hidden">
        <div className="relative min-h-[72dvh] px-4 py-5 sm:px-6 sm:py-6">
          <BackgroundArtwork backgroundId="consult-room" overlay="result" />
          <div className="relative space-y-6">
            <div className="rounded-[30px] border border-[rgba(227,189,121,0.22)] bg-[rgba(15,10,20,0.58)] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold)] uppercase">
                Result / Scenario 01
              </p>
              <h2 className="mt-3 text-4xl text-[var(--paper-strong)] sm:text-5xl">
                {outcome.ending}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[rgba(255,247,231,0.8)] sm:text-base">
                {outcome.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <ResultPill label="信頼度" value={outcome.trustLabel} />
                <ResultPill label="見立て精度" value={outcome.accuracyLabel} />
                <ResultPill label="症状改善度" value={outcome.symptomLabel} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {revealBlocks.map((block) => (
                <ResultCard
                  key={block.title}
                  title={block.title}
                  items={block.items}
                  delay={block.delay}
                />
              ))}
            </div>

            <div className="dialogue-panel flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(227,189,121,0.36)] bg-[linear-gradient(180deg,#f0d8a6,#d7a95f)] px-6 py-3 text-sm font-semibold tracking-[0.16em] text-[#2f241e] shadow-[0_18px_38px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
              >
                同じシナリオを再挑戦
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,247,231,0.08)] px-6 py-3 text-sm font-semibold tracking-[0.16em] text-[var(--paper-strong)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(255,247,231,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--paper)]"
              >
                タイトルへ戻る
              </button>
            </div>
          </div>
        </div>
      </StageFrame>
    </div>
  );
}

function PhaseHud({
  currentPhase,
  scores,
  onOpenMemo,
  compact = false,
}: {
  currentPhase: PhaseDefinition;
  scores: ScoreState;
  onOpenMemo?: () => void;
  compact?: boolean;
}) {
  return (
    <StageFrame className="overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold)] uppercase">
              Phase
            </p>
            <h2 className="mt-2 text-2xl text-[var(--paper-strong)] sm:text-3xl">
              {currentPhase.label}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {phaseDefinitions.map((phase) => {
              const currentIndex = playablePhaseIds.indexOf(currentPhase.id);
              const phaseIndex = playablePhaseIds.indexOf(phase.id);
              const isCurrent = phase.id === currentPhase.id;
              const isPast = phaseIndex < currentIndex;

              return (
                <span
                  key={phase.id}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase",
                    isCurrent
                      ? "bg-[rgba(227,189,121,0.18)] text-[var(--gold)]"
                      : isPast
                        ? "bg-[rgba(119,199,180,0.16)] text-[var(--mint)]"
                        : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,247,231,0.66)]",
                  ].join(" ")}
                >
                  {phase.shortLabel}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <MiniMeter label="信頼度" value={scores.trust} tone="var(--rose)" />
          <MiniMeter
            label="見立て精度"
            value={scores.accuracy}
            tone="var(--mint)"
          />
          <MiniMeter
            label={compact ? "症状改善度" : "改善予測"}
            value={scores.symptom}
            tone="var(--gold)"
          />
          {!compact && onOpenMemo && (
            <button
              type="button"
              onClick={onOpenMemo}
              className="inline-flex min-h-12 items-center justify-center rounded-[22px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,247,231,0.08)] px-5 py-3 text-sm font-semibold text-[var(--paper-strong)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(255,247,231,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
            >
              観察メモ
            </button>
          )}
        </div>
      </div>
    </StageFrame>
  );
}

function MemoOverlay({
  discoveredInfo,
  selectedChoices,
  onClose,
}: {
  discoveredInfo: string[];
  selectedChoices: Choice[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,5,14,0.72)] px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-[rgba(227,189,121,0.22)] bg-[linear-gradient(180deg,#30263b,#241f2d)] p-5 shadow-[0_28px_56px_rgba(0,0,0,0.38)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold)] uppercase">
              Observation Memo
            </p>
            <h2 className="mt-2 text-3xl text-[var(--paper-strong)]">
              観察メモ
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,247,231,0.08)] text-sm font-semibold text-[var(--paper-strong)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
          >
            閉
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.06)] p-4">
            <p className="text-sm font-semibold text-[var(--paper-strong)]">
              集まった情報
            </p>
            <div className="mt-3 space-y-3">
              {discoveredInfo.length > 0 ? (
                discoveredInfo.map((info) => (
                  <div
                    key={info}
                    className="rounded-[18px] bg-[rgba(11,7,15,0.34)] px-3 py-2 text-sm leading-7 text-[rgba(255,247,231,0.78)]"
                  >
                    {info}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[rgba(255,247,231,0.62)]">
                  まだ重要情報は集まっていません。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.06)] p-4">
            <p className="text-sm font-semibold text-[var(--paper-strong)]">
              これまでの選択
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedChoices.length > 0 ? (
                selectedChoices.map((choice) => (
                  <span
                    key={choice.id}
                    className="rounded-full bg-[rgba(255,247,231,0.12)] px-3 py-1.5 text-xs text-[rgba(255,247,231,0.84)]"
                  >
                    {choice.title}
                  </span>
                ))
              ) : (
                <p className="text-sm leading-7 text-[rgba(255,247,231,0.62)]">
                  まだ選択はありません。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "relative rounded-[38px] border border-[rgba(227,189,121,0.16)] bg-[linear-gradient(180deg,#30263b,#241f2d)] shadow-[var(--shadow-stage)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,247,231,0.08),transparent_34%)]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(195,142,170,0.16),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(119,199,180,0.18),transparent_70%)] blur-2xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

function BackgroundArtwork({
  backgroundId,
  priority = false,
  overlay = "scene",
}: {
  backgroundId: BackgroundId;
  priority?: boolean;
  overlay?: "title" | "scene" | "result";
}) {
  const src = backgroundAssetMap[backgroundId];
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const failed = erroredSrc === src;

  return (
    <>
      {!failed && (
        <div className="absolute inset-0">
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={priority}
            className="object-cover"
            sizes="100vw"
            onError={() => setErroredSrc(src)}
          />
        </div>
      )}
      <div
        className={[
          "absolute inset-0",
          overlay === "title"
            ? "bg-[linear-gradient(180deg,rgba(16,10,20,0.26),rgba(16,10,20,0.56))]"
            : overlay === "result"
              ? "bg-[linear-gradient(180deg,rgba(16,10,20,0.34),rgba(16,10,20,0.68))]"
              : "bg-[linear-gradient(180deg,rgba(16,10,20,0.18),rgba(16,10,20,0.62))]",
        ].join(" ")}
      />
    </>
  );
}

function PortraitSprite({
  portrait,
  isActive,
  size,
}: {
  portrait: PortraitState;
  isActive: boolean;
  size: "large";
}) {
  const src = portraitAssetMap[portrait.portraitId][portrait.expressionId];
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const failed = !src || erroredSrc === src;

  return (
    <div
      className={[
        "absolute bottom-0 w-[44%] max-w-[22rem] transition-all duration-300 lg:w-[36%]",
        portrait.side === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2",
        isActive
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-2 scale-[0.96] opacity-60",
      ].join(" ")}
    >
      <div className="relative aspect-[7/10]">
        {!failed && src ? (
          <Image
            key={src}
            src={src}
            alt={`${portrait.portraitId}-${portrait.expressionId}`}
            fill
            className="object-contain object-bottom"
            sizes={size === "large" ? "(min-width: 1024px) 30vw, 42vw" : "42vw"}
            onError={() => setErroredSrc(src)}
          />
        ) : (
          <FallbackPortrait
            portraitId={portrait.portraitId}
            expressionId={portrait.expressionId}
            side={portrait.side}
          />
        )}
      </div>
    </div>
  );
}

function FallbackPortrait({
  portraitId,
  expressionId,
  side,
}: {
  portraitId: PortraitId;
  expressionId: ExpressionId;
  side: PortraitSide;
}) {
  const label = portraitId === "therapist" ? "整体師" : "患者";
  const accent = portraitId === "therapist" ? "var(--mint)" : "var(--rose)";

  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <div
        className="w-[82%] rounded-t-[44%] rounded-b-[20%] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,247,231,0.16),rgba(255,247,231,0.04))]"
        style={{
          boxShadow: `0 20px 48px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <div
            className="h-28 w-28 rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}, rgba(255,255,255,0.18))` }}
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--paper-strong)]">{label}</p>
            <p className="text-xs tracking-[0.16em] text-[rgba(255,247,231,0.62)] uppercase">
              {side} / {expressionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMeter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.08)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[var(--paper-strong)]">{label}</span>
        <span className="text-[rgba(255,247,231,0.72)]">{value}</span>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-[rgba(255,255,255,0.08)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${tone}, rgba(255,255,255,0.9))`,
          }}
        />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  items,
  delay,
}: {
  title: string;
  items: string[];
  delay: CSSProperties["animationDelay"];
}) {
  return (
    <div
      className="animate-screen-enter rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,247,231,0.08)] p-5 opacity-0 shadow-[0_18px_40px_rgba(7,4,12,0.24)]"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <p className="text-sm font-semibold text-[var(--paper-strong)]">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[18px] bg-[rgba(11,7,15,0.34)] px-3 py-3 text-sm leading-7 text-[rgba(255,247,231,0.78)]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-[rgba(227,189,121,0.18)] bg-[rgba(227,189,121,0.12)] px-4 py-2 text-sm text-[var(--paper-strong)]">
      <span className="font-semibold">{label}</span>
      <span className="mx-2 text-[rgba(255,247,231,0.48)]">/</span>
      <span>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[rgba(255,247,231,0.66)]">{label}</span>
      <span className="font-semibold text-[var(--paper-strong)]">{value}</span>
    </div>
  );
}

const toneLabelMap = {
  insight: "核心に近い",
  safe: "安全",
  direct: "直感的",
  support: "補助線",
} as const;
