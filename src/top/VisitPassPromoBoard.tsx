import { useEffect, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'

/** public に置いた来場証サンプル（アスペクト 1024×648） */
const SAMPLE_SRC = '/photo-booth/visit-pass-sample.jpg'
const SAMPLE_ASPECT = 1024 / 648

/** 看板テクスチャのレイアウト（物理パネルと同じ比率にする） */
const TEX_W = 1024
const TEX_CAPTION_H = 128
const TEX_SIDE_PAD = 36
const TEX_BOTTOM_PAD = 36
const TEX_IMAGE_W = TEX_W - TEX_SIDE_PAD * 2
const TEX_IMAGE_H = Math.round(TEX_IMAGE_W / SAMPLE_ASPECT)
const TEX_H = TEX_CAPTION_H + TEX_IMAGE_H + TEX_BOTTOM_PAD
const TEX_ASPECT = TEX_W / TEX_H

const JP_SANS =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", sans-serif'

/**
 * Photo Booth 入口横のプロモ看板。
 * 日本語は Canvas 描画（troika は JP グリフ非対応のため）。
 */
export function VisitPassPromoBoard({
  position,
  accentColor,
  locale,
}: {
  position: [number, number, number]
  accentColor: string
  locale: 'en' | 'ja'
}) {
  const texture = useVisitPassPromoTexture(locale, accentColor)

  const panelW = 2.95
  const faceW = panelW - 0.08
  const faceH = faceW / TEX_ASPECT
  const panelH = faceH + 0.06
  const panelBottomY = 0.95
  const panelCenterY = panelBottomY + panelH / 2
  const postH = panelCenterY + panelH / 2 - 0.12

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.24, 1.05]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0.12 + postH / 2, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, postH, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, panelCenterY, 0.04]} castShadow>
        <boxGeometry args={[panelW + 0.12, panelH + 0.14, 0.16]} />
        <meshStandardMaterial
          color="#17151d"
          emissive={accentColor}
          emissiveIntensity={0.07}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>
      {texture ? (
        <mesh position={[0, panelCenterY, 0.13]}>
          <planeGeometry args={[faceW, faceH]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  )
}

function useVisitPassPromoTexture(locale: 'en' | 'ja', accentColor: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    let owned: CanvasTexture | null = null

    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = TEX_W
      canvas.height = TEX_H
      const ctx = canvas.getContext('2d')
      if (!ctx || cancelled) return

      ctx.fillStyle = '#17151d'
      ctx.fillRect(0, 0, TEX_W, TEX_H)

      const caption =
        locale === 'ja' ? 'VisitorPassを受け取る' : 'Get your Visitor Pass'
      ctx.fillStyle = accentColor
      ctx.font = `700 52px ${JP_SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(caption, TEX_W / 2, TEX_CAPTION_H / 2)

      ctx.fillStyle = '#0e1016'
      ctx.fillRect(
        TEX_SIDE_PAD - 6,
        TEX_CAPTION_H - 6,
        TEX_IMAGE_W + 12,
        TEX_IMAGE_H + 12,
      )
      ctx.drawImage(img, TEX_SIDE_PAD, TEX_CAPTION_H, TEX_IMAGE_W, TEX_IMAGE_H)

      const next = new CanvasTexture(canvas)
      next.colorSpace = SRGBColorSpace
      next.anisotropy = 4
      next.needsUpdate = true
      if (cancelled) {
        next.dispose()
        return
      }
      owned = next
      setTexture(next)
    }
    img.onerror = () => {
      if (!cancelled) setTexture(null)
    }
    img.src = SAMPLE_SRC

    return () => {
      cancelled = true
      owned?.dispose()
      setTexture(null)
    }
  }, [locale, accentColor])

  return texture
}
