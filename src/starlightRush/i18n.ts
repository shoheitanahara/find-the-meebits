import { getLocale } from '../i18n/locale'
import {
  STARLIGHT_RUSH,
  type StarlightRatingId,
  type StarlightStarKindId,
} from './config'

type StarlightCopy = {
  title: string
  subtitle: string
  storyLine: string
  storyDepart: string
  storyCruise: string
  storyApproach: string
  storyLaunching: string
  storyDocking: string
  play: string
  rulesTitle: string
  controls: string
  scoreGuideTitle: string
  starKindLabels: Record<StarlightStarKindId, string>
  comboGuide: string
  ratingGuideTitle: string
  pointsOrMore: (points: number) => string
  countdown: (n: number) => string
  score: string
  combo: string
  floatCombo: (mult: number) => string
  time: string
  fire: string
  dragToAim: string
  resultEyebrow: string
  resultHeadline: string
  finalScore: string
  bestScore: string
  rating: Record<StarlightRatingId, string>
  replay: string
  exit: string
  returnAstro: string
}

const en: StarlightCopy = {
  title: 'Starlight Rush',
  subtitle: 'Stars on the rails. Hold on.',
  storyLine: 'The light doesn’t wait.',
  storyDepart: 'Departing Aurora Station',
  storyCruise: 'Open space',
  storyApproach: 'Approaching Zenith Station',
  storyLaunching: 'Launching…',
  storyDocking: 'Docking at Zenith…',
  play: 'Launch',
  rulesTitle: '90 Second Cosmic Ride',
  controls: 'Aim with the mouse or drag the screen. Fire at the center crosshair while the ship flies itself.',
  scoreGuideTitle: 'Star Colors & Points',
  starKindLabels: {
    cyan: 'Cyan',
    pink: 'Pink',
    violet: 'Violet',
    orange: 'Orange',
    gold: 'Gold (late)',
  },
  comboGuide: '5-hit combo ×1.5 · 10-hit combo ×2',
  ratingGuideTitle: 'Ride Titles',
  pointsOrMore: (points) => `${points.toLocaleString()}+ pts`,
  countdown: (n) => String(n),
  score: 'Score',
  combo: 'Combo',
  floatCombo: (mult) => `Combo x${mult}`,
  time: 'Time',
  fire: 'Fire',
  dragToAim: 'Drag to aim',
  resultEyebrow: 'Docked at Zenith',
  resultHeadline: 'Final Score',
  finalScore: 'Score',
  bestScore: 'Your Best Today',
  rating: {
    cadet: 'Cadet',
    voyager: 'Voyager',
    orbiter: 'Orbiter',
    starcatcher: 'Star Catcher',
    legend: 'Starlight Legend',
  },
  replay: 'Replay',
  exit: 'Exit',
  returnAstro: 'Back to Astro',
}

const ja: StarlightCopy = {
  title: 'スターライト・ラッシュ',
  subtitle: '星がレールを走る。つかまって。',
  storyLine: '光は待ってくれない。',
  storyDepart: 'オーロラ駅 発進',
  storyCruise: '宇宙航路',
  storyApproach: 'ゼニス駅 接近',
  storyLaunching: '発進中…',
  storyDocking: 'ゼニス駅 ドッキング…',
  play: '発進',
  rulesTitle: '90秒の宇宙ライド',
  controls: '宇宙船は自動走行。マウスまたはドラッグで照準し、中央の照準で撃とう。',
  scoreGuideTitle: '星の色と得点',
  starKindLabels: {
    cyan: 'シアン',
    pink: 'ピンク',
    violet: 'バイオレット',
    orange: 'オレンジ',
    gold: 'ゴールド（後半）',
  },
  comboGuide: '5コンボで×1.5 · 10コンボで×2',
  ratingGuideTitle: '称号',
  pointsOrMore: (points) => `${points.toLocaleString()}点以上`,
  countdown: (n) => String(n),
  score: 'スコア',
  combo: 'コンボ',
  floatCombo: (mult) => `Combo x${mult}`,
  time: '残り時間',
  fire: '撃つ',
  dragToAim: 'ドラッグで照準',
  resultEyebrow: 'ゼニス駅 到着',
  resultHeadline: '最終スコア',
  finalScore: 'スコア',
  bestScore: '今日のあなたのベスト',
  rating: {
    cadet: 'カデット',
    voyager: 'ボイジャー',
    orbiter: 'オービター',
    starcatcher: 'スターキャッチャー',
    legend: 'スターライトレジェンド',
  },
  replay: 'もう一度',
  exit: '終了',
  returnAstro: 'アストロへ戻る',
}

export function starlightRushUi() {
  return getLocale() === 'ja' ? ja : en
}

export const STARLIGHT_SCORE_ROWS = STARLIGHT_RUSH.starKinds.map((kind) => ({
  id: kind.id,
  color: kind.color,
  score: kind.score,
}))
