import type { WebGLRenderer } from 'three'
import { getLocale } from '../../i18n/locale'
import { getJstDateKey } from '../../top/dailyFeatured'
import {
  collectTodayVisitRecords,
  formatVisitTimestamp,
  type VisitPassRecord,
} from '../visitPassRecords'

/** 書き出し解像度（印刷寄りのシャープさ） */
const CARD_W = 1024
const CARD_H = 648

const MARGIN = 44
const PHOTO = 268
const PHOTO_X = MARGIN + 8
const PHOTO_Y = 152

const INK = '#1a2438'
const INK_MUTED = 'rgba(26, 36, 56, 0.55)'
const INK_FAINT = 'rgba(26, 36, 56, 0.32)'
const RULE = 'rgba(26, 36, 56, 0.18)'
const ACCENT = '#3d5a80'
const PAPER = '#f4f0e8'
const PAPER_EDGE = '#e6e0d4'

const SERIF = 'Georgia, "Times New Roman", Times, serif'
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

export type VisitPassOptions = {
  meebitNumber: number
  issuedAt?: Date
  records?: VisitPassRecord[]
}

/**
 * スタジオ Canvas から来場証明書 PNG を合成する。
 * ミュージアム会員証寄りの紙質・ヘアライン・セリフ見出し。
 */
export function composeVisitPass(
  gl: WebGLRenderer,
  options: VisitPassOptions,
): string | null {
  const source = gl.domElement
  const sw = source.width
  const sh = source.height
  if (sw < 2 || sh < 2) return null

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const locale = getLocale()
  const issuedAt = options.issuedAt ?? new Date()
  const records = options.records ?? collectTodayVisitRecords()
  const timestamp = formatVisitTimestamp(issuedAt)
  const dateKey = getJstDateKey(issuedAt)
  const serial = buildSerial(options.meebitNumber, dateKey)

  paintPaper(ctx)
  paintOuterFrame(ctx)
  paintHeader(ctx, locale)
  paintPhoto(ctx, source, sw, sh)
  paintIdentity(ctx, locale, options.meebitNumber, timestamp)
  paintRecords(ctx, locale, records)
  paintFooter(ctx, locale, serial)

  return canvas.toDataURL('image/png')
}

function paintPaper(ctx: CanvasRenderingContext2D) {
  // 外側のごく薄い影（カードの厚み）
  ctx.fillStyle = 'rgba(26, 36, 56, 0.08)'
  roundRect(ctx, 10, 12, CARD_W - 16, CARD_H - 16, 10)
  ctx.fill()

  const paper = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  paper.addColorStop(0, '#f7f3ec')
  paper.addColorStop(0.45, PAPER)
  paper.addColorStop(1, '#efe9df')
  ctx.fillStyle = paper
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 12)
  ctx.fill()

  // ごく弱い紙の粒感
  ctx.save()
  ctx.globalAlpha = 0.035
  for (let i = 0; i < 900; i += 1) {
    const x = (i * 97) % CARD_W
    const y = (i * 53) % CARD_H
    ctx.fillStyle = i % 3 === 0 ? '#1a2438' : '#ffffff'
    ctx.fillRect(x, y, 1.2, 1.2)
  }
  ctx.restore()
}

