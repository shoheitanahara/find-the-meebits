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

/**
 * Neon tube at foot height. Lights are sparse on purpose —
 * dozens of point lights were freezing the scene / walker animation.
 */
function NeonRunner({
  position,
  length,
  axis = 'z',
  color,
  withLight = false,
}: {
  position: [number, number, number]
  length: number
  axis?: 'x' | 'z'
  color: string
  /** Only a few runners emit real lights (emissive mesh still glows). */
  withLight?: boolean
}) {
  const tube: [number, number, number] =
    axis === 'x' ? [length, 0.07, 0.07] : [0.07, 0.07, length]

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={tube} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.6}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      {withLight ? (
        <pointLight
          position={axis === 'x' ? [0, 0.2, 0.25] : [0.25, 0.2, 0]}
          color={color}
          intensity={NIGHT_MOOD.neonIntensity}
          distance={NIGHT_MOOD.neonDistance}
          decay={2}
        />
      ) : null}
    </group>
  )
}

function FootNeonRuns() {
  const hw = EIGHT_STREET.halfWidth
  const { returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const inset = hw - NIGHT_MOOD.neonInset
  const y = NIGHT_MOOD.neonHeight
  const colors = NIGHT_MOOD.neonColors
  const exitEndZ = exitZ - 8

  // Split each long runner into segments so we can place ~1 light per segment.
  const segments = (from: number, to: number, maxLen: number) => {
    const lo = Math.min(from, to)
    const hi = Math.max(from, to)
    const out: { mid: number; len: number }[] = []
    for (let a = lo; a < hi; a += maxLen) {
      const b = Math.min(a + maxLen, hi)
      out.push({ mid: (a + b) / 2, len: b - a })
    }
    return out
  }

  const legA = segments(corner1Z + hw, returnEndZ, 14)
  const legB = segments(hw + 1, corner2X - hw - 1, 12)
  const legC = segments(exitEndZ, corner1Z - hw, 14)

  return (
    <group>
      {legA.map((s, i) => (
        <group key={`a-${i}`}>
          <NeonRunner
            position={[-inset, y, s.mid]}
            length={s.len}
            axis="z"
            color={colors[0]}
            withLight={i % 2 === 0}
          />
          <NeonRunner
            position={[inset, y, s.mid]}
            length={s.len}
            axis="z"
            color={colors[1]}
            withLight={false}
          />
        </group>
      ))}
      {legB.map((s, i) => (
        <group key={`b-${i}`}>
          <NeonRunner
            position={[s.mid, y, corner1Z - inset]}
            length={s.len}
            axis="x"
            color={colors[2]}
            withLight={i % 2 === 0}
          />
          <NeonRunner
            position={[s.mid, y, corner1Z + inset]}
            length={s.len}
            axis="x"
            color={colors[3]}
            withLight={false}
          />
        </group>
      ))}
      {legC.map((s, i) => (
        <group key={`c-${i}`}>
          <NeonRunner
            position={[corner2X - inset, y, s.mid]}
            length={s.len}
            axis="z"
            color={colors[0]}
            withLight={i % 2 === 0}
          />
          <NeonRunner
            position={[corner2X + inset, y, s.mid]}
            length={s.len}
            axis="z"
            color={colors[1]}
            withLight={false}
          />
        </group>
      ))}
    </group>
  )
}

/** Neon + light clutter only — no posters / graffiti / dumpsters. */
export function StreetDressing() {
  const hw = EIGHT_STREET.halfWidth
  const { corner1Z, corner2X, exitZ } = EIGHT_STREET
  const left = -hw + 0.55
  const right = hw - 0.55

  return (
    <group>
      <FootNeonRuns />

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
