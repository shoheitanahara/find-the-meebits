import { getLocale } from '../i18n/locale'

type EightStreetCopy = {
  title: string
  subtitle: string
  start: string
  howToPlay: string
  sound: string
  close: string
  howToBody: string[]
  loading: string
  clickToLook: string
  streetLabel: (n: number) => string
  playAgain: string
  progressHint: string
  controlsTitle: string
  controlsLines: string[]
}

const en: EightStreetCopy = {
  title: '8th Street',
  subtitle: 'Something is different.',
  start: 'Start',
  howToPlay: 'How to Play',
  sound: 'Sound',
  close: 'Close',
  howToBody: [
    'Watch the Meebits carefully.',
    'If everything looks normal, follow the alley through the next L.',
    'If something is different, turn back.',
    'Trust the street signs on the wall. Reach 8th Street.',
  ],
  loading: 'Loading the alley…',
  clickToLook: 'Click to look around · Esc to release',
  streetLabel: (n) => {
    if (n === 0) return '0th Street'
    if (n === 1) return '1st Street'
    if (n === 2) return '2nd Street'
    if (n === 3) return '3rd Street'
    return `${n}th Street`
  },
  playAgain: 'Play Again',
  progressHint: 'Look at the street sign on the wall.',
  controlsTitle: 'Controls',
  controlsLines: [
    'WASD — Move',
    'Shift — Dash',
    'Stick outer — Dash (mobile)',
    'Click — Look around',
    'Esc — Release mouse',
    'Same → keep following the L chain',
    'Different → turn back',
    'Watch the wall signs',
  ],
}

const ja: EightStreetCopy = {
  title: '8番ストリート',
  subtitle: '何かが違う。',
  start: 'スタート',
  howToPlay: '遊び方',
  sound: 'サウンド',
  close: '閉じる',
  howToBody: [
    'すれ違うMeebitsをよく見てください。',
    'いつもと同じなら、連続するLを進んでください。',
    '何かが違うなら、引き返してください。',
    '壁の看板の番号だけを頼りに、8番ストリートを目指してください。',
  ],
  loading: '路地を準備中…',
  clickToLook: 'クリックで視点操作 · Escで解除',
  streetLabel: (n) => `${n}番ストリート`,
  playAgain: 'もう一度',
  progressHint: '壁の看板を見て街の番号を確認しよう。',
  controlsTitle: '操作',
  controlsLines: [
    'WASD — 移動',
    'Shift — ダッシュ',
    'スティック外縁 — ダッシュ（スマホ）',
    'クリック — 視点',
    'Esc — 視点解除',
    '同じ → Lを連続して進む',
    '違う → 引き返す',
    '判断は壁の看板だけ',
  ],
}

export function eightStreetUi() {
  return getLocale() === 'ja' ? ja : en
}
