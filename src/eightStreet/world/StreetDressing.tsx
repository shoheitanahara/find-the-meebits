import { useMemo } from 'react'
import {
  BoxGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { EIGHT_STREET, NIGHT_MOOD } from '../config'

let brickSource: CanvasTexture | null = null
let asphaltSource: CanvasTexture | null = null
let sharedBrickMaterial: MeshStandardMaterial | null = null
let sharedAsphaltMaterial: MeshStandardMaterial | null = null

/** World size of one brick tile when UV is remapped per wall face. */
const BRICK_TILE_W = 0.9
const BRICK_TILE_H = 0.45

function getBrickSource(): CanvasTexture {
  if (brickSource) return brickSource
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#6a4a3e'
  ctx.fillRect(0, 0, c.width, c.height)

  const brickH = 32
  const brickW = 64
  const mortar = '#3d2e28'
  for (let row = 0; row < c.height / brickH; row++) {
    const offset = row % 2 === 0 ? 0 : brickW / 2
    for (let col = -1; col < c.width / brickW + 1; col++) {
      const x = col * brickW + offset
      const y = row * brickH
      const shade = 0.88 + ((row * 7 + col * 3) % 3) * 0.05
      const r = Math.floor(170 * shade)
      const g = Math.floor(105 * shade)
      const b = Math.floor(82 * shade)
      ctx.fillStyle = mortar
      ctx.fillRect(x, y, brickW, brickH)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4)
    }
  }

  brickSource = new CanvasTexture(c)
  brickSource.colorSpace = SRGBColorSpace
  brickSource.wrapS = RepeatWrapping
  brickSource.wrapT = RepeatWrapping
  brickSource.repeat.set(1, 1)
  brickSource.anisotropy = 1
  return brickSource
}

function getAsphaltSource(): CanvasTexture {
  if (asphaltSource) return asphaltSource
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#3a3d46'
  ctx.fillRect(0, 0, 64, 64)
  for (let i = 0; i < 180; i++) {
    const x = (i * 47) % 64
    const y = (i * 91) % 64
    const v = 48 + (i % 40)
    ctx.fillStyle = `rgb(${v},${v},${v + 4})`
    ctx.fillRect(x, y, 2, 2)
  }

  asphaltSource = new CanvasTexture(c)
  asphaltSource.colorSpace = SRGBColorSpace
  asphaltSource.wrapS = RepeatWrapping
  asphaltSource.wrapT = RepeatWrapping
  asphaltSource.repeat.set(8, 8)
  return asphaltSource
}

function getBrickMaterial() {
  if (sharedBrickMaterial) return sharedBrickMaterial
  sharedBrickMaterial = new MeshStandardMaterial({
    map: getBrickSource(),
    roughness: 0.92,
    metalness: 0.02,
  })
  return sharedBrickMaterial
}

function getAsphaltMaterial() {
  if (sharedAsphaltMaterial) return sharedAsphaltMaterial
  sharedAsphaltMaterial = new MeshStandardMaterial({
    map: getAsphaltSource(),
    roughness: 0.95,
    metalness: 0.04,
  })
  return sharedAsphaltMaterial
}

/** Remap each box face so bricks stay street-scale (no stretched end-caps). */
function makeBrickBoxGeometry(sx: number, sy: number, sz: number) {
  const geo = new BoxGeometry(sx, sy, sz)
  const scales: Array<[number, number]> = [
    [sz / BRICK_TILE_W, sy / BRICK_TILE_H], // +x
    [sz / BRICK_TILE_W, sy / BRICK_TILE_H], // -x
    [sx / BRICK_TILE_W, sz / BRICK_TILE_H], // +y
    [sx / BRICK_TILE_W, sz / BRICK_TILE_H], // -y
    [sx / BRICK_TILE_W, sy / BRICK_TILE_H], // +z
    [sx / BRICK_TILE_W, sy / BRICK_TILE_H], // -z
  ]
  const uv = geo.attributes.uv
  const next = new Float32Array(uv.count * 2)
  for (let face = 0; face < 6; face++) {
    const [su, sv] = scales[face]
    for (let i = 0; i < 4; i++) {
      const idx = face * 4 + i
      next[idx * 2] = uv.getX(idx) * su
      next[idx * 2 + 1] = uv.getY(idx) * sv
    }
  }
  geo.setAttribute('uv', new Float32BufferAttribute(next, 2))
  return geo
}

