import { getLocale } from '../i18n/locale'

type PhotoStudioCopy = {
  title: string
  subtitle: string
  storyLine: string
  play: string
  rulesTitle: string
  controls: string
  meebitId: string
  meebitHint: string
  applyId: string
  background: string
  pose: string
  framing: string
  cameraAngle: string
  brightness: string
  dragHint: string
  resetRotation: string
  capture: string
  downloading: string
  issuePass: string
  issuingPass: string
  backSetup: string
}

const en: PhotoStudioCopy = {
  title: 'Photo Booth',
  subtitle: 'PFP & visit pass',
  storyLine: 'Shoot a clean square PFP, then issue today’s Meebits Park visit pass.',
  play: 'Enter booth',
  rulesTitle: 'Photo Booth',
  controls: 'Change Meebit ID if you want, then shoot with soft studio lighting.',
  meebitId: 'Meebit ID',
  meebitHint: '1 – 20,000',
  applyId: 'Use this ID',
  background: 'Background',
  pose: 'Pose',
  framing: 'Framing',
  cameraAngle: 'Camera',
  brightness: 'Brightness',
  dragHint: 'Drag left/right to rotate',
  resetRotation: 'Reset rotation',
  capture: 'Capture PFP',
  downloading: 'Saving…',
  issuePass: 'Issue Visit Pass',
  issuingPass: 'Issuing…',
  backSetup: 'Change Meebit',
}

const ja: PhotoStudioCopy = {
  title: 'フォトブース',
  subtitle: 'PFPと来場証明書',
  storyLine: 'きれいな正方形PFPを撮って、今日のミービッツ・パーク来場証明書を発行しよう。',
  play: 'ブースへ',
  rulesTitle: 'フォトブース',
  controls: '必要ならMeebit IDを変えてから、スタジオ照明で撮影。',
  meebitId: 'Meebit ID',
  meebitHint: '1 ～ 20,000',
  applyId: 'このIDを使う',
  background: '背景',
  pose: 'ポーズ',
  framing: '構図',
  cameraAngle: 'カメラ',
  brightness: '明るさ',
  dragHint: '左右ドラッグで回転',
  resetRotation: '回転をリセット',
  capture: 'PFPを撮影',
  downloading: '保存中…',
  issuePass: '来場証明書を発行',
  issuingPass: '発行中…',
  backSetup: 'Meebitを変更',
}

export function photoStudioUi() {
  return getLocale() === 'ja' ? ja : en
}
