import type {
  BackgroundId,
  Choice,
  CutsceneScene,
  ExpressionId,
  Outcome,
  PatientProfile,
  PhaseChoiceBlock,
  PhaseDefinition,
  PhaseId,
  PortraitId,
  ScenarioSummary,
} from "./types";

type GameplayStage = {
  kicker: string;
  stageLabel: string;
  promptSpeaker: string;
  promptRole: string;
  promptText: string;
  backgroundId: BackgroundId;
  focusPortrait: PortraitId;
  therapistExpression: ExpressionId;
  patientExpression: ExpressionId;
};

export const playablePhaseIds: PhaseId[] = [
  "interview",
  "hypothesis",
  "evaluation",
  "treatment",
  "result",
];

export const phaseDefinitions: PhaseDefinition[] = [
  {
    id: "interview",
    label: "問診",
    shortLabel: "問診",
    sceneTitle: "最初の3手で、景色が決まる",
    description: "何を聞くかで、この後に見える原因の輪郭が変わる。",
  },
  {
    id: "hypothesis",
    label: "原因仮説",
    shortLabel: "仮説",
    sceneTitle: "痛い場所から、ひとつ奥を見る",
    description:
      "表のつらさをそのまま答えにせず、背景のパターンを仮説として組み立てる。",
  },
  {
    id: "evaluation",
    label: "評価",
    shortLabel: "評価",
    sceneTitle: "仮説は、確かめて初めて力になる",
    description: "仮説と評価がつながると、施術の精度が一気に上がる。",
  },
  {
    id: "treatment",
    label: "施術",
    shortLabel: "施術",
    sceneTitle: "触り方と伝え方で、結末が変わる",
    description: "どこに触れるかだけでなく、どう伝えるかで信頼も変わる。",
  },
  {
    id: "result",
    label: "結果",
    shortLabel: "結果",
    sceneTitle: "今回の見立ての結末",
    description: "改善度と納得感をまとめて振り返る。",
  },
];

export const titleScreenCopy = {
  title: "その痛み、どこから？",
  subtitle: "整体師シミュレーション",
  prompt: "PRESS START",
  startLabel: "ゲームスタート",
};

export const playableScenario: ScenarioSummary = {
  id: "deskwork-neck-headache",
  title: "デスクワーク由来の首肩こりと頭痛",
  subtitle: "王道シナリオ",
  teaser:
    "仕事終わりに頭痛が出る患者。首だけを見るか、胸郭と呼吸まで追うかで結末が変わる。",
  playTime: "8〜12分",
  difficulty: "標準",
  routeLabel: "SCENARIO 01",
};

export const patientProfile: PatientProfile = {
  name: "佐伯 みさき",
  age: 34,
  occupation: "デスクワーカー",
  complaint: "首肩こりと、夕方に出る頭痛",
  overlay: "睡眠が浅く、疲労感が抜けにくい",
  personality: "真面目で我慢しやすい。説明されると安心しやすい",
};

export const backgroundAssetMap: Record<BackgroundId, string> = {
  "title-haze": "/assets/game/backgrounds/title-haze.svg",
  "clinic-lobby": "/assets/game/backgrounds/clinic-lobby.svg",
  "consult-room": "/assets/game/backgrounds/consult-room.svg",
};

export const portraitAssetMap: Record<
  PortraitId,
  Record<ExpressionId, string | null>
> = {
  therapist: {
    calm: "/assets/game/characters/therapist-calm.svg",
    focus: "/assets/game/characters/therapist-focus.svg",
    troubled: null,
    soft: null,
  },
  patient: {
    calm: null,
    focus: null,
    troubled: "/assets/game/characters/patient-troubled.svg",
    soft: "/assets/game/characters/patient-soft.svg",
  },
};