/** Thick brick volume walls (previous street feel), with corrected face UVs. */
export function BrickWall({
  pos,
  size,
}: {
  pos: [number, number, number]
  size: [number, number, number]
}) {
  const material = useMemo(() => getBrickMaterial(), [])
  const geometry = useMemo(
    () => makeBrickBoxGeometry(size[0], size[1], size[2]),
    [size[0], size[1], size[2]],
  )

  return (
    <mesh position={pos} geometry={geometry} material={material} receiveShadow />
  )
}

export function AsphaltDeck({
  w,
  l,
  pos,
}: {
  w: number
  l: number
  pos: [number, number, number]
}) {
  const material = useMemo(() => getAsphaltMaterial(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={pos} material={material} receiveShadow>
      <planeGeometry args={[w, l]} />
    </mesh>
  )
}

function TrashBag({
  position,
  scale = 1,
  color = '#2a2a2e',
}: {
  position: [number, number, number]
  scale?: number
  color?: string
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.22, 8, 6]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

function Crate({
  position,
  rotationY = 0,
  size = [0.55, 0.4, 0.45] as [number, number, number],
  color = '#8b5a2b',
}: {
  position: [number, number, number]
  rotationY?: number
  size?: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}

function PipeRun({
  position,
  length,
  axis = 'z',
}: {
  position: [number, number, number]
  length: number
  axis?: 'x' | 'z'
}) {
  const args: [number, number, number] =
    axis === 'x' ? [length, 0.12, 0.12] : [0.12, 0.12, length]
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#5b6770" roughness={0.45} metalness={0.55} />
    </mesh>
  )
}

function ACUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.45]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.35} />
      </mesh>
    </group>
  )
}

type FacadeKind = 'door' | 'window' | 'shop'

