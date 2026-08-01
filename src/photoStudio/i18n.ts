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
  downloadAgain: string
  backSetup: string
}

const en: PhotoStudioCopy = {
  title: 'PFP Studio',
  subtitle: 'Square profile shots',
  storyLine: 'Pick a background and pose, then export a clean square PFP.',
  play: 'Enter studio',
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
  downloadAgain: 'Download again',
  backSetup: 'Change Meebit',
}

const ja: PhotoStudioCopy = {
  title: 'PFPスタジオ',
  subtitle: '正方形プロフィール写真',
  storyLine: '背景とポーズを選んで、きれいな正方形PFPを書き出そう。',
  play: 'スタジオへ',
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
  downloadAgain: 'もう一度ダウンロード',
  backSetup: 'Meebitを変更',
}

export function photoStudioUi() {
  return getLocale() === 'ja' ? ja : en
}