export const openingCutscene: CutsceneScene[] = [
  {
    id: "opening-therapist",
    kicker: "PROLOGUE",
    title: "その夜、ひとつの相談が届く",
    sceneLabel: "閉店後の整体院",
    backgroundId: "clinic-lobby",
    advanceLabel: "つぎへ",
    lines: [
      {
        id: "opening-therapist-1",
        speaker: "あなた",
        speakerRole: "整体師",
        speakerId: "therapist",
        text:
          "今日も一日が終わった。けれど、本当に仕事が始まるのは、ここからかもしれない。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "calm",
            side: "left",
          },
        ],
      },
      {
        id: "opening-therapist-2",
        speaker: "あなた",
        speakerRole: "整体師",
        speakerId: "therapist",
        text:
          "目の前の痛みだけを追うか。それとも、もうひとつ奥にある理由まで見にいくか。整体師として問われるのは、そこだ。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "focus",
            side: "left",
          },
        ],
      },
    ],
  },
  {
    id: "opening-patient",
    kicker: "MESSAGE",
    title: "患者が、不調をこぼす",
    sceneLabel: "相談メッセージ",
    backgroundId: "clinic-lobby",
    advanceLabel: "つぎへ",
    lines: [
      {
        id: "opening-patient-1",
        speaker: "佐伯みさき",
        speakerRole: "患者",
        speakerId: "patient",
        text:
          "最近ずっと首肩が重くて、夕方になると頭まで痛くなるんです。寝てもあまり抜けなくて……。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "calm",
            side: "left",
          },
          {
            portraitId: "patient",
            expressionId: "troubled",
            side: "right",
          },
        ],
      },
      {
        id: "opening-patient-2",
        speaker: "佐伯みさき",
        speakerRole: "患者",
        speakerId: "patient",
        text:
          "首を回したり、肩を揉んだりはしてるんですけど、その時だけ少し楽で、すぐ戻る感じがあります。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "calm",
            side: "left",
          },
          {
            portraitId: "patient",
            expressionId: "troubled",
            side: "right",
          },
        ],
      },
    ],
  },
  {
    id: "opening-overview",
    kicker: "BRIEFING",
    title: "見立ては、会話の中で始まっている",
    sceneLabel: "施術前の確認",
    backgroundId: "consult-room",
    advanceLabel: "問診を始める",
    lines: [
      {
        id: "opening-overview-1",
        speaker: "あなた",
        speakerRole: "整体師",
        speakerId: "therapist",
        text:
          "分かりました。まずは、どんな時に強くなるかや生活の流れを聞かせてください。そこから仮説を立てて、必要な評価をしていきます。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "focus",
            side: "left",
          },
          {
            portraitId: "patient",
            expressionId: "troubled",
            side: "right",
          },
        ],
      },
      {
        id: "opening-overview-2",
        speaker: "佐伯みさき",
        speakerRole: "患者",
        speakerId: "patient",
        text:
          "ただ揉むだけじゃなくて、どうしてこうなっているかも一緒に見ていくんですね。少し安心しました。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "focus",
            side: "left",
          },
          {
            portraitId: "patient",
            expressionId: "soft",
            side: "right",
          },
        ],
      },
      {
        id: "opening-overview-3",
        speaker: "あなた",
        speakerRole: "整体師",
        speakerId: "therapist",
        text:
          "このゲームでは、問診、仮説、評価、施術の順で進みます。痛い場所だけを見ると近道に見えて、最良結果から遠ざかることもあります。",
        portraits: [
          {
            portraitId: "therapist",
            expressionId: "focus",
            side: "left",
          },
          {
            portraitId: "patient",
            expressionId: "soft",
            side: "right",
          },
        ],
      },
    ],
  },
];

export const gameplayStageByPhase: Record<
  Exclude<PhaseId, "result">,
  GameplayStage
> = {
  interview: {
    kicker: "INTERVIEW",
    stageLabel: "言葉の中から、背景を拾う",
    promptSpeaker: "佐伯みさき",
    promptRole: "患者",
    promptText:
      "まずは今の状態を聞いていきましょう。どこから触れると、この症状の背景が見えてきそうですか？",
    backgroundId: "consult-room",
    focusPortrait: "patient",
    therapistExpression: "calm",
    patientExpression: "troubled",
  },
  hypothesis: {
    kicker: "HYPOTHESIS",
    stageLabel: "主訴の奥にある線を読む",
    promptSpeaker: "あなた",
    promptRole: "整体師",
    promptText:
      "情報は揃ってきた。ここで原因仮説を組み立てる。首そのものか、それとも別の連動か。",
    backgroundId: "consult-room",
    focusPortrait: "therapist",
    therapistExpression: "focus",
    patientExpression: "soft",
  },
  evaluation: {
    kicker: "EVALUATION",
    stageLabel: "仮説を、手で確かめる",
    promptSpeaker: "あなた",
    promptRole: "整体師",
    promptText:
      "当てずっぽうでは終われない。仮説を検証できる評価を選んで、次の一手を固めましょう。",
    backgroundId: "consult-room",
    focusPortrait: "therapist",
    therapistExpression: "focus",
    patientExpression: "soft",
  },
  treatment: {
    kicker: "TREATMENT",
    stageLabel: "触り方と伝え方で、結末が変わる",
    promptSpeaker: "あなた",
    promptRole: "整体師",
    promptText:
      "最後は介入と説明です。変化だけでなく、患者の納得感も今回の結果に影響します。",
    backgroundId: "consult-room",
    focusPortrait: "therapist",
    therapistExpression: "focus",
    patientExpression: "soft",
  },
};

