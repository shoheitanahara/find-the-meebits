import type { ReactNode } from 'react'

export type MiniSculptureTone = 'light' | 'dark'

export const MINI_SCULPTURE_VARIANT_COUNT = 10

export function getShelfDecorCount(shelfWidth: number) {
  if (shelfWidth >= 14) return 3
  if (shelfWidth >= 9) return 2
  return 1
}

export function getShelfDecorPlacement(
  buildingKey: string,
  index: number,
  count: number,
  halfWidth: number,
) {
  const baseSeed = buildingKey.split('').reduce((sum, char, i) => sum + char.charCodeAt(0) * (i + 3), 0)
  const variant = (baseSeed + index * 3) % MINI_SCULPTURE_VARIANT_COUNT

  const edgeInset = 0.9
  const span = Math.max(0, halfWidth - edgeInset)
  const x =
    count === 1
      ? 0
      : -span + ((span * 2) / (count - 1)) * index

  return { x, z: 0, rotationY: 0, variant }
}

function MiniStandingFigure({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow position={[-0.22, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.42, 0.32]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0.22, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.42, 0.32]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.62, 0.58, 0.38]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 1.08, 0]}>
        <boxGeometry args={[0.48, 0.52, 0.34]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 1.48, 0]}>
        <boxGeometry args={[0.38, 0.36, 0.32]} />
        {accentMaterial}
      </mesh>
    </group>
  )
}

function MiniSpiralColumn({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[0.72, 0.32, 0.72]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0.18, 0.48, 0.12]}>
        <boxGeometry args={[0.58, 0.28, 0.58]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[-0.14, 0.76, -0.1]}>
        <boxGeometry args={[0.5, 0.26, 0.5]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0.1, 1.02, 0.14]}>
        <boxGeometry args={[0.42, 0.24, 0.42]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 1.26, 0]}>
        <boxGeometry args={[0.28, 0.2, 0.28]} />
        {bodyMaterial}
      </mesh>
    </group>
  )
}

function MiniArch({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow position={[-0.52, 0.42, 0]}>
        <boxGeometry args={[0.34, 0.88, 0.34]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0.52, 0.42, 0]}>
        <boxGeometry args={[0.34, 0.88, 0.34]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[1.55, 0.22, 0.38]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.35, 0.18, 0.42]} />
        {bodyMaterial}
      </mesh>
    </group>
  )
}

function MiniTieredPyramid({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[1.05, 0.2, 1.05]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[0.76, 0.18, 0.76]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.48, 0.16, 0.48]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.64, 0]}>
        <boxGeometry args={[0.24, 0.12, 0.24]} />
        {accentMaterial}
      </mesh>
    </group>
  )
}

function MiniSphereBust({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.18, 8]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.34, 10, 10]} />
        {bodyMaterial}
      </mesh>
    </group>
  )
}

function MiniHGate({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow position={[-0.46, 0.46, 0]}>
        <boxGeometry args={[0.22, 0.92, 0.22]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0.46, 0.46, 0]}>
        <boxGeometry args={[0.22, 0.92, 0.22]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.86, 0]}>
        <boxGeometry args={[1.32, 0.16, 0.24]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.18, 0.12, 0.28]} />
        {bodyMaterial}
      </mesh>
    </group>
  )
}

function MiniStackedTower({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  const blocks: Array<{ x: number; y: number; w: number; h: number; d: number; accent: boolean }> = [
    { x: 0, y: 0.14, w: 0.62, h: 0.22, d: 0.62, accent: false },
    { x: 0.06, y: 0.36, w: 0.54, h: 0.2, d: 0.54, accent: true },
    { x: -0.04, y: 0.56, w: 0.48, h: 0.18, d: 0.48, accent: false },
    { x: 0.05, y: 0.74, w: 0.4, h: 0.16, d: 0.4, accent: true },
    { x: -0.02, y: 0.9, w: 0.3, h: 0.14, d: 0.3, accent: false },
  ]

  return (
    <group scale={0.34}>
      {blocks.map((block, index) => (
        <mesh key={index} castShadow position={[block.x, block.y, 0]}>
          <boxGeometry args={[block.w, block.h, block.d]} />
          {block.accent ? accentMaterial : bodyMaterial}
        </mesh>
      ))}
    </group>
  )
}

function MiniObelisk({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.58, 0.24, 0.58]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[0.4, 0.28, 0.4]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.26, 0.32, 0.26]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow position={[0, 0.88, 0]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        {accentMaterial}
      </mesh>
      <mesh castShadow position={[0, 1.06, 0]}>
        <boxGeometry args={[0.1, 0.16, 0.1]} />
        {bodyMaterial}
      </mesh>
    </group>
  )
}

function MiniRing({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  return (
    <group scale={0.34}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.56, 0.2, 0.56]} />
        {bodyMaterial}
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]}>
        <torusGeometry args={[0.36, 0.09, 8, 16]} />
        {accentMaterial}
      </mesh>
    </group>
  )
}

function MiniStepRise({
  bodyMaterial,
  accentMaterial,
}: {
  bodyMaterial: ReactNode
  accentMaterial: ReactNode
}) {
  const steps: Array<{ x: number; y: number; w: number; h: number; d: number; accent: boolean }> = [
    { x: -0.24, y: 0.1, w: 0.36, h: 0.12, d: 0.5, accent: false },
    { x: -0.08, y: 0.26, w: 0.36, h: 0.12, d: 0.42, accent: true },
    { x: 0.08, y: 0.42, w: 0.36, h: 0.12, d: 0.34, accent: false },
    { x: 0.24, y: 0.58, w: 0.36, h: 0.12, d: 0.26, accent: true },
    { x: 0.38, y: 0.74, w: 0.28, h: 0.1, d: 0.2, accent: false },
  ]

  return (
    <group scale={0.34}>
      {steps.map((step, index) => (
        <mesh key={index} castShadow position={[step.x, step.y, 0]}>
          <boxGeometry args={[step.w, step.h, step.d]} />
          {step.accent ? accentMaterial : bodyMaterial}
        </mesh>
      ))}
    </group>
  )
}

export function MiniSculpture({
  variant,
  tone,
}: {
  variant: number
  tone: MiniSculptureTone
}) {
  const isDark = tone === 'dark'
  const bodyMaterial = (
    <meshStandardMaterial
      color={isDark ? '#141414' : '#f5f5f4'}
      roughness={isDark ? 0.44 : 0.48}
      metalness={isDark ? 0.08 : 0}
    />
  )
  const accentMaterial = (
    <meshStandardMaterial
      color={isDark ? '#050505' : '#ffffff'}
      roughness={0.4}
      metalness={0}
    />
  )
  const pedestalMaterial = (
    <meshStandardMaterial
      color={isDark ? '#1c1917' : '#ffffff'}
      roughness={isDark ? 0.72 : 0.5}
    />
  )

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        {pedestalMaterial}
      </mesh>
      <group position={[0, 0.08, 0]}>
        {variant === 0 ? (
          <MiniStandingFigure bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 1 ? (
          <MiniSpiralColumn bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 2 ? <MiniArch bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} /> : null}
        {variant === 3 ? (
          <MiniTieredPyramid bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 4 ? (
          <MiniSphereBust bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 5 ? <MiniHGate bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} /> : null}
        {variant === 6 ? (
          <MiniStackedTower bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 7 ? (
          <MiniObelisk bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
        {variant === 8 ? <MiniRing bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} /> : null}
        {variant === 9 ? (
          <MiniStepRise bodyMaterial={bodyMaterial} accentMaterial={accentMaterial} />
        ) : null}
      </group>
    </group>
  )
}
