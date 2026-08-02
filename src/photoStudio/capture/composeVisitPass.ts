import type { WebGLRenderer } from 'three'
import { getLocale } from '../../i18n/locale'
import { getJstDateKey } from '../../top/dailyFeatured'
import {
  collectTodayVisitRecords,
  formatVisitTimestamp,
  getVisitTimezoneLabel,
} from '../visitPassRecords'
import type { VisitPassLine } from '../../park/dailyRecords'

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
  records?: VisitPassLine[]
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
  const timezoneLabel = getVisitTimezoneLabel(issuedAt)
  const dateKey = getJstDateKey(issuedAt)
  const serial = buildSerial(options.meebitNumber, dateKey)

  paintPaper(ctx)
  paintOuterFrame(ctx)
  paintHeader(ctx, locale)
  paintPhoto(ctx, source, sw, sh)
  paintIdentity(ctx, locale, options.meebitNumber, timestamp, timezoneLabel)
  paintRecords(ctx, locale, records)
  paintFooter(ctx, serial)

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
  const pass = 'Visitor Pass'
  const district =
    locale === 'ja' ? 'カルチャー地区 · フォトブース' : 'Culture District · Photo Booth'

  // ブランドは小さく上に
  ctx.fillStyle = ACCENT
  ctx.font = `600 11px ${SANS}`
  ctx.fillText(brand.toUpperCase(), MARGIN + 4, 52)

  // 書類名は常に英語表記
  ctx.fillStyle = INK
  ctx.font = `italic 40px ${SERIF}`
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
  timezoneLabel: string,
) {
  const textX = PHOTO_X + PHOTO + 48
  const colW = CARD_W - textX - MARGIN - 8
  const idLabel = 'Meebit ID'
  const issuedLabel = locale === 'ja' ? '来場日時' : 'Date of visit'
  const zoneLabel = locale === 'ja' ? 'タイムゾーン' : 'Timezone'
  const idValue = String(meebitNumber).padStart(5, '0')

  drawField(ctx, textX, PHOTO_Y + 8, colW, idLabel, `#${idValue}`, 36)
  drawField(ctx, textX, PHOTO_Y + 108, colW, issuedLabel, timestamp, 22)
  drawField(ctx, textX, PHOTO_Y + 188, colW * 0.72, zoneLabel, timezoneLabel, 18)

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
  const seal = 'Verified'
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
  records: VisitPassLine[],
) {
  const count = records.length
  if (count === 0) return

  const footerTop = CARD_H - 52
  /** 写真マット下端より下に収める */
  const photoBottom = PHOTO_Y + PHOTO + 18
  const maxBandH = Math.max(80, footerTop - photoBottom - 6)
  const layout = planRecordsLayout(count, maxBandH)

  const headingH = 28
  const bandH = headingH + layout.rows * layout.rowH + 6
  const bandY = footerTop - bandH
  const bandX = MARGIN + 4
  const bandW = CARD_W - MARGIN * 2 - 8

  ctx.strokeStyle = RULE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(bandX, bandY)
  ctx.lineTo(bandX + bandW, bandY)
  ctx.stroke()

  ctx.fillStyle = INK_MUTED
  ctx.font = `600 9px ${SANS}`
  const heading = locale === 'ja' ? '本日のパーク記録' : "Today's park records"
  ctx.fillText(heading.toUpperCase(), bandX, bandY + 16)

  const colGap = layout.cols >= 4 ? 12 : layout.cols === 3 ? 16 : 20
  const gridTop = bandY + headingH
  const colW = (bandW - colGap * (layout.cols - 1)) / layout.cols
  const labelFont = `500 ${layout.fontSize}px ${SANS}`
  const detailFontFilled = `600 ${layout.fontSize}px ${MONO}`
  const detailFontEmpty = `500 ${layout.fontSize}px ${MONO}`

  records.forEach((record, index) => {
    const col = Math.floor(index / layout.rows)
    const row = index % layout.rows
    if (col >= layout.cols) return

    const x = bandX + col * (colW + colGap)
    const y = gridTop + row * layout.rowH + layout.fontSize

    ctx.fillStyle = record.filled ? INK_MUTED : INK_FAINT
    ctx.font = labelFont
    ctx.fillText(record.label, x, y)
    const labelWidth = ctx.measureText(record.label).width

    ctx.fillStyle = record.filled ? INK : INK_FAINT
    ctx.font = record.filled ? detailFontFilled : detailFontEmpty
    const detailW = ctx.measureText(record.detail).width
    ctx.fillText(record.detail, x + colW - detailW, y)

    if (record.filled && colW - detailW - labelWidth > 24) {
      ctx.strokeStyle = 'rgba(26, 36, 56, 0.1)'
      ctx.lineWidth = 1
      ctx.setLineDash([1, 3])
      ctx.beginPath()
      ctx.moveTo(x + labelWidth + 8, y - 3)
      ctx.lineTo(x + colW - detailW - 8, y - 3)
      ctx.stroke()
      ctx.setLineDash([])
    }
  })
}

/**
 * 件数に応じて列数を増やし、写真〜フッター間に収まる行高・文字サイズを決める。
 * 正式名称を省略しない前提で、まず 2 列 → 足りなければ 3 → 4 列。
 */
function planRecordsLayout(count: number, maxBandH: number) {
  const headingH = 28
  const padding = 6
  const usable = Math.max(40, maxBandH - headingH - padding)
  const minRowH = 14
  const maxRowH = 22

  for (const cols of [2, 3, 4] as const) {
    const rows = Math.max(1, Math.ceil(count / cols))
    const rowH = usable / rows
    if (rowH >= minRowH) {
      const clamped = Math.min(maxRowH, rowH)
      return {
        cols,
        rows,
        rowH: clamped,
        fontSize: clamped >= 19 ? 11 : clamped >= 16 ? 10 : 9,
      }
    }
  }

  const cols = 4
  const rows = Math.max(1, Math.ceil(count / cols))
  const rowH = Math.max(12, usable / rows)
  return {
    cols,
    rows,
    rowH,
    fontSize: rowH >= 15 ? 9 : 8,
  }
}

function paintFooter(ctx: CanvasRenderingContext2D, serial: string) {
  const y = CARD_H - 28

  ctx.strokeStyle = RULE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(MARGIN + 4, y - 14)
  ctx.lineTo(CARD_W - MARGIN - 4, y - 14)
  ctx.stroke()

  ctx.fillStyle = INK_FAINT
  ctx.font = `500 9px ${MONO}`
  ctx.fillText(serial, MARGIN + 4, y)

  const note = 'This pass records a visit to Meebits Park. Not transferable.'
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