const interviewChoices: Choice[] = [
  {
    id: "sleep-quality",
    title: "睡眠の質を聞く",
    detail: "眠りが浅いか、夜中に目が覚めるかを丁寧に確認する。",
    reward: "回復が追いついていない背景に気づける",
    infoGain: "夜中に2回ほど目が覚め、朝も首が重いことが分かった。",
    category: "interview",
    tone: "insight",
    trustDelta: 7,
    accuracyDelta: 8,
    tags: ["sleep"],
  },
  {
    id: "breathing-stress",
    title: "呼吸の浅さと緊張感を聞く",
    detail: "忙しい時ほど息が浅くなるか、胸が固まりやすいかを探る。",
    reward: "主因に近い見立ての入口になる",
    infoGain: "仕事中に息を止めがちで、夕方は胸が詰まる感じがある。",
    category: "interview",
    tone: "insight",
    trustDelta: 6,
    accuracyDelta: 12,
    tags: ["breathing", "thoracic"],
  },
  {
    id: "headache-timing",
    title: "頭痛が出る時間帯を聞く",
    detail: "いつ悪化するかを確認し、生活との接点を探す。",
    reward: "症状の流れを時系列で捉えられる",
    infoGain: "午後後半に頭が締めつけられるように重くなる。",
    category: "interview",
    tone: "safe",
    trustDelta: 5,
    accuracyDelta: 6,
    tags: ["timing"],
  },
  {
    id: "desk-posture",
    title: "仕事姿勢と座り時間を聞く",
    detail: "モニター位置、前のめり姿勢、座りっぱなし時間を確認する。",
    reward: "胸椎と股関節の負担に線がつながる",
    infoGain: "前のめりで5時間以上ほぼ座りっぱなしの日が多い。",
    category: "interview",
    tone: "insight",
    trustDelta: 6,
    accuracyDelta: 10,
    tags: ["thoracic", "hip"],
  },
  {
    id: "red-flags",
    title: "安全確認の質問をする",
    detail: "急な激痛やしびれ悪化などの危険サインを確認する。",
    reward: "安心感が上がり、視点の丁寧さが伝わる",
    infoGain:
      "危険サインはなく、慢性的に積み上がった不調と分かった。",
    category: "interview",
    tone: "safe",
    trustDelta: 9,
    accuracyDelta: 4,
    tags: ["safety"],
  },
  {
    id: "pain-scale",
    title: "痛みの強さだけを細かく聞く",
    detail: "数値化はできるが、背景理解は深まりにくい。",
    reward: "症状の強度は整理できる",
    infoGain: "今日は10段階で6くらいのつらさ。",
    category: "interview",
    tone: "direct",
    trustDelta: 2,
    accuracyDelta: 2,
    tags: ["surface"],
  },
  {
    id: "self-care-history",
    title: "セルフケア歴を聞く",
    detail: "ストレッチやマッサージで何が変わらなかったかを見る。",
    reward: "局所アプローチの限界を示せる",
    infoGain: "首を回したり揉んでも、その場しのぎで戻りやすい。",
    category: "interview",
    tone: "support",
    trustDelta: 5,
    accuracyDelta: 7,
    tags: ["surface", "pattern"],
  },
  {
    id: "neck-only",
    title: "首だけ詳しく触れる前提で話を進める",
    detail: "主訴には沿うが、見立ては狭くなりやすい。",
    reward: "患者は話が早いと感じる",
    infoGain: "首肩だけ見てくれるなら早いかも、と少し期待している。",
    category: "interview",
    tone: "direct",
    trustDelta: 1,
    accuracyDelta: -3,
    tags: ["surface"],
  },
];

