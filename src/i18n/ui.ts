import { getLocale, type Locale } from './locale'

type UiMessages = {
  prototype: string
  title: string
  museumHunt: string
  afterHours: string
  museum: string
  club: string
  gameMode: string
  challenge: string
  enjoy: string
  challengeDesc: string
  enjoyDesc: string
  target: string
  targets: string
  yourMeebit: string
  random: string
  startVenue: (venue: string) => string
  backToMuseum: string
  enterAfterHours: string
  meebitsInVenue: (count: number, venue: string) => string
  defaultMeebitRange: (id: number) => string
  you: string
  youHash: (n: number) => string
  move: string
  inspect: string
  next: string
  autoRun: string
  escClose: string
  pressEInspect: string
  inspectAction: string
  retry: string
  retryStage: string
  titleBtn: string
  tips: string
  beforeStart: string
  tipsMuseumLead: string
  tipsClubLead: string
  tipsControls: string
  gotIt: string
  preparingStage: string
  nearbyMeebits: (ready: number, total: number, meters: number) => string
  preloading: (ready: number, total: number, meters: number) => string
  timerStarts: string
  noTimerReady: string
  loading: string
  loadingMuseum: string
  loadingClub: string
  loadingAvatar: string
  startingSoon: string
  timeLeft: string
  timeUp: string
  clearTime: string
  timeLimit: string
  stage: string
  stageN: (n: number) => string
  semifinal: string
  final: string
  grandFinal: string
  lastCall: string
  afterHoursN: (n: number) => string
  findTargetsAmong: (targets: number, npcs: number) => string
  findAllTargetsAmong: (targets: number, npcs: number) => string
  findOneTarget: (npcs: number) => string
  progressionMuseum: (first: number, last: number, challenge: number) => string
  progressionClub: (counts: string, max: number) => string
  answer: string
  answerReveal: string
  followGoldGlow: string
  timeUpAnswerReveal: string
  timeUpMobileHint: string
  remainingTargets: string
  correctAvatar: string
  andGlowsGold: string
  stageClear: string
  fullConquest: string
  afterHoursClear: string
  youFoundIt: string
  conqueredMuseum: string
  ownedNight: string
  finalTarget: string
  finalTargetHash: (n: number) => string
  complete: string
  nextStageLabel: string
  nextColon: (label: string, desc: string) => string
  nextStageNpcs: (n: number) => string
  conqueredMuseumBody: (n: number) => string
  conqueredClubBody: (n: number) => string
  newVenue: string
  afterHoursUnlocked: string
  returnTitleForAfterHours: string
  backToTitle: string
  nextStage: string
  clickToContinue: string
  tapToContinue: string
  unlockBody: string
  close: string
  done: string
  nextLine: string
  hint: string
  yourAvatar: string
  useThisAvatar: string
  loadErrorTitle: string
  loadErrorBody: string
  tipRedTitle: string
  tipRedMuseum: string
  tipRedClub: string
  tipNpcTitle: string
  tipNpcMuseum: string
  tipNpcClubTitle: string
  tipNpcClub: string
  tipTargetTitle: string
  tipTargetMuseum: string
  tipTargetClub: string
  langEn: string
  langJa: string
  meebitsCount: (n: number) => string
  stageWithMeebits: (stage: string, n: number) => string
  storyBrand: string
  storyGameTitle: string
  storyAbout: string
  storySetting: string
  storyMission: string
  storyPlay: string
  storyWish: string
  storyCta: string
  storySkip: string
}