function paintOuterFrame(ctx: CanvasRenderingContext2D) {
  // 二重枠
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.25
  roundRect(ctx, 18, 18, CARD_W - 36, CARD_H - 36, 8)
  ctx.stroke()

  ctx.strokeStyle = RULE
  ctx.lineWidth = 0.75
  roundRect(ctx, 24, 24, CARD_W - 48, CARD_H - 48, 6)
  ctx.stroke()

  // 四隅のレジストレーション風マーク
  const mark = 14
  const inset = 32
  ctx.strokeStyle = INK_FAINT
  ctx.lineWidth = 1
  // TL
  ctx.beginPath()
  ctx.moveTo(inset, inset + mark)
  ctx.lineTo(inset, inset)
  ctx.lineTo(inset + mark, inset)
  ctx.stroke()
  // TR
  ctx.beginPath()
  ctx.moveTo(CARD_W - inset - mark, inset)
  ctx.lineTo(CARD_W - inset, inset)
  ctx.lineTo(CARD_W - inset, inset + mark)
  ctx.stroke()
  // BL
  ctx.beginPath()
  ctx.moveTo(inset, CARD_H - inset - mark)
  ctx.lineTo(inset, CARD_H - inset)
  ctx.lineTo(inset + mark, CARD_H - inset)
  ctx.stroke()
  // BR
  ctx.beginPath()
  ctx.moveTo(CARD_W - inset - mark, CARD_H - inset)
  ctx.lineTo(CARD_W - inset, CARD_H - inset)
  ctx.lineTo(CARD_W - inset, CARD_H - inset - mark)
  ctx.stroke()
}

function paintHeader(ctx: CanvasRenderingContext2D, locale: 'en' | 'ja') {
  const brand = 'Meebits Park'
  const pass = locale === 'ja' ? '来場証明書' : 'Visitor Pass'
  const district =
    locale === 'ja' ? 'カルチャー地区 · フォトブース' : 'Culture District · Photo Booth'

  // ブランドは小さく上に
  ctx.fillStyle = ACCENT
  ctx.font = `600 11px ${SANS}`
  ctx.fillText(brand.toUpperCase(), MARGIN + 4, 52)

  // 書類名を主役に
  ctx.fillStyle = INK
  if (locale === 'ja') {
    ctx.font = `700 36px ${SANS}`
  } else {
    ctx.font = `italic 40px ${SERIF}`
  }
  ctx.fillText(pass, MARGIN + 4, 92)

  // アクセントの短いアンダーライン
  const passWidth = ctx.measureText(pass).width
  ctx.fillStyle = ACCENT
  ctx.fillRect(MARGIN + 4, 100, Math.min(72, passWidth * 0.35), 3)

  ctx.strokeStyle = RULE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(MARGIN + 4, 116)
  ctx.lineTo(CARD_W - MARGIN - 4, 116)
  ctx.stroke()

  ctx.fillStyle = INK_MUTED
  ctx.font = `500 12px ${SANS}`
  ctx.fillText(district, MARGIN + 4, 136)
}

function paintPhoto(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  sw: number,
  sh: number,
) {
  const side = Math.min(sw, sh)
  const sx = Math.floor((sw - side) / 2)
  const sy = Math.floor((sh - side) / 2)

  // 写真マット
  ctx.fillStyle = PAPER_EDGE
  ctx.fillRect(PHOTO_X - 10, PHOTO_Y - 10, PHOTO + 20, PHOTO + 20)

  ctx.fillStyle = '#0a0e14'
  ctx.fillRect(PHOTO_X - 1, PHOTO_Y - 1, PHOTO + 2, PHOTO + 2)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, side, side, PHOTO_X, PHOTO_Y, PHOTO, PHOTO)

  // 細い内側ライン
  ctx.strokeStyle = 'rgba(244, 240, 232, 0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(PHOTO_X + 0.5, PHOTO_Y + 0.5, PHOTO - 1, PHOTO - 1)
}