const hypothesisChoices: Choice[] = [
  {
    id: "thoracic-breathing",
    title: "胸椎の硬さと浅い呼吸が頚部負担を増やしている",
    detail: "主因に近い王道仮説。首だけでなく、胸郭の動きまで見る。",
    reward: "見立て精度が大きく伸びる",
    category: "hypothesisPrimary",
    tone: "insight",
    trustDelta: 0,
    accuracyDelta: 20,
    tags: ["thoracic", "breathing"],
  },
  {
    id: "hip-posture",
    title: "股関節前面の硬さと座位姿勢が上半身を引っ張っている",
    detail: "副因として有効。補助仮説に置くと噛み合いやすい。",
    reward: "補助線として機能する",
    category: "hypothesisSupport",
    tone: "support",
    trustDelta: 0,
    accuracyDelta: 12,
    tags: ["hip", "posture"],
  },
  {
    id: "local-neck",
    title: "原因は首肩そのもののコリにある",
    detail: "局所的で分かりやすいが、最良結果には届きにくい。",
    reward: "直感的ではある",
    category: "hypothesisPrimary",
    tone: "direct",
    trustDelta: 0,
    accuracyDelta: -4,
    tags: ["surface"],
  },
  {
    id: "jaw-stress",
    title: "食いしばり中心の問題だと考える",
    detail: "部分的にはあり得るが、今回の軸からはやや外れる。",
    reward: "緊張への視点はある",
    category: "hypothesisSupport",
    tone: "safe",
    trustDelta: 0,
    accuracyDelta: 2,
    tags: ["stress"],
  },
  {
    id: "bloodflow",
    title: "単純な血流不足が主因だと考える",
    detail: "説明はしやすいが、評価につながりにくい。",
    reward: "ざっくりした納得は得やすい",
    category: "hypothesisPrimary",
    tone: "direct",
    trustDelta: 0,
    accuracyDelta: -2,
    tags: ["surface"],
  },
];

const evaluationChoices: Choice[] = [
  {
    id: "thoracic-rotation-test",
    title: "胸椎回旋と肋骨の広がりをみる",
    detail: "主因仮説を直接検証できる評価。",
    reward: "仮説と評価がきれいにつながる",
    infoGain: "右回旋で胸郭が固く、深呼吸で首に力が入りやすい。",
    category: "evaluation",
    tone: "insight",
    trustDelta: 4,
    accuracyDelta: 16,
    tags: ["thoracic", "breathing"],
  },
  {
    id: "breathing-observation",
    title: "呼吸パターンを観察する",
    detail: "肩で呼吸しているか、息を止める癖があるかを確認する。",
    reward: "患者にも自覚が生まれやすい",
    infoGain: "吸気で肩がすくみ、吐く息が浅いことが見えた。",
    category: "evaluation",
    tone: "insight",
    trustDelta: 5,
    accuracyDelta: 14,
    tags: ["breathing"],
  },
  {
    id: "hip-extension-test",
    title: "股関節前面の伸びをみる",
    detail: "副因の確認として有効。全身連動の説明に厚みが出る。",
    reward: "補助仮説の裏取りになる",
    infoGain: "股関節前面が突っ張り、骨盤が前に引かれやすい。",
    category: "evaluation",
    tone: "support",
    trustDelta: 4,
    accuracyDelta: 10,
    tags: ["hip", "posture"],
  },
  {
    id: "neck-range-only",
    title: "首の可動域だけを見る",
    detail: "情報は取れるが、原因の裏づけとしては弱い。",
    reward: "症状は確認できる",
    infoGain: "左右差はあるが、再現性は限定的だった。",
    category: "evaluation",
    tone: "direct",
    trustDelta: 2,
    accuracyDelta: 1,
    tags: ["surface"],
  },
  {
    id: "trigger-point-palpation",
    title: "首肩の圧痛点を追う",
    detail: "つらい場所は拾えるが、背景把握にはつながりにくい。",
    reward: "患者は分かってもらえた感が出る",
    infoGain: "僧帽筋上部に強い張り感が出ている。",
    category: "evaluation",
    tone: "safe",
    trustDelta: 3,
    accuracyDelta: -1,
    tags: ["surface"],
  },
  {
    id: "balance-test",
    title: "立位バランスをざっくり見る",
    detail: "ヒントにはなるが、今回の中核にはやや遠い。",
    reward: "全体の印象はつかめる",
    infoGain: "重心は少し前寄りで、肩に力が入りやすい。",
    category: "evaluation",
    tone: "support",
    trustDelta: 3,
    accuracyDelta: 4,
    tags: ["posture"],
  },
];