/** Stable pseudo-random from a string key (no Math.random flicker on remount). */
function hash01(key: string) {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/**
 * Shop window: timber frame + recessed warm room + translucent glass.
 * Strong warm sodium glow — no extra rect overlays inside the pane.
 */
function GlazedWindow({
  width,
  height,
  lit,
  cols = 2,
  rows = 1,
  withSill = true,
}: {
  width: number
  height: number
  lit: boolean
  cols?: number
  rows?: number
  withSill?: boolean
}) {
  const frame = '#3a2c24'
  const frameInner = '#4d3a2e'
  const sill = '#5c4638'
  const roomDeep = lit ? '#4a2a10' : '#0c0f14'
  const roomGlow = lit ? '#ffc078' : '#141820'
  const glassTint = lit ? '#ffe2a8' : '#2a3140'
  const mullion = '#2f241c'

  const trim = Math.min(0.09, width * 0.08)
  const glassW = width - trim * 2
  const glassH = height - trim * 2
  const bar = 0.045

  const vBars = Array.from({ length: cols - 1 }, (_, i) => {
    const t = (i + 1) / cols
    return -glassW / 2 + t * glassW
  })
  const hBars = Array.from({ length: rows - 1 }, (_, i) => {
    const t = (i + 1) / rows
    return -glassH / 2 + t * glassH
  })

  return (
    <group>
      {/* Outer timber surround */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={frame} roughness={0.86} metalness={0.04} />
      </mesh>
      {/* Inner rebate */}
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[width - 0.05, height - 0.05, 0.045]} />
        <meshStandardMaterial color={frameInner} roughness={0.8} />
      </mesh>

      {/* Strong warm interior glow */}
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[glassW * 0.98, glassH * 0.98, 0.06]} />
        <meshStandardMaterial
          color={roomDeep}
          emissive={roomGlow}
          emissiveIntensity={lit ? 2.6 : 0.04}
          roughness={1}
          toneMapped={false}
        />
      </mesh>

      {/* Warm glass veil */}
      <mesh position={[0, 0, 0.088]}>
        <boxGeometry args={[glassW, glassH, 0.012]} />
        <meshStandardMaterial
          color={glassTint}
          emissive={lit ? '#ffcc88' : '#000000'}
          emissiveIntensity={lit ? 1.4 : 0}
          metalness={0.08}
          roughness={0.28}
          transparent
          opacity={lit ? 0.55 : 0.62}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Timber mullions — inset into the glass rebate (depth, not flat lines) */}
      {vBars.map((x, i) => (
        <group key={`v${i}`}>
          <mesh position={[x, 0, 0.07]}>
            <boxGeometry args={[bar * 1.35, glassH * 0.98, 0.055]} />
            <meshStandardMaterial color={mullion} roughness={0.82} />
          </mesh>
          <mesh position={[x, 0, 0.105]}>
            <boxGeometry args={[bar * 0.7, glassH * 0.96, 0.028]} />
            <meshStandardMaterial color="#3d2e24" roughness={0.75} />
          </mesh>
        </group>
      ))}
      {hBars.map((y, i) => (
        <group key={`h${i}`}>
          <mesh position={[0, y, 0.07]}>
            <boxGeometry args={[glassW * 0.98, bar * 1.35, 0.055]} />
            <meshStandardMaterial color={mullion} roughness={0.82} />
          </mesh>
          <mesh position={[0, y, 0.105]}>
            <boxGeometry args={[glassW * 0.96, bar * 0.7, 0.028]} />
            <meshStandardMaterial color="#3d2e24" roughness={0.75} />
          </mesh>
        </group>
      ))}
      {/* Center joint where bars cross */}
      {vBars.length > 0 && hBars.length > 0
        ? vBars.flatMap((x, vi) =>
            hBars.map((y, hi) => (
              <mesh key={`x${vi}-${hi}`} position={[x, y, 0.112]}>
                <boxGeometry args={[bar * 1.1, bar * 1.1, 0.03]} />
                <meshStandardMaterial color="#2a2018" roughness={0.8} />
              </mesh>
            )),
          )
        : null}

      {withSill ? (
        <>
          <mesh position={[0, -height / 2 - 0.04, 0.08]}>
            <boxGeometry args={[width + 0.08, 0.08, 0.14]} />
            <meshStandardMaterial color={sill} roughness={0.9} />
          </mesh>
          <mesh position={[0, -height / 2 - 0.01, 0.14]}>
            <boxGeometry args={[width + 0.02, 0.03, 0.04]} />
            <meshStandardMaterial color="#6a5242" roughness={0.85} />
          </mesh>
        </>
      ) : null}
    </group>
  )
}

