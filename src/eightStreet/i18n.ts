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
  controlsLinesPc: string[]
  controlsLinesMobile: string[]
  wallRulesTitle: string
  wallRules: string[]
  clearedEyebrow: string
  clearedHeadline: string
  clearedBody: string
  clearTime: string
  mistakes: string
}

const en: EightStreetCopy = {
  title: '8th Street',
  subtitle: 'Something is different.',
  start: 'Start',
  howToPlay: 'How to Play',
  sound: 'Sound',
  close: 'Close',
  howToBody: [
    '1. Remember the familiar Meebits.',
    '2. If you see an unfamiliar Meebit, turn back immediately.',
    '3. If all the Meebits look familiar, do not turn back.',
    '4. Reach the house on 8th Street.',
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
  controlsLinesPc: [
    'WASD — Move',
    'Shift — Dash',
    'Click — Look around',
    'Esc — Release mouse',
  ],
  controlsLinesMobile: [
    'Stick — Move (turns to face)',
    'Stick outer — Dash',
    'Drag screen — Look',
  ],
  wallRulesTitle: 'How to Play — 8th Street',
  wallRules: [
    '1. Remember the familiar Meebits.',
    '2. If you see an unfamiliar Meebit, turn back immediately.',
    '3. If all the Meebits look familiar, do not turn back.',
    '4. Reach the house on 8th Street.',
  ],
  clearedEyebrow: 'Stage Clear',
  clearedHeadline: 'Finally made it home.',
  clearedBody: 'You walked every street and reached the house on 8th Street.',
  clearTime: 'Clear Time',
  mistakes: 'Mistakes',
}

const ja: EightStreetCopy = {
  title: '8番ストリート',
  subtitle: '何かが違う。',
  start: 'スタート',
  howToPlay: '遊び方',
  sound: 'サウンド',
  close: '閉じる',
  howToBody: [
    '1. いつものMeebitsをよく覚えること',
    '2. 見慣れないMeebitを見つけたら、すぐに引き返すこと',
    '3. いつものMeebitsしかいなければ、引き返さないこと',
    '4. 8番ストリートの家にたどり着くこと',
  ],
  loading: '路地を準備中…',
  clickToLook: 'クリックで視点操作 · Escで解除',
  streetLabel: (n) => `${n}番ストリート`,
  playAgain: 'もう一度',
  progressHint: '壁の看板を見て街の番号を確認しよう。',
  controlsTitle: '操作',
  controlsLinesPc: [
    'WASD — 移動',
    'Shift — ダッシュ',
    'クリック — 視点',
    'Esc — 視点解除',
  ],
  controlsLinesMobile: [
    'スティック — 移動（向いた方向へ）',
    'スティック外縁 — ダッシュ',
    '画面ドラッグ — 視点',
  ],
  wallRulesTitle: '＜8番ストリートの遊び方＞',
  wallRules: [
    '1. いつものMeebitsをよく覚えること',
    '2. 見慣れないMeebitを見つけたら、すぐに引き返すこと',
    '3. いつものMeebitsしかいなければ、引き返さないこと',
    '4. 8番ストリートの家にたどり着くこと',
  ],
  clearedEyebrow: 'ステージクリア',
  clearedHeadline: 'やっと家に帰れた。',
  clearedBody: 'すべての通りを歩き、8番ストリートの家にたどり着けた。',
  clearTime: 'クリアタイム',
  mistakes: '失敗',
}

export function eightStreetUi() {
  return getLocale() === 'ja' ? ja : en
}