const treatmentChoices: Choice[] = [
  {
    id: "thoracic-breathing-release",
    title: "胸郭調整と呼吸誘導で頚部負担を抜く",
    detail: "主因に直結する本命アプローチ。",
    reward: "改善度が大きく伸びる",
    category: "treatment",
    tone: "insight",
    trustDelta: 6,
    accuracyDelta: 16,
    tags: ["thoracic", "breathing"],
  },
  {
    id: "hip-and-rib-chain",
    title: "股関節前面と肋骨の連動を整える",
    detail: "副因まで含めて扱う堅実な選択。",
    reward: "改善の再現性が上がる",
    category: "treatment",
    tone: "support",
    trustDelta: 5,
    accuracyDelta: 12,
    tags: ["hip", "thoracic"],
  },
  {
    id: "neck-massage",
    title: "首肩を中心にその場で緩める",
    detail: "手応えは出るが、戻りやすい。",
    reward: "直後の楽さは感じやすい",
    category: "treatment",
    tone: "direct",
    trustDelta: 4,
    accuracyDelta: -2,
    tags: ["surface"],
  },
  {
    id: "strong-adjustment",
    title: "強めの矯正感で変化を狙う",
    detail:
      "印象は強いが、今回の患者にはやや不安を残しやすい。",
    reward: "効いた感は出やすい",
    category: "treatment",
    tone: "direct",
    trustDelta: -4,
    accuracyDelta: 2,
    tags: ["surface"],
  },
  {
    id: "rest-advice-only",
    title: "施術はせず休息アドバイスに留める",
    detail: "安全だが、ゲーム体験としては弱い。",
    reward: "丁寧さはある",
    category: "treatment",
    tone: "safe",
    trustDelta: 2,
    accuracyDelta: -4,
    tags: ["safety"],
  },
];

const explanationChoices: Choice[] = [
  {
    id: "shared-hypothesis",
    title: "今の状態を一緒に整理し、仮説として伝える",
    detail: "患者が納得しやすく、信頼が伸びる。",
    reward: "整体的な価値が伝わる",
    category: "explanation",
    tone: "support",
    trustDelta: 14,
    accuracyDelta: 4,
    tags: ["trust"],
  },
  {
    id: "quick-fix-talk",
    title: "とにかく楽にしますと即効性だけを強調する",
    detail: "短期の期待は上がるが、理解は残りにくい。",
    reward: "話は早い",
    category: "explanation",
    tone: "direct",
    trustDelta: 1,
    accuracyDelta: -1,
    tags: ["surface"],
  },
  {
    id: "technical-jargon",
    title: "専門用語多めで説明する",
    detail:
      "正しそうに聞こえるが、今回のMVP方針とは逆行しやすい。",
    reward: "知識量は感じる",
    category: "explanation",
    tone: "safe",
    trustDelta: -8,
    accuracyDelta: 0,
    tags: ["trust"],
  },
];

export const choiceBlocksByPhase = {
  interview: [
    {
      title: "問診",
      helper:
        "8つの候補から3つ。背景に近づく質問ほど、見立て精度が伸びる。",
      limit: 3,
      category: "interview",
      choices: interviewChoices,
    },
  ],
  hypothesis: [
    {
      title: "第一仮説",
      helper: "もっとも有力な仮説を1つ選ぶ。",
      limit: 1,
      category: "hypothesisPrimary",
      choices: hypothesisChoices.filter(
        (choice) => choice.category === "hypothesisPrimary",
      ),
    },
    {
      title: "補助仮説",
      helper: "補助線になる仮説を1つ選ぶ。",
      limit: 1,
      category: "hypothesisSupport",
      choices: hypothesisChoices.filter(
        (choice) => choice.category === "hypothesisSupport",
      ),
    },
  ],
  evaluation: [
    {
      title: "評価",
      helper: "仮説を確かめる評価を2つ選ぶ。",
      limit: 2,
      category: "evaluation",
      choices: evaluationChoices,
    },
  ],
  treatment: [
    {
      title: "施術方針",
      helper: "もっとも手応えが出る介入を1つ選ぶ。",
      limit: 1,
      category: "treatment",
      choices: treatmentChoices,
    },
    {
      title: "説明方針",
      helper: "患者が納得できる伝え方を1つ選ぶ。",
      limit: 1,
      category: "explanation",
      choices: explanationChoices,
    },
  ],
} satisfies Record<Exclude<PhaseId, "result">, PhaseChoiceBlock[]>;

const allChoices = [
  ...interviewChoices,
  ...hypothesisChoices,
  ...evaluationChoices,
  ...treatmentChoices,
  ...explanationChoices,
];

export function getChoiceBlocksForPhase(phase: PhaseId) {
  if (phase === "result") {
    return [];
  }

  return choiceBlocksByPhase[phase];
}

