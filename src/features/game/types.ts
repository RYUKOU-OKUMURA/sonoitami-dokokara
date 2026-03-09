export type PhaseId =
  | "interview"
  | "hypothesis"
  | "evaluation"
  | "treatment"
  | "result";

export type ScreenId =
  | "title"
  | "scenario-select"
  | "opening-cutscene"
  | "interview"
  | "hypothesis"
  | "evaluation"
  | "treatment"
  | "result";

export type PortraitId = "therapist" | "patient";

export type ExpressionId = "calm" | "focus" | "troubled" | "soft";

export type PortraitSide = "left" | "right";

export type BackgroundId = "title-haze" | "clinic-lobby" | "consult-room";

export type PhaseDefinition = {
  id: PhaseId;
  label: string;
  shortLabel: string;
  sceneTitle: string;
  description: string;
};

export type SelectionCategory =
  | "interview"
  | "hypothesisPrimary"
  | "hypothesisSupport"
  | "evaluation"
  | "treatment"
  | "explanation";

export type ChoiceTone = "insight" | "safe" | "direct" | "support";

export type Choice = {
  id: string;
  title: string;
  detail: string;
  reward: string;
  infoGain?: string;
  category: SelectionCategory;
  tone: ChoiceTone;
  trustDelta: number;
  accuracyDelta: number;
  tags?: string[];
};

export type PhaseChoiceBlock = {
  title: string;
  helper: string;
  limit: number;
  category: SelectionCategory;
  choices: Choice[];
};

export type PatientProfile = {
  name: string;
  age: number;
  occupation: string;
  complaint: string;
  overlay: string;
  personality: string;
};

export type Outcome = {
  ending: string;
  summary: string;
  trustLabel: string;
  accuracyLabel: string;
  symptomLabel: string;
  spotlight: string[];
  misses: string[];
  nextHint: string;
};

export type ScoreState = {
  trust: number;
  accuracy: number;
  symptom: number;
};

export type PortraitState = {
  portraitId: PortraitId;
  expressionId: ExpressionId;
  side: PortraitSide;
};

export type DialogueLine = {
  id: string;
  speaker: string;
  speakerRole?: string;
  speakerId?: PortraitId | "system";
  text: string;
  portraits: PortraitState[];
};

export type CutsceneScene = {
  id: string;
  kicker: string;
  title: string;
  sceneLabel: string;
  backgroundId: BackgroundId;
  lines: DialogueLine[];
  advanceLabel: string;
};

export type ScenarioSummary = {
  id: string;
  title: string;
  subtitle: string;
  teaser: string;
  playTime: string;
  difficulty: string;
  routeLabel: string;
};

export type RevealedTextState = {
  visibleCount: number;
  isComplete: boolean;
};

export type GameState = {
  currentScreen: ScreenId;
  currentPhase: PhaseId | null;
  cutsceneSceneIndex: number;
  dialogueIndex: number;
  selectedScenarioId: string | null;
  selectedIds: string[];
  discoveredInfo: string[];
  scores: ScoreState;
  memoOpen: boolean;
  revealedTextState: RevealedTextState;
};
