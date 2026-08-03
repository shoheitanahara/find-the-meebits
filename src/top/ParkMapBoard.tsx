import { useEffect, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import { drawParkMap, PARK_MAP_TEX_H, PARK_MAP_TEX_W } from './parkMapArt'

/** Plaza 入口左のパークマップ看板位置（+Z 向き＝入場者に正対） */
export const PARK_MAP_BOARD_POSITION: [number, number, number] = [-7.6, 0, 12.2]
export const PARK_MAP_BOARD_HALF_X = 2.5
export const PARK_MAP_BOARD_HALF_Z = 0.55

const TEX_ASPECT = PARK_MAP_TEX_W / PARK_MAP_TEX_H

/**
 * パーク入口の全体マップ看板。
 * 横長パネル（縦は旧版の約半分）で画面に収める。
 */
export function ParkMapBoard({ locale }: { locale: 'en' | 'ja' }) {
  const texture = useParkMapTexture(locale)

  const panelW = 4.8
  const faceW = panelW - 0.1
  const faceH = faceW / TEX_ASPECT
  const panelH = faceH + 0.08
  const panelBottomY = 1.15
  const panelCenterY = panelBottomY + panelH / 2
  const postH = panelCenterY + panelH / 2 - 0.1
  const postX = panelW * 0.42

  return (
    <group position={PARK_MAP_BOARD_POSITION}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[panelW + 0.12, 0.24, 1.05]} />
        <meshStandardMaterial color="#2a2430" roughness={0.6} />
      </mesh>
      {[-postX, postX].map((x) => (
        <mesh key={x} position={[x, 0.12 + postH / 2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, postH, 10]} />
          <meshStandardMaterial color="#b8944a" metalness={0.62} roughness={0.36} />
        </mesh>
      ))}
      <mesh position={[0, panelCenterY, 0.04]} castShadow>
        <boxGeometry args={[panelW + 0.12, panelH + 0.14, 0.16]} />
        <meshStandardMaterial
          color="#121820"
          emissive="#d4b46a"
          emissiveIntensity={0.07}
          metalness={0.2}
          roughness={0.48}
        />
      </mesh>
      {texture ? (
        <mesh position={[0, panelCenterY, 0.135]}>
          <planeGeometry args={[faceW, faceH]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  )
}

function useParkMapTexture(locale: 'en' | 'ja'): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    let owned: CanvasTexture | null = null

    const canvas = document.createElement('canvas')
    canvas.width = PARK_MAP_TEX_W
    canvas.height = PARK_MAP_TEX_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawParkMap(ctx, PARK_MAP_TEX_W, PARK_MAP_TEX_H, locale)

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

    return () => {
      cancelled = true
      owned?.dispose()
      setTexture(null)
    }
  }, [locale])

  return texture
}