/** Wall-facing facade in local space: +Z points into the street. */
function ShopFacade({
  kind,
  lit = true,
  hasUpper = false,
}: {
  kind: FacadeKind
  lit?: boolean
  hasUpper?: boolean
}) {
  const frame = '#2c2420'
  const door = kind === 'door' ? '#3a2a22' : '#2a3340'
  const awning = lit ? '#8b1e3f' : '#4a5568'
  const shellH = hasUpper ? 4.15 : 2.45
  const shellY = hasUpper ? 2.05 : 1.2
  const shopWinW = kind === 'shop' ? 1.12 : 1.68

  return (
    <group>
      <mesh position={[0, shellY, -0.01]}>
        <boxGeometry args={[2.35, shellH, 0.06]} />
        <meshStandardMaterial color="#4a3a32" roughness={0.92} />
      </mesh>

      {kind === 'door' || kind === 'shop' ? (
        <group position={[kind === 'shop' ? -0.55 : 0, 0, 0]}>
          <mesh position={[0, 1.05, 0.04]}>
            <boxGeometry args={[0.95, 2.1, 0.08]} />
            <meshStandardMaterial color={frame} roughness={0.75} />
          </mesh>
          <mesh position={[0, 1.05, 0.09]}>
            <boxGeometry args={[0.78, 1.92, 0.05]} />
            <meshStandardMaterial color={door} roughness={0.82} />
          </mesh>
          {/* Door lite — small glazed panel */}
          <group position={[0, 1.58, 0.12]}>
            <GlazedWindow width={0.52} height={0.58} lit={lit} cols={1} rows={1} withSill={false} />
          </group>
          <mesh position={[0.32, 1.05, 0.14]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#c4a574" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ) : null}

      {kind === 'window' || kind === 'shop' ? (
        <group position={[kind === 'shop' ? 0.55 : 0, 1.52, 0]}>
          <GlazedWindow
            width={shopWinW}
            height={1.28}
            lit={lit}
            cols={kind === 'shop' ? 2 : 3}
            rows={2}
          />
        </group>
      ) : null}

      {hasUpper ? (
        <>
          <group position={[-0.52, 3.28, 0]}>
            <GlazedWindow width={0.92} height={0.98} lit={lit} cols={1} rows={1} />
          </group>
          <group position={[0.52, 3.28, 0]}>
            <GlazedWindow width={0.92} height={0.98} lit={lit} cols={1} rows={1} />
          </group>
          <mesh position={[0, 4.05, 0.04]}>
            <boxGeometry args={[2.4, 0.12, 0.12]} />
            <meshStandardMaterial color="#3a302a" roughness={0.88} />
          </mesh>
        </>
      ) : null}

      {(kind === 'shop' || kind === 'window') && (
        <mesh position={[0, 2.28, 0.12]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[2.05, 0.05, 0.24]} />
          <meshStandardMaterial color={awning} roughness={0.9} />
        </mesh>
      )}
    </group>
  )
}

type WallMount = {
  key: string
  x: number
  z: number
  yaw: number
  kind: FacadeKind
  lit: boolean
  hasUpper: boolean
}

function sampleCenters(from: number, to: number, spacing: number, skip?: (t: number) => boolean) {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const out: number[] = []
  for (let t = lo + spacing * 0.55; t < hi - spacing * 0.4; t += spacing) {
    if (skip?.(t)) continue
    out.push(t)
  }
  return out
}

/** Same sampling as AlleyStreet lamps — keep awnings clear of poles. */
function collectLampXZ(): Array<{ x: number; z: number }> {
  const { halfWidth, returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const spacing = NIGHT_MOOD.lampSpacing
  const wall = halfWidth - NIGHT_MOOD.lampInset
  const lamps: Array<{ x: number; z: number }> = []

  const along = (from: number, to: number, margin = 2.4) => {
    const lo = Math.min(from, to) + margin
    const hi = Math.max(from, to) - margin
    if (hi <= lo) return [(lo + hi) / 2]
    const points: number[] = []
    for (let t = lo; t <= hi + 0.001; t += spacing) points.push(t)
    return points
  }

  along(returnEndZ, corner1Z + halfWidth + 1).forEach((z, i) => {
    lamps.push({ x: i % 2 === 0 ? -wall : wall, z })
  })
  along(halfWidth + 1, corner2X - halfWidth - 1, 1.8).forEach((x, i) => {
    lamps.push({ x, z: i % 2 === 0 ? corner1Z - wall : corner1Z + wall })
  })
  along(corner1Z - halfWidth - 1, exitZ - 8).forEach((z, i) => {
    lamps.push({ x: i % 2 === 0 ? corner2X - wall : corner2X + wall, z })
  })
  return lamps
}

function nearLamp(x: number, z: number, lamps: Array<{ x: number; z: number }>, radius = 1.35) {
  const r2 = radius * radius
  return lamps.some((l) => {
    const dx = l.x - x
    const dz = l.z - z
    return dx * dx + dz * dz < r2
  })
}

/** Transition veils — no storefronts inside the wrap fog banks. */
function nearTransition(x: number, z: number) {
  const hw = EIGHT_STREET.halfWidth
  const returnCenterZ = EIGHT_STREET.returnTransitionZ + 1.2
  // Forward veil sits at −33−1.5 and stretches deep into the exit.
  const forwardCenterZ = EIGHT_STREET.forwardTransitionZ - 1.5 - 3.5
  // Match TransitionVeil length (10 / ~20) with a little padding.
  const returnPad = 5.8
  const forwardPad = 11

  if (Math.abs(x) <= hw + 0.4 && Math.abs(z - returnCenterZ) < returnPad) return true
  if (
    Math.abs(x - EIGHT_STREET.corner2X) <= hw + 0.4 &&
    Math.abs(z - forwardCenterZ) < forwardPad
  ) {
    return true
  }
  return false
}

function buildStorefrontMounts(): WallMount[] {
  const hw = EIGHT_STREET.halfWidth
  const { returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const face = hw - 0.02
  const exitEndZ = exitZ - 8
  const kinds: FacadeKind[] = ['shop', 'window', 'door', 'window', 'shop', 'door']
  const lamps = collectLampXZ()
  const mounts: WallMount[] = []

  const push = (key: string, x: number, z: number, yaw: number, i: number) => {
    if (nearLamp(x, z, lamps)) return
    if (nearTransition(x, z)) return

    const roll = hash01(key)
    let kind = kinds[i % kinds.length]
    // Keep roughly half of door-bearing units (door / shop); rest become windows.
    if ((kind === 'door' || kind === 'shop') && roll < 0.5) {
      kind = 'window'
    }

    mounts.push({
      key,
      x,
      z,
      yaw,
      kind,
      lit: i % 5 !== 2,
      // ~1/3 of units get a second floor.
      hasUpper: hash01(`${key}:upper`) < 0.34,
    })
  }

  // Leg A — skip street-sign / rules board zone on the west wall (~z -7…-2).
  sampleCenters(corner1Z + hw + 1.5, returnEndZ - 1.2, 4.6, (z) => z > -8.2 && z < -1.6).forEach(
    (z, i) => push(`aw-${i}`, -face, z, Math.PI / 2, i),
  )
  sampleCenters(corner1Z + hw + 1.5, returnEndZ - 1.2, 4.8).forEach((z, i) =>
    push(`ae-${i}`, face, z, -Math.PI / 2, i + 1),
  )

  // Leg B
  sampleCenters(hw + 2, corner2X - hw - 2, 4.7).forEach((x, i) => {
    push(`bs-${i}`, x, corner1Z - face, 0, i + 2)
    push(`bn-${i}`, x, corner1Z + face, Math.PI, i + 3)
  })

  // Leg C
  sampleCenters(exitEndZ + 1.5, corner1Z - hw - 1.5, 4.8).forEach((z, i) => {
    push(`cw-${i}`, corner2X - face, z, Math.PI / 2, i)
    push(`ce-${i}`, corner2X + face, z, -Math.PI / 2, i + 2)
  })

  ensureSpawnDoors(mounts, hw)
  return mounts
}

/**
 * Spawn faces −Z: left wall = −X, right wall = +X.
 * Exactly one door per side on the first stretch of Leg A.
 */
function ensureSpawnDoors(mounts: WallMount[], hw: number) {
  const face = hw - 0.02
  const lamps = collectLampXZ()

  const placeSideDoor = (side: 'left' | 'right') => {
    const wantX = side === 'left' ? -face : face
    const yaw = side === 'left' ? Math.PI / 2 : -Math.PI / 2
    const inBand = (m: WallMount) =>
      Math.abs(m.x - wantX) < 0.15 && m.z < 0.4 && m.z > -15

    const sideMounts = mounts.filter(inBand)
    const existingDoor = sideMounts.find((m) => m.kind === 'door' || m.kind === 'shop')
    if (existingDoor) {
      // Normalize to a plain door; demote other door-bearing units on this side.
      existingDoor.kind = 'door'
      for (const m of sideMounts) {
        if (m !== existingDoor && (m.kind === 'door' || m.kind === 'shop')) {
          m.kind = 'window'
        }
      }
      return
    }

    // Convert the nearest window (stable pick by hash).
    const windowPick = sideMounts
      .filter((m) => m.kind === 'window')
      .sort((a, b) => hash01(a.key) - hash01(b.key))[0]
    if (windowPick) {
      windowPick.kind = 'door'
      return
    }

    // No facade to convert — plant one door on a free wall spot.
    const zCandidates = side === 'left' ? [-11.2, -14.0, -3.5] : [-3.2, -12.8, -9.5]
    for (const z of zCandidates) {
      if (nearTransition(wantX, z) || nearLamp(wantX, z, lamps)) continue
      if (mounts.some((m) => Math.hypot(m.x - wantX, m.z - z) < 2.2)) continue
      mounts.push({
        key: `spawn-door-${side}`,
        x: wantX,
        z,
        yaw,
        kind: 'door',
        lit: true,
        hasUpper: hash01(`spawn-door-${side}:upper`) < 0.34,
      })
      return
    }
  }

  placeSideDoor('left')
  placeSideDoor('right')
}

function StorefrontDressing() {
  const mounts = useMemo(() => buildStorefrontMounts(), [])
  return (
    <group>
      {mounts.map((m) => (
        <group key={m.key} position={[m.x, 0, m.z]} rotation={[0, m.yaw, 0]}>
          <ShopFacade kind={m.kind} lit={m.lit} hasUpper={m.hasUpper} />
        </group>
      ))}
    </group>
  )
}

/** Storefronts + light clutter — no posters / graffiti / dumpsters. */
export function StreetDressing() {
  const hw = EIGHT_STREET.halfWidth
  const { corner1Z, corner2X, exitZ } = EIGHT_STREET
  const left = -hw + 0.55
  const right = hw - 0.55

  return (
    <group>
      <StorefrontDressing />

      <TrashBag position={[left, 0.16, 0.2]} scale={0.75} color="#1f2937" />
      <TrashBag position={[left + 0.25, 0.14, 0.55]} scale={0.6} color="#374151" />
      <Crate position={[right, 0.22, -2.2]} rotationY={0.3} />
      <Crate position={[left, 0.22, -15]} rotationY={-0.25} color="#7a5230" />
      {/* Keep wall clutter off the street-sign / rules posters near z≈-6…-2. */}
      <ACUnit position={[-hw + 0.05, 3.2, -14]} />
      <ACUnit position={[-hw + 0.05, 4.8, -20]} />
      <PipeRun position={[-hw + 0.08, 5.6, -18]} length={10} axis="z" />

      <Crate position={[10.5, 0.22, corner1Z - hw + 0.65]} rotationY={0.4} />
      <ACUnit position={[11, 3.4, corner1Z + hw - 0.2]} />
      <PipeRun position={[13, 5.4, corner1Z + hw - 0.15]} length={8} axis="x" />

      <Crate position={[corner2X + hw - 0.6, 0.22, corner1Z - 10]} rotationY={0.2} />
      <TrashBag position={[corner2X + hw - 0.75, 0.14, corner1Z - 18.2]} scale={0.7} />
      <Crate position={[corner2X - hw + 0.55, 0.22, (corner1Z + exitZ) / 2]} rotationY={-0.15} />
      <ACUnit position={[corner2X - hw + 0.05, 3.6, corner1Z - 12]} />
      <PipeRun position={[corner2X - hw + 0.08, 5.5, corner1Z - 16]} length={12} axis="z" />
    </group>
  )
}
