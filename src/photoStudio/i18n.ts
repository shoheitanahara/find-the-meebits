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
  mugColor: string
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
  subtitle: 'You were here.',
  storyLine: 'One square. Proof you came.',
  play: 'Enter booth',
  rulesTitle: 'Photo Booth',
  controls: 'Change Meebit ID if you want, then shoot with soft studio lighting.',
  meebitId: 'Meebit ID',
  meebitHint: '1 – 20,000',
  applyId: 'Use this ID',
  background: 'Background',
  pose: 'Pose',
  mugColor: 'Mug',
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
  subtitle: '来た証明。',
  storyLine: '一枚撮って、来た証明。',
  play: 'ブースへ',
  rulesTitle: 'フォトブース',
  controls: '必要ならMeebit IDを変えてから、スタジオ照明で撮影。',
  meebitId: 'Meebit ID',
  meebitHint: '1 ～ 20,000',
  applyId: 'このIDを使う',
  background: '背景',
  pose: 'ポーズ',
  mugColor: 'マグ',
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
