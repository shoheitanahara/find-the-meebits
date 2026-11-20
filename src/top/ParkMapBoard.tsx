import { useEffect, useMemo, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import { drawParkMap, PARK_MAP_TEX_H, PARK_MAP_TEX_W } from './parkMapArt'
import type { ParkZoneId } from './parkZones'

/** Plaza 入口左のパークマップ看板位置（+Z 向き＝入場者に正対） */
export const PARK_MAP_BOARD_POSITION: [number, number, number] = [-7.6, 0, 12.2]

/**
 * エリアごとの看板位置（どれも手前の空き地。+Z 向き）。
 * 基本は Plaza と同じ左手前。東門から入る Jungle は右手前に置く
 * （Sea は右手前にヤシがあるので左のまま）。
 */
export const PARK_MAP_BOARD_SPOTS: Record<ParkZoneId, [number, number, number]> = {
  plaza: PARK_MAP_BOARD_POSITION,
  mountain: PARK_MAP_BOARD_POSITION,
  culture: PARK_MAP_BOARD_POSITION,
  // 手前は波打ち際（z≈13 から海）なので、看板の前に立てるよう陸側へ下げる
  sea: [-7.6, 0, 10.0],
  astro: PARK_MAP_BOARD_POSITION,
  musicArt: PARK_MAP_BOARD_POSITION,
  jungle: [7.6, 0, 12.2],
}
export const PARK_MAP_BOARD_HALF_X = 2.5
export const PARK_MAP_BOARD_HALF_Z = 0.55

const TEX_ASPECT = PARK_MAP_TEX_W / PARK_MAP_TEX_H

type BaseKind = 'plinth' | 'stones' | 'deck' | 'riser' | 'pad' | 'roots'
type PostKind = 'round' | 'square' | 'log'

/**
 * エリアごとの看板の枠・柱・土台。
 * どれも落ち着いた素材感で、光るのは細い帯をほんのり程度に留める。
 */
type BoardStyle = {
  base: BaseKind
  baseColor: string
  /** 土台の縁や上面の差し色 */
  baseTrim?: string
  post: PostKind
  postColor: string
  postMetal?: number
  postRough?: number
  frameColor: string
  frameMetal?: number
  frameRough?: number
  /** 面のまわりの細い縁取り */
  trim: string
  /** 縁取りをほんのり発光させる強さ（0 で発光なし） */
  trimGlow?: number
  /** 上の笠木（平らな帯）。roof と併用しない */
  cap?: string
  /** 切妻の小屋根（山・森の案内板ふう） */
  roof?: { color: string; snow?: boolean }
}

const BOARD_STYLES: Record<ParkZoneId, BoardStyle> = {
  // 広場：濃紺の盤面に真鍮の柱と金の笠木（クラシック）
  plaza: {
    base: 'plinth',
    baseColor: '#2a2430',
    baseTrim: '#b8944a',
    post: 'round',
    postColor: '#b8944a',
    postMetal: 0.62,
    postRough: 0.36,
    frameColor: '#121820',
    frameMetal: 0.2,
    frameRough: 0.48,
    trim: '#d4b46a',
    cap: '#b8944a',
  },
  // 山：丸太の柱と石積みの土台、雪をのせた小屋根（登山口の案内板）
  mountain: {
    base: 'stones',
    baseColor: '#6e7076',
    post: 'log',
    postColor: '#5a3e28',
    postRough: 0.9,
    frameColor: '#3a2a1e',
    frameRough: 0.85,
    trim: '#8a6a44',
    roof: { color: '#4a3424', snow: true },
  },
  // カルチャー：ギャラリーのような白い額と白い台座、細い黒の柱
  culture: {
    base: 'plinth',
    baseColor: '#e8e8ec',
    baseTrim: '#8eb4e8',
    post: 'square',
    postColor: '#1c2230',
    postMetal: 0.3,
    postRough: 0.5,
    frameColor: '#f2f2f4',
    frameRough: 0.55,
    trim: '#8eb4e8',
  },
  // 海：流木のような白っぽい木枠とボードウォークの土台
  sea: {
    base: 'deck',
    baseColor: '#a88a66',
    baseTrim: '#7a6248',
    post: 'square',
    postColor: '#c8b08c',
    postRough: 0.92,
    frameColor: '#d8c6a4',
    frameRough: 0.9,
    trim: '#3a90b8',
    cap: '#b89c76',
  },
  // アストロ：ガンメタルの枠に水色の細い帯、二段の金属パッド
  astro: {
    base: 'pad',
    baseColor: '#2a3040',
    baseTrim: '#5ce0ff',
    post: 'square',
    postColor: '#4a5468',
    postMetal: 0.75,
    postRough: 0.3,
    frameColor: '#1c2230',
    frameMetal: 0.6,
    frameRough: 0.35,
    trim: '#5ce0ff',
    trimGlow: 0.35,
  },
  // ミュージック＆アート：黒いステージの段と金の縁、マゼンタの差し色
  musicArt: {
    base: 'riser',
    baseColor: '#16121c',
    baseTrim: '#c8a050',
    post: 'square',
    postColor: '#1e1826',
    postMetal: 0.35,
    postRough: 0.45,
    frameColor: '#16121c',
    frameMetal: 0.25,
    frameRough: 0.4,
    trim: '#e85cff',
    trimGlow: 0.25,
    cap: '#c8a050',
  },
  // ジャングル：皮付きの丸太と苔むした土台、草ぶきふうの小屋根
  jungle: {
    base: 'roots',
    baseColor: '#4a5a34',
    baseTrim: '#6a8a40',
    post: 'log',
    postColor: '#4e3a26',
    postRough: 0.95,
    frameColor: '#3e2e20',
    frameRough: 0.9,
    trim: '#7a9a50',
    roof: { color: '#6a7a3a' },
  },
}

/**
 * パークの全体マップ看板。
 * 盤面は共通、枠・柱・土台はエリアの雰囲気に合わせる。
 */
export function ParkMapBoard({ locale, zoneId }: { locale: 'en' | 'ja'; zoneId: ParkZoneId }) {
  const texture = useParkMapTexture(locale, zoneId)
  const style = BOARD_STYLES[zoneId]

  const panelW = 4.8
  const faceW = panelW - 0.1
  const faceH = faceW / TEX_ASPECT
  const panelH = faceH + 0.08
  const panelBottomY = 1.15
  const panelCenterY = panelBottomY + panelH / 2
  const panelTopY = panelCenterY + panelH / 2
  const postX = panelW * 0.42
  const baseH = BASE_HEIGHT[style.base]
  const postTop = panelTopY + (style.roof ? 0.12 : -0.1)
  const postH = postTop - baseH

  return (
    <group position={PARK_MAP_BOARD_SPOTS[zoneId]}>
      <BoardBase style={style} width={panelW} />

      {[-postX, postX].map((x) => (
        <BoardPost key={x} style={style} x={x} bottom={baseH} height={postH} />
      ))}

      {/* 枠 */}
      <mesh position={[0, panelCenterY, 0.04]} castShadow>
        <boxGeometry args={[panelW + 0.12, panelH + 0.14, 0.16]} />
        <meshStandardMaterial
          color={style.frameColor}
          metalness={style.frameMetal ?? 0}
          roughness={style.frameRough ?? 0.6}
        />
      </mesh>
      {/* 面のまわりの細い縁取り（上下左右） */}
      <FaceTrim style={style} width={faceW + 0.06} height={faceH + 0.06} centerY={panelCenterY} />

      {style.cap ? (
        <mesh position={[0, panelTopY + 0.1, 0.04]} castShadow>
          <boxGeometry args={[panelW + 0.32, 0.08, 0.26]} />
          <meshStandardMaterial color={style.cap} metalness={0.4} roughness={0.45} />
        </mesh>
      ) : null}
      {style.roof ? <BoardRoof roof={style.roof} width={panelW + 0.6} y={panelTopY + 0.1} /> : null}

      {texture ? (
        <mesh position={[0, panelCenterY, 0.135]}>
          <planeGeometry args={[faceW, faceH]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  )
}

/** 土台の高さ（柱はこの上から立てる） */
const BASE_HEIGHT: Record<BaseKind, number> = {
  plinth: 0.24,
  stones: 0.3,
  deck: 0.2,
  riser: 0.3,
  pad: 0.22,
  roots: 0.18,
}

function BoardBase({ style, width }: { style: BoardStyle; width: number }) {
  const w = width + 0.12
  const h = BASE_HEIGHT[style.base]
  switch (style.base) {
    case 'plinth':
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, 1.05]} />
            <meshStandardMaterial color={style.baseColor} roughness={0.6} />
          </mesh>
          {style.baseTrim ? (
            <mesh position={[0, h - 0.02, 0.53]}>
              <boxGeometry args={[w, 0.04, 0.02]} />
              <meshStandardMaterial color={style.baseTrim} metalness={0.4} roughness={0.45} />
            </mesh>
          ) : null}
        </group>
      )
    case 'stones':
      return <StoneBase color={style.baseColor} width={w} />
    case 'deck':
      return (
        <group>
          {/* 根太 */}
          {[-0.32, 0.32].map((z) => (
            <mesh key={z} position={[0, 0.05, z]} receiveShadow>
              <boxGeometry args={[w + 0.1, 0.1, 0.12]} />
              <meshStandardMaterial color={style.baseTrim ?? style.baseColor} roughness={0.95} />
            </mesh>
          ))}
          {/* 板（少しずつ色を変えて並べる） */}
          {[-0.4, -0.13, 0.14, 0.41].map((z, i) => (
            <mesh key={z} position={[0, 0.15, z]} castShadow receiveShadow>
              <boxGeometry args={[w + 0.2, 0.08, 0.24]} />
              <meshStandardMaterial color={i % 2 === 0 ? style.baseColor : '#b49674'} roughness={0.92} />
            </mesh>
          ))}
        </group>
      )
    case 'riser':
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + 0.1, h, 1.05]} />
            <meshStandardMaterial color={style.baseColor} roughness={0.5} metalness={0.15} />
          </mesh>
          {/* ステージの縁（金） */}
          <mesh position={[0, h - 0.025, 0.535]}>
            <boxGeometry args={[w + 0.1, 0.05, 0.03]} />
            <meshStandardMaterial color={style.baseTrim} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      )
    case 'pad':
      return (
        <group>
          <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + 0.14, 0.14, 1.1]} />
            <meshStandardMaterial color={style.baseColor} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <boxGeometry args={[w - 0.2, 0.08, 0.86]} />
            <meshStandardMaterial color="#3a4256" metalness={0.65} roughness={0.32} />
          </mesh>
          {/* 前縁の細い水色の帯 */}
          <mesh position={[0, 0.1, 0.556]}>
            <boxGeometry args={[w + 0.1, 0.025, 0.01]} />
            <meshStandardMaterial
              color={style.baseTrim}
              emissive={style.baseTrim}
              emissiveIntensity={0.35}
              roughness={0.4}
            />
          </mesh>
        </group>
      )
    case 'roots':
      return <MossBase color={style.baseColor} accent={style.baseTrim ?? style.baseColor} width={w} />
  }
}