function paintIdentity(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  meebitNumber: number,
  timestamp: string,
) {
  const textX = PHOTO_X + PHOTO + 48
  const colW = CARD_W - textX - MARGIN - 8
  const idLabel = locale === 'ja' ? 'Meebit 番号' : 'Meebit ID'
  const issuedLabel = locale === 'ja' ? '来場日時' : 'Date of visit'
  const zoneLabel = locale === 'ja' ? 'タイムゾーン' : 'Timezone'
  const idValue = String(meebitNumber).padStart(5, '0')

  // フィールドブロック
  drawField(ctx, textX, PHOTO_Y + 8, colW, idLabel, `#${idValue}`, 36)
  drawField(ctx, textX, PHOTO_Y + 108, colW, issuedLabel, timestamp, 22)
  drawField(ctx, textX, PHOTO_Y + 188, colW * 0.45, zoneLabel, 'JST (UTC+9)', 18)

  // 右下の静かな印章（回転スタンプは使わない）
  const sealX = CARD_W - MARGIN - 72
  const sealY = PHOTO_Y + PHOTO - 28
  ctx.save()
  ctx.strokeStyle = 'rgba(61, 90, 128, 0.35)'
  ctx.lineWidth = 1.25
  ctx.beginPath()
  ctx.arc(sealX, sealY, 36, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(sealX, sealY, 30, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = 'rgba(61, 90, 128, 0.55)'
  ctx.font = `italic 11px ${SERIF}`
  const seal = locale === 'ja' ? '確認済' : 'Verified'
  ctx.fillText(seal, sealX - ctx.measureText(seal).width / 2, sealY + 4)
  ctx.restore()
}

function drawField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  valueSize: number,
) {
  ctx.fillStyle = INK_MUTED
  ctx.font = `600 10px ${SANS}`
  ctx.fillText(label.toUpperCase(), x, y)

  ctx.strokeStyle = RULE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.lineTo(x + width, y + 8)
  ctx.stroke()

  ctx.fillStyle = INK
  ctx.font =
    valueSize >= 30
      ? `600 ${valueSize}px ${MONO}`
      : `500 ${valueSize}px ${SANS}`
  ctx.fillText(value, x, y + 8 + valueSize + 4)
}

function paintRecords(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  records: VisitPassRecord[],
) {
  const bandY = CARD_H - 148
  const bandX = MARGIN + 4
  const bandW = CARD_W - MARGIN * 2 - 8

  ctx.strokeStyle = RULE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(bandX, bandY)
  ctx.lineTo(bandX + bandW, bandY)
  ctx.stroke()

  ctx.fillStyle = INK_MUTED
  ctx.font = `600 10px ${SANS}`
  const heading = locale === 'ja' ? '本日のパーク記録' : "Today's park records"
  ctx.fillText(heading.toUpperCase(), bandX, bandY + 22)

  if (records.length === 0) {
    ctx.fillStyle = INK_FAINT
    ctx.font = `italic 14px ${SERIF}`
    const empty =
      locale === 'ja' ? '本日のプレイ記録なし' : 'No play records yet today'
    ctx.fillText(empty, bandX, bandY + 56)
    return
  }

  let rowY = bandY + 44
  for (const record of records) {
    ctx.fillStyle = INK
    ctx.font = `500 14px ${SANS}`
    ctx.fillText(record.label, bandX, rowY)
    const labelWidth = ctx.measureText(record.label).width

    const score = record.score.toLocaleString()
    ctx.font = `600 14px ${MONO}`
    const scoreW = ctx.measureText(score).width
    ctx.fillText(score, bandX + bandW - scoreW, rowY)

    ctx.strokeStyle = 'rgba(26, 36, 56, 0.12)'
    ctx.lineWidth = 1
    ctx.setLineDash([1.5, 4])
    ctx.beginPath()
    ctx.moveTo(bandX + labelWidth + 12, rowY - 4)
    ctx.lineTo(bandX + bandW - scoreW - 12, rowY - 4)
    ctx.stroke()
    ctx.setLineDash([])

    rowY += 28
  }
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  serial: string,
) {
  const y = CARD_H - 36
  ctx.fillStyle = INK_FAINT
  ctx.font = `500 9px ${MONO}`
  ctx.fillText(serial, MARGIN + 4, y)

  const note =
    locale === 'ja'
      ? '本証はMeebits Parkでの来場記録です。譲渡・改変を禁じます。'
      : 'This pass records a visit to Meebits Park. Not transferable.'
  ctx.font = `400 9px ${SANS}`
  const noteW = ctx.measureText(note).width
  ctx.fillText(note, CARD_W - MARGIN - 4 - noteW, y)
}

function buildSerial(meebitNumber: number, dateKey: string): string {
  const compact = dateKey.replaceAll('-', '')
  const id = String(meebitNumber).padStart(5, '0')
  return `MP-${compact}-${id}`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
