import type { MuseumSeason } from './museumSeason'
import { getMuseumSeason } from './museumSeason'
import { PalmTree } from './PalmTree'

/**
 * 外周の季節デコ（ヤシ・木など）。ヒント landmark には登録しない。
 */
export function MuseumSeasonDecor() {
  const season = getMuseumSeason()

  if (season === 'default') {
    return null
  }

  return (
    <group>
      {getPerimeterTreePositions(season).map((placement, index) => (
        <SeasonTree
          key={`${season}-${index}-${placement.position.join(',')}`}
          season={season}
          position={placement.position}
          scale={placement.scale}
          rotationY={placement.rotationY}
          lean={placement.lean}
        />
      ))}
    </group>
  )
}

type TreePlacement = {
  position: [number, number, number]
  scale: number
  rotationY: number
  lean: number
}

/** プラザ外縁〜ワールド端のあいだ。ヒント対象外の装飾のみ。 */
function getPerimeterTreePositions(season: MuseumSeason): TreePlacement[] {
  if (season === 'summer') {
    return getSummerPalmPlacements()
  }

  const ring = [
    [-48, 0, 64],
    [-32, 0, 68],
    [-16, 0, 70],
    [16, 0, 70],
    [32, 0, 68],
    [48, 0, 64],
    [-48, 0, -64],
    [-28, 0, -68],
    [0, 0, -70],
    [28, 0, -68],
    [48, 0, -64],
    [-66, 0, -40],
    [-68, 0, -16],
    [-70, 0, 8],
    [-68, 0, 32],
    [-64, 0, 48],
    [66, 0, -40],
    [68, 0, -16],
    [70, 0, 8],
    [68, 0, 32],
    [64, 0, 48],
  ] as const

  const positions = season === 'winter' ? ring.filter((_, index) => index % 2 === 0) : ring

  return positions.map((position, index) => ({
    position: [...position] as [number, number, number],
    scale: 0.85 + (index % 5) * 0.08,
    rotationY: (index * 0.7) % (Math.PI * 2),
    lean: 0.08 + (index % 3) * 0.04,
  }))
}

/** 波打ち砂浜の弧に沿って配置（半径に小さなうねり） */
function getSummerPalmPlacements(): TreePlacement[] {
  // プラザは正方形 ±50。チェビシェフ距離 > 56 の外周帯だけに置く
  const plazaHalf = 50
  const minOutside = plazaHalf + 6
  const count = 18
  const placements: TreePlacement[] = []

  for (let index = 0; index < count; index += 1) {
    const t = (index / count) * Math.PI * 2
    // 正方形外周に沿う半径（角は √2 倍）
    const squareR = plazaHalf / Math.max(Math.abs(Math.cos(t)), Math.abs(Math.sin(t)))
    const radius =
      squareR +
      7.5 +
      Math.sin(t * 4 + 0.5) * 1.2 +
      (index % 3) * 0.5

    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius

    if (Math.max(Math.abs(x), Math.abs(z)) < minOutside) {
      continue
    }

    // 入口正面（+Z）は少し空ける
    if (z > plazaHalf + 10 && Math.abs(x) < 12) {
      continue
    }

    placements.push({
      position: [x, 0, z],
      scale: 0.82 + (index % 5) * 0.08,
      rotationY: t + Math.PI / 2 + (index % 4) * 0.15,
      lean: 0.07 + (index % 4) * 0.04,
    })
  }

  return placements
}

function SeasonTree({
  season,
  position,
  scale,
  rotationY,
  lean,
}: {
  season: Exclude<MuseumSeason, 'default'>
  position: [number, number, number]
  scale: number
  rotationY: number
  lean: number
}) {
  if (season === 'summer') {
    return <PalmTree position={position} scale={scale} rotationY={rotationY} lean={lean} />
  }

  if (season === 'winter') {
    return <BareTree position={position} scale={scale} rotationY={rotationY} />
  }

  const canopyColor =
    season === 'spring' ? '#f7b6c8' : season === 'autumn' ? '#d4743a' : '#5f9e4a'

  return (
    <LeafyTree
      position={position}
      scale={scale}
      rotationY={rotationY}
      canopyColor={canopyColor}
      trunkColor={season === 'autumn' ? '#5c3d28' : '#4a3426'}
    />
  )
}

function LeafyTree({
  position,
  scale,
  rotationY,
  canopyColor,
  trunkColor,
}: {
  position: [number, number, number]
  scale: number
  rotationY: number
  canopyColor: string
  trunkColor: string
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 2.0, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.55, 0]}>
        <sphereGeometry args={[1.15, 8, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0.55, 2.35, 0.2]}>
        <sphereGeometry args={[0.7, 7, 7]} />
        <meshStandardMaterial color={canopyColor} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[-0.45, 2.45, -0.25]}>
        <sphereGeometry args={[0.65, 7, 7]} />
        <meshStandardMaterial color={canopyColor} roughness={0.86} />
      </mesh>
    </group>
  )
}

function BareTree({
  position,
  scale,
  rotationY,
}: {
  position: [number, number, number]
  scale: number
  rotationY: number
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 2.3, 6]} />
        <meshStandardMaterial color="#5a534c" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.45, 2.4, 0]} rotation={[0, 0, 0.7]}>
        <cylinderGeometry args={[0.07, 0.1, 1.2, 5]} />
        <meshStandardMaterial color="#5a534c" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-0.4, 2.55, 0.1]} rotation={[0, 0, -0.65]}>
        <cylinderGeometry args={[0.06, 0.09, 1.05, 5]} />
        <meshStandardMaterial color="#5a534c" roughness={0.92} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.16, 8]} />
        <meshStandardMaterial color="#eef2f6" roughness={0.95} />
      </mesh>
    </group>
  )
}

/** collision 用。幹付近だけ。ヒントとは無関係。 */
export function getMuseumSeasonTreeCollisionCenters(): Array<[number, number]> {
  const season = getMuseumSeason()
  if (season === 'default') {
    return []
  }

  return getPerimeterTreePositions(season).map(({ position }) => [position[0], position[2]])
}