/** 決まった並びの乱数（見た目を毎回同じにする） */
function seeded(i: number) {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

/** 大小の石を横に並べた石積み */
function StoneBase({ color, width }: { color: string; width: number }) {
  const stones = useMemo(() => {
    const list: Array<{ x: number; z: number; w: number; h: number; d: number; shade: number }> = []
    let x = -width / 2
    let i = 0
    while (x < width / 2 - 0.1) {
      const w = 0.42 + seeded(i) * 0.36
      const cx = Math.min(x + w / 2, width / 2 - w / 2)
      for (const z of [-0.26, 0.26]) {
        list.push({
          x: cx,
          z: z + (seeded(i + 40) - 0.5) * 0.06,
          w: w - 0.04,
          h: 0.24 + seeded(i + (z > 0 ? 7 : 19)) * 0.1,
          d: 0.48,
          shade: 0.85 + seeded(i + 3) * 0.3,
        })
      }
      x += w
      i += 1
    }
    return list
  }, [width])
  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2, s.z]} castShadow receiveShadow>
          <boxGeometry args={[s.w, s.h, s.d]} />
          <meshStandardMaterial color={shade(color, s.shade)} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

/** 苔むした土の盛り土に、低い草の房 */
function MossBase({ color, accent, width }: { color: string; accent: string; width: number }) {
  const tufts = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: -width / 2 + 0.2 + (i / 8) * (width - 0.4) + (seeded(i) - 0.5) * 0.2,
        z: 0.42 + (seeded(i + 9) - 0.5) * 0.12,
        h: 0.1 + seeded(i + 21) * 0.1,
      })),
    [width],
  )
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.12, 1.1]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.06, 0.96]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {tufts.map((t, i) => (
        <mesh key={i} position={[t.x, 0.18 + t.h / 2, t.z]}>
          <boxGeometry args={[0.1, t.h, 0.1]} />
          <meshStandardMaterial color={accent} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function BoardPost({ style, x, bottom, height }: { style: BoardStyle; x: number; bottom: number; height: number }) {
  const y = bottom + height / 2
  const material = (
    <meshStandardMaterial color={style.postColor} metalness={style.postMetal ?? 0} roughness={style.postRough ?? 0.6} />
  )
  if (style.post === 'round') {
    return (
      <mesh position={[x, y, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, height, 10]} />
        {material}
      </mesh>
    )
  }
  if (style.post === 'square') {
    return (
      <mesh position={[x, y, 0]} castShadow>
        <boxGeometry args={[0.12, height, 0.12]} />
        {material}
      </mesh>
    )
  }
  // 丸太：太めで、節の輪を少しだけ
  return (
    <group>
      <mesh position={[x, y, -0.02]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, height, 8]} />
        {material}
      </mesh>
      {[0.3, 0.72].map((t) => (
        <mesh key={t} position={[x, bottom + height * t, -0.02]}>
          <cylinderGeometry args={[0.145, 0.145, 0.04, 8]} />
          <meshStandardMaterial color={shade(style.postColor, 0.75)} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function FaceTrim({
  style,
  width,
  height,
  centerY,
}: {
  style: BoardStyle
  width: number
  height: number
  centerY: number
}) {
  const t = 0.035
  const glow = style.trimGlow ?? 0
  const bars: Array<[number, number, number, number]> = [
    [0, centerY + height / 2, width + t, t],
    [0, centerY - height / 2, width + t, t],
    [-width / 2, centerY, t, height + t],
    [width / 2, centerY, t, height + t],
  ]
  return (
    <group>
      {bars.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.128]}>
          <boxGeometry args={[w, h, 0.02]} />
          <meshStandardMaterial
            color={style.trim}
            emissive={glow > 0 ? style.trim : '#000000'}
            emissiveIntensity={glow}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

/** 切妻の小屋根（雪をのせることもできる） */
function BoardRoof({ roof, width, y }: { roof: { color: string; snow?: boolean }; width: number; y: number }) {
  const slope = 0.42
  const halfDepth = 0.5
  const plane = Math.hypot(halfDepth, halfDepth * Math.tan(slope)) + 0.04
  const rise = halfDepth * Math.tan(slope)
  return (
    <group position={[0, y, 0.04]}>
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh
            position={[0, rise / 2 + 0.04, (side * halfDepth) / 2]}
            rotation={[side * slope, 0, 0]}
            castShadow
          >
            <boxGeometry args={[width, 0.07, plane]} />
            <meshStandardMaterial color={roof.color} roughness={0.9} />
          </mesh>
          {roof.snow ? (
            <mesh position={[0, rise / 2 + 0.09, (side * halfDepth) / 2]} rotation={[side * slope, 0, 0]}>
              <boxGeometry args={[width - 0.1, 0.04, plane - 0.08]} />
              <meshStandardMaterial color="#eef3f8" roughness={0.85} />
            </mesh>
          ) : null}
        </group>
      ))}
      {/* 棟木 */}
      <mesh position={[0, rise + 0.06, 0]} castShadow>
        <boxGeometry args={[width + 0.06, 0.08, 0.1]} />
        <meshStandardMaterial color={shade(roof.color, 0.75)} roughness={0.9} />
      </mesh>
    </group>
  )
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 255) * amount))
  const g = Math.min(255, Math.round(((n >> 8) & 255) * amount))
  const b = Math.min(255, Math.round((n & 255) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function useParkMapTexture(locale: 'en' | 'ja', zoneId: ParkZoneId): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    let owned: CanvasTexture | null = null

    const draw = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = PARK_MAP_TEX_W
      canvas.height = PARK_MAP_TEX_H
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      drawParkMap(ctx, PARK_MAP_TEX_W, PARK_MAP_TEX_H, locale, zoneId)

      const next = new CanvasTexture(canvas)
      next.colorSpace = SRGBColorSpace
      next.anisotropy = 4
      next.needsUpdate = true
      owned?.dispose()
      owned = next
      setTexture(next)
    }

    // UI と同じ Montserrat で描くため、読み込みを待ってから描く（失敗しても代替フォントで描く）
    if (typeof document !== 'undefined' && document.fonts) {
      Promise.all([document.fonts.load('800 36px Montserrat'), document.fonts.load('700 24px Montserrat')])
        .catch(() => undefined)
        .then(draw)
    } else {
      draw()
    }

    return () => {
      cancelled = true
      owned?.dispose()
      setTexture(null)
    }
  }, [locale, zoneId])

  return texture
}
