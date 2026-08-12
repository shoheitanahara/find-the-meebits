import { getLocale } from '../i18n/locale'
import type { ShootingRatingId } from './config'

type ShootingGalleryCopy = {
  title: string
  subtitle: string
  play: string
  rulesTitle: string
  controls: string
  scoreGuideTitle: string
  targetLabels: Record<'normal' | 'smallFast' | 'gold' | 'red', string>
  comboGuide: string
  bullseyeGuide: string
  ratingGuideTitle: string
  pointsOrMore: (points: number) => string
  countdown: (n: number) => string
  score: string
  combo: string
  floatCombo: (mult: number) => string
  floatBull: string
  time: string
  fire: string
  dragToAim: string
  resultEyebrow: string
  resultHeadline: string
  finalScore: string
  bestScore: string
  rating: Record<ShootingRatingId, string>
  replay: string
  exit: string
}

const en: ShootingGalleryCopy = {
  title: 'Shooting Gallery',
  subtitle: 'Gold sings. Red bites.',
  play: 'Play',
  rulesTitle: '45 Second Challenge',
  controls: 'Aim with the mouse, or drag the screen. Fire at the center crosshair.',
  scoreGuideTitle: 'Target Colors & Points',
  targetLabels: {
    normal: 'Standard',
    smallFast: 'Small / Fast',
    gold: 'Gold',
    red: 'Red — Avoid!',
  },
  comboGuide: '5-hit combo ×1.5 · 10-hit combo ×2',
  bullseyeGuide: 'Bullseye ×2',
  ratingGuideTitle: 'Score Titles',
  pointsOrMore: (points) => `${points.toLocaleString()}+ pts`,
  countdown: (n) => String(n),
  score: 'Score',
  combo: 'Combo',
  floatCombo: (mult) => `Combo x${mult}`,
  floatBull: 'Bull x 2',
  time: 'Time',
  fire: 'Fire',
  dragToAim: 'Drag to aim',
  resultEyebrow: 'Time Up',
  resultHeadline: 'Final Score',
  finalScore: 'Score',
  bestScore: 'Your Best Today',
  rating: {
    rookie: 'Rookie',
    goodShot: 'Good Shot',
    sharpshooter: 'Sharpshooter',
    deadeye: 'Deadeye',
    legend: 'Mountain Legend',
  },
  replay: 'Replay',
  exit: 'Exit',
}

const ja: ShootingGalleryCopy = {
  title: 'シューティングギャラリー',
  subtitle: '金は鳴る。赤は噛む。',
  play: 'プレイ',
  rulesTitle: '45秒チャレンジ',
  controls: 'マウスまたは画面ドラッグで照準を動かし、中央の照準で撃とう。',
  scoreGuideTitle: '的の色と得点',
  targetLabels: {
    normal: '通常',
    smallFast: '小さい・速い的',
    gold: 'ゴールド',
    red: 'レッド — 撃たない！',
  },
  comboGuide: '5コンボで×1.5 · 10コンボで×2',
  bullseyeGuide: '中央命中で×2',
  ratingGuideTitle: '得点と称号',
  pointsOrMore: (points) => `${points.toLocaleString()}点以上`,
  countdown: (n) => String(n),
  score: 'スコア',
  combo: 'コンボ',
  floatCombo: (mult) => `Combo x${mult}`,
  floatBull: 'Bull x 2',
  time: '残り時間',
  fire: '撃つ',
  dragToAim: 'ドラッグで照準',
  resultEyebrow: 'タイムアップ',
  resultHeadline: '最終スコア',
  finalScore: 'スコア',
  bestScore: '今日のあなたのベスト',
  rating: {
    rookie: 'ルーキー',
    goodShot: 'グッドショット',
    sharpshooter: 'シャープシューター',
    deadeye: 'デッドアイ',
    legend: 'マウンテンレジェンド',
  },
  replay: 'もう一度',
  exit: '終了',
}

export function shootingGalleryUi() {
  return getLocale() === 'ja' ? ja : en
}