const en: UiMessages = {
  prototype: 'Prototype',
  title: 'Find the Meebit',
  museumHunt: 'Meebits Museum Hunt',
  afterHours: 'After Hours',
  museum: 'Museum',
  club: 'Club',
  gameMode: 'Game Mode',
  challenge: 'Challenge',
  enjoy: 'Enjoy',
  challengeDesc: '3 min/stage. Clear all 8.',
  enjoyDesc: 'No timer. Find at your pace.',
  target: 'Target',
  targets: 'Targets',
  yourMeebit: 'Your Meebit',
  random: 'Random',
  startVenue: (venue) => `Start ${venue}`,
  backToMuseum: 'Back to Museum',
  enterAfterHours: 'Enter After Hours',
  meebitsInVenue: (count, venue) => `${count} Meebits in the ${venue}`,
  defaultMeebitRange: (id) => `#${id} default · 1–20000`,
  you: 'You',
  youHash: (n) => `You #${n}`,
  move: 'WASD: Move',
  inspect: 'E: Talk',
  next: 'Enter: Next',
  autoRun: 'Auto Run: On',
  escClose: 'Esc: Close',
  pressEInspect: 'Press E to talk',
  inspectAction: 'Talk',
  retry: 'Retry',
  retryStage: 'Retry Stage',
  titleBtn: 'Title',
  tips: 'Tips',
  beforeStart: 'Before you start',
  tipsMuseumLead: 'A few tips for the museum.',
  tipsClubLead: 'A few tips for After Hours.',
  tipsControls: 'PC: Press E near a Meebit to talk · Mobile: tap Talk',
  gotIt: 'Got it',
  preparingStage: 'Preparing Stage',
  nearbyMeebits: (ready, total, meters) => `Nearby: ${ready}/${total} (within ${meters}m)`,
  preloading: (ready, total, meters) => `Preload: ${ready}/${total} (within ${meters}m)`,
  timerStarts: 'Timer starts when nearby avatars are ready.',
  noTimerReady: 'No timer — start when nearby avatars are ready.',
  loading: 'Loading',
  loadingMuseum: 'Loading the museum',
  loadingClub: 'Loading the club',
  loadingAvatar: 'Loading your Meebit...',
  startingSoon: 'Starting Soon',
  timeLeft: 'Time Left',
  timeUp: 'Time Up',
  clearTime: 'Clear Time',
  timeLimit: 'Time Limit',
  stage: 'Stage',
  stageN: (n) => `Stage ${n}`,
  semifinal: 'Semifinal',
  final: 'Final',
  grandFinal: 'Grand Final',
  lastCall: 'Last Call',
  afterHoursN: (n) => `After Hours ${n}`,
  findTargetsAmong: (targets, npcs) => `Find ${targets} among ${npcs} Meebits`,
  findAllTargetsAmong: (targets, npcs) => `Find all ${targets} among ${npcs} Meebits`,
  findOneTarget: (npcs) => `${npcs} Meebits · find 1`,
  progressionMuseum: (first, last, challenge) =>
    `${first}–${last} ×5, then Semi(2)/Final(3)/Grand(5) at ${challenge}`,
  progressionClub: (counts, max) =>
    `${counts} (2 targets), then ${max}×3, Last Call×5`,
  answer: 'Answer',
  answerReveal: 'Answer reveal',
  followGoldGlow: 'Follow the gold glow.',
  timeUpAnswerReveal: 'Time Up · Answer',
  timeUpMobileHint: 'glow gold. Go find them.',
  remainingTargets: 'Remaining:',
  correctAvatar: 'Answer:',
  andGlowsGold: 'Gold glow marks them. WASD to move.',
  stageClear: 'Stage Clear',
  fullConquest: 'Full Conquest',
  afterHoursClear: 'After Hours Clear',
  youFoundIt: 'You found it.',
  conqueredMuseum: 'You conquered the museum.',
  ownedNight: 'You owned the night.',
  finalTarget: 'Final Target',
  finalTargetHash: (n) => `Final #${n}`,
  complete: 'Complete',
  nextStageLabel: 'Next Stage',
  nextColon: (label, desc) => `Next: ${label} — ${desc}`,
  nextStageNpcs: (n) => `Next: ${n} Meebits.`,
  conqueredMuseumBody: (n) => `Cleared Semi, Final, Grand Final at ${n} Meebits.`,
  conqueredClubBody: (n) => `Cleared all 5 After Hours stages. Last Call at ${n}.`,
  newVenue: 'New Venue',
  afterHoursUnlocked: 'After Hours Unlocked!',
  returnTitleForAfterHours: 'Back to title to enter After Hours.',
  backToTitle: 'Back to Title',
  nextStage: 'Next Stage',
  clickToContinue: 'Click to continue',
  tapToContinue: 'Tap to continue',
  unlockBody: 'Museum clear. Hunt under the club lights.',
  close: 'Close',
  done: 'Done',
  nextLine: 'Next',
  hint: 'Hint',
  yourAvatar: 'Your Avatar',
  useThisAvatar: 'Use Avatar',
  loadErrorTitle: 'Could not load this Meebit.',
  loadErrorBody: 'Using placeholder. Check VRM path or network.',
  tipRedTitle: 'Red marker',
  tipRedMuseum: 'Walk up. Red dot = talk.',
  tipRedClub: 'Walk up on the floor. Red dot = talk.',
  tipNpcTitle: 'Friendly NPCs',
  tipNpcMuseum: 'Chat often — someone may drop a hint.',
  tipNpcClubTitle: 'Club crowd',
  tipNpcClub: 'Chat near bar, DJ, or VIP for hints.',
  tipTargetTitle: 'Find your target',
  tipTargetMuseum: 'Match the corner preview. Keep talking.',
  tipTargetClub: 'Match the corner preview. Keep moving.',
  langEn: 'EN',
  langJa: '日本語',
  meebitsCount: (n) => `${n} Meebits`,
  stageWithMeebits: (stage, n) => `${stage} / ${n} Meebits`,
  storyBrand: 'Meebits',
  storyGameTitle: 'Find the Meebit',
  storyAbout:
    'Meebits are a collection of 20,000 generative voxel avatars — digital sculptures built for a three-dimensional internet.',
  storySetting: 'Tonight, a crowd of them fills the museum.',
  storyMission: 'Somewhere in that crowd is your target. Just one.',
  storyPlay: 'Talk to strangers. Chase the hints. Find them before time runs out.',
  storyWish: 'Hope you find a favorite of your own among the 20,000.',
  storyCta: 'Continue',
  storySkip: 'Skip',
}