export function getChoiceById(id: string): Choice | undefined {
  return allChoices.find((choice) => choice.id === id);
}

export function getGameplayStage(phase: Exclude<PhaseId, "result">) {
  return gameplayStageByPhase[phase];
}

export function deriveOutcome(selectedIds: string[]) {
  const has = (id: string) => selectedIds.includes(id);

  const trustBase =
    60 +
    (has("red-flags") ? 8 : 0) +
    (has("shared-hypothesis") ? 16 : 0) +
    (has("technical-jargon") ? -10 : 0) +
    (has("strong-adjustment") ? -6 : 0);

  const accuracyBase =
    (has("breathing-stress") ? 12 : 0) +
    (has("desk-posture") ? 10 : 0) +
    (has("thoracic-breathing") ? 24 : 0) +
    (has("hip-posture") ? 12 : 0) +
    (has("thoracic-rotation-test") ? 18 : 0) +
    (has("breathing-observation") ? 16 : 0) +
    (has("hip-extension-test") ? 10 : 0) +
    (has("local-neck") ? -8 : 0);

  const symptomBase =
    20 +
    (has("thoracic-breathing-release") ? 40 : 0) +
    (has("hip-and-rib-chain") ? 26 : 0) +
    (has("neck-massage") ? 16 : 0) +
    (has("rest-advice-only") ? 4 : 0) +
    (has("strong-adjustment") ? 8 : 0);

  const trust = Math.max(0, Math.min(100, trustBase));
  const accuracy = Math.max(0, Math.min(100, accuracyBase));
  const symptom = Math.max(
    0,
    Math.min(
      100,
      symptomBase +
        Math.round(accuracyBase * 0.28) +
        Math.round((trustBase - 60) * 0.14),
    ),
  );

  let ending = "迷走結果";
  let summary =
    "主訴には反応できたものの、背景の見立てが浅く、改善と納得感が伸び切らなかった。";

  if (symptom >= 82 && trust >= 78 && accuracy >= 68) {
    ending = "最良結果";
    summary =
      "胸郭と呼吸を軸にした見立てが噛み合い、その場の軽さと再発しにくさの両方を感じられる着地になった。";
  } else if (symptom >= 64 && accuracy >= 48) {
    ending = "部分改善結果";
    summary =
      "改善はしっかり出たが、まだ副因の整理や説明の余白が残る。もう一段詰める余地がある。";
  } else if (symptom >= 44) {
    ending = "対症療法結果";
    summary =
      "その場では少し楽になったが、原因理解が浅く、戻りやすさを残す結果になった。";
  }

  const spotlight = [
    has("breathing-stress")
      ? "呼吸の浅さに触れたことで、症状の背景が一気に立体的になった。"
      : "呼吸や胸郭への視点が薄く、見立ての軸がぼやけた。",
    has("thoracic-rotation-test")
      ? "胸椎回旋の評価が、仮説と施術をつなぐ要になった。"
      : "仮説を検証する評価が弱く、選択の説得力が伸びにくかった。",
    has("shared-hypothesis")
      ? "患者と仮説を共有したことで、信頼度が安定した。"
      : "説明が一方向になり、納得感を取りこぼした。",
  ];

  const misses = [
    has("hip-posture") || has("hip-extension-test")
      ? "座位姿勢と股関節前面の硬さを補助線として拾えた。"
      : "股関節前面と座位姿勢の影響を拾えると、さらに再発予防まで届きやすい。",
    has("red-flags")
      ? "安全確認を先に置けたことで、整体的な丁寧さが出た。"
      : "安全確認を最初に挟むと、一般ユーザーにも安心してもらいやすい。",
  ];

  const nextHint = has("neck-massage")
    ? "次回は首を直接ゆるめる前に、胸郭と呼吸を先に変化させてみる。"
    : "次回は評価で得た情報を、説明とセルフケア提案まで一本につなげる。";

  return {
    scores: {
      trust,
      accuracy,
      symptom,
    },
    outcome: {
      ending,
      summary,
      trustLabel: trust >= 80 ? "高い" : trust >= 60 ? "安定" : "不安定",
      accuracyLabel:
        accuracy >= 68 ? "核心に近い" : accuracy >= 42 ? "惜しい" : "浅い",
      symptomLabel:
        symptom >= 80 ? "かなり改善" : symptom >= 55 ? "一定の改善" : "限定的",
      spotlight,
      misses,
      nextHint,
    } satisfies Outcome,
  };
}