const ja: UiMessages = {
  prototype: 'プロトタイプ',
  title: 'Find the Meebit',
  museumHunt: 'Meebits Museum Hunt',
  afterHours: 'After Hours',
  museum: 'Museum',
  club: 'Club',
  gameMode: 'モード',
  challenge: 'チャレンジ',
  enjoy: 'のんびり',
  challengeDesc: '1ステージ3分。全ステージのクリアを目指す。',
  enjoyDesc: '時間制限なし。好きなペースでターゲットを探せる。',
  target: 'ターゲット',
  targets: 'ターゲット',
  yourMeebit: 'あなたのMeebit',
  random: 'ランダム',
  startVenue: (venue) => `${venue}を開始`,
  backToMuseum: 'Museumへ戻る',
  enterAfterHours: 'After Hoursへ',
  meebitsInVenue: (count, venue) => `${venue}に${count}体`,
  defaultMeebitRange: (id) => `デフォルト #${id} · 1–20000`,
  you: 'あなた',
  youHash: (n) => `あなた #${n}`,
  move: 'WASD: 移動',
  inspect: 'E: 話す',
  next: 'Enter: 次へ',
  autoRun: '自動ダッシュ: ON',
  escClose: 'Esc: 閉じる',
  pressEInspect: 'Eで話す',
  inspectAction: '話す',
  retry: 'リトライ',
  retryStage: 'リトライ',
  titleBtn: 'タイトル',
  tips: 'ヒント',
  beforeStart: 'はじめる前に',
  tipsMuseumLead: 'ターゲットを見つけるための基本操作とヒントです。',
  tipsClubLead: 'After Hoursでターゲットを見つけるためのヒントです。',
  tipsControls: 'PCでは近くのMeebitにEキーで話しかけます。スマホでは「話す」をタップしてください。',
  gotIt: 'わかった',
  preparingStage: '準備中',
  nearbyMeebits: (ready, total, meters) => `近く: ${ready}/${total}（${meters}m以内）`,
  preloading: (ready, total, meters) => `読込: ${ready}/${total}（${meters}m以内）`,
  timerStarts: '近くにいるアバターの準備が完了すると、タイマーが始まります。',
  noTimerReady: '近くにいるアバターの準備が完了すると、探索を始められます。時間制限はありません。',
  loading: '読込中',
  loadingMuseum: 'Museumを準備中',
  loadingClub: 'Clubを準備中',
  loadingAvatar: 'あなたのMeebitを読込中…',
  startingSoon: 'まもなく',
  timeLeft: '残り時間',
  timeUp: 'タイムアップ',
  clearTime: 'クリアタイム',
  timeLimit: '制限時間',
  stage: 'ステージ',
  stageN: (n) => `ステージ ${n}`,
  semifinal: 'セミファイナル',
  final: 'ファイナル',
  grandFinal: 'グランドファイナル',
  lastCall: 'ラストコール',
  afterHoursN: (n) => `After Hours ${n}`,
  findTargetsAmong: (targets, npcs) => `${npcs}体のMeebitからターゲットを${targets}体見つけよう`,
  findAllTargetsAmong: (targets, npcs) => `${npcs}体のMeebitからターゲット${targets}体すべてを見つけよう`,
  findOneTarget: (npcs) => `${npcs}体のMeebitからターゲットを1体見つけよう`,
  progressionMuseum: (first, last, challenge) =>
    `ステージ1〜5は${first}〜${last}体から1体を探します。その後は${challenge}体の中から、セミファイナルで2体・ファイナルで3体・グランドファイナルで5体を探します`,
  progressionClub: (counts, max) =>
    `ステージ1〜3では${counts}体の中から2体、ステージ4では${max}体の中から3体、最後のラストコールでは5体を探します`,
  answer: '正解',
  answerReveal: '正解発表',
  followGoldGlow: '金色の光を追え。',
  timeUpAnswerReveal: 'タイムアップ · 正解',
  timeUpMobileHint: 'が金色に光る。探そう。',
  remainingTargets: '残り:',
  correctAvatar: '正解:',
  andGlowsGold: '金色に光る。WASDで移動。',
  stageClear: 'ステージクリア',
  fullConquest: '全制覇',
  afterHoursClear: 'After Hours クリア',
  youFoundIt: '見つけた！',
  conqueredMuseum: 'Museumを制覇した。',
  ownedNight: '夜を制した。',
  finalTarget: '最終ターゲット',
  finalTargetHash: (n) => `最終 #${n}`,
  complete: '完了',
  nextStageLabel: '次のステージ',
  nextColon: (label, desc) => `次: ${label} — ${desc}`,
  nextStageNpcs: (n) => `次: ${n}体。`,
  conqueredMuseumBody: (n) => `セミファイナル、ファイナル、グランドファイナル（${n}体）をクリア。`,
  conqueredClubBody: (n) => `After Hours全5クリア。ラストコール ${n}体。`,
  newVenue: '新会場',
  afterHoursUnlocked: 'After Hours 解放！',
  returnTitleForAfterHours: 'タイトルからAfter Hoursへ。',
  backToTitle: 'タイトルへ',
  nextStage: '次へ',
  clickToContinue: 'クリックで続く',
  tapToContinue: 'タップで続く',
  unlockBody: 'Museum制覇。クラブで探そう。',
  close: '閉じる',
  done: '完了',
  nextLine: '次へ',
  hint: 'ヒント',
  yourAvatar: '使用中',
  useThisAvatar: '使う',
  loadErrorTitle: 'Meebitを読めませんでした。',
  loadErrorBody: '仮アバター表示中。VRMや通信を確認。',
  tipRedTitle: '赤いマーカー',
  tipRedMuseum: 'Meebitに近づくと、頭上に赤い点が表示されます。赤い点が出ている相手には話しかけられます。',
  tipRedClub: 'フロアにいるMeebitへ近づくと、頭上に赤い点が表示されます。赤い点が出ている相手には話しかけられます。',
  tipNpcTitle: 'Meebitと会話する',
  tipNpcMuseum: 'Meebitには積極的に話しかけてみましょう。ターゲットの居場所についてヒントをくれることがあります。',
  tipNpcClubTitle: 'クラブのMeebitと会話する',
  tipNpcClub: 'バー、DJブース、VIPラウンジの近くにいるMeebitは、ターゲットのヒントを知っているかもしれません。',
  tipTargetTitle: 'ターゲットを探す',
  tipTargetMuseum: '画面右上に表示されるターゲット画像とMeebit番号を見比べて、同じアバターを見つけてください。',
  tipTargetClub: '画面右上に表示されるターゲット画像とMeebit番号を見比べて、同じアバターを見つけてください。',
  langEn: 'EN',
  langJa: '日本語',
  meebitsCount: (n) => `${n} Meebits`,
  stageWithMeebits: (stage, n) => `${stage} / ${n} Meebits`,
  storyBrand: 'Meebits',
  storyGameTitle: 'Find the Meebit',
  storyAbout:
    'Meebitsは、アルゴリズムで生まれた20,000体のボクセルアバター。デジタル時代のための、動く彫刻のコレクションです。',
  storySetting: '今夜、美術館には大勢のMeebitsが溢れています。',
  storyMission: 'その中のターゲットは、ただ一人。',
  storyPlay: '話しかけて、ヒントを集めて、走り回って見つけよう。',
  storyWish: '20,000体の中から、あなたのお気に入りが見つかるといいね。',
  storyCta: 'つづける',
  storySkip: 'スキップ',
}

const catalogs: Record<Locale, UiMessages> = { en, ja }

export function ui(): UiMessages {
  return catalogs[getLocale()]
}

export type { UiMessages }
