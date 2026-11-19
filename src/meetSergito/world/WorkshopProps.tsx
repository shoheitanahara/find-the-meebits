import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { MEET_SERGITO, WORKSHOP_DESK_TOP_Y } from '../config'
import { VoxelBuilder } from '../../top/voxel/voxelBuilder'
import { VoxelModelMesh } from '../../top/voxel/VoxelModelMesh'

const C = {
  wood: '#7a5a3a',
  woodEdge: '#5e4430',
  woodDark: '#4a3828',
  metal: '#3a3a40',
  steel: '#a8acb4',
  brass: '#c49a52',
  black: '#1a1a20',
  key: '#2a2a30',
  paper: '#f2ead8',
  paperLine: '#c8bca4',
  pencil: '#e0b040',
  leather: '#6a4428',
  handle: '#a07048',
  ceramic: '#e8e4dc',
  coffee: '#3a2418',
  red: '#c84a3a',
  blue: '#3a6ab8',
  green: '#4a9a5a',
  yellow: '#e0b040',
} as const

/**
 * デスクの上と下の小物（ボクセル1モデル）。原点はデスクの中心・床。
 * 天板の中央の列（x = -0.85 / 0 / 0.85）には日替わりのフィギュアが立つので空けておく。
 */
function buildDeskDetails(topY: number) {
  const b = new VoxelBuilder()
  const y = topY + 0.035

  // 天板の前縁（厚み）と下の引き出し（左側）
  b.box([0, topY - 0.06, 0.69], [3.2, 0.06, 0.03], C.woodEdge)
  const cab = { x: -1.0, w: 0.82, d: 1.15 }
  const cabH = topY - 0.09
  b.box([cab.x, cabH / 2, 0], [cab.w, cabH, cab.d], C.woodDark)
  for (let i = 0; i < 3; i += 1) {
    const dy = cabH * (0.2 + i * 0.3)
    b.box([cab.x, dy, cab.d / 2 + 0.01], [cab.w - 0.08, cabH * 0.26, 0.02], C.wood)
    b.box([cab.x, dy, cab.d / 2 + 0.03], [0.14, 0.03, 0.03], C.brass)
  }

  // キーボードとマウス（モニターの手前）
  b.box([0.55, y + 0.012, 0.32], [0.52, 0.024, 0.16], C.black)
  for (let row = 0; row < 3; row += 1) {
    b.box([0.55, y + 0.027, 0.27 + row * 0.045], [0.46, 0.008, 0.03], C.key)
  }
  b.box([0.95, y + 0.015, 0.34], [0.06, 0.03, 0.1], C.black)

  // 開いたスケッチブックと鉛筆
  b.box([-0.4, y + 0.006, 0.38], [0.5, 0.012, 0.34], C.paper)
  b.box([-0.4, y + 0.013, 0.38], [0.012, 0.002, 0.34], C.paperLine)
  for (const dz of [-0.06, 0.02, 0.1]) {
    b.box([-0.52, y + 0.013, 0.38 + dz], [0.16, 0.002, 0.01], C.paperLine)
  }
  b.box([-0.22, y + 0.02, 0.44], [0.2, 0.014, 0.014], C.pencil)

  // 彫刻刀のセット（革のロールに並べる）
  b.box([-1.25, y + 0.005, 0.38], [0.42, 0.01, 0.28], C.leather)
  for (let i = 0; i < 5; i += 1) {
    const x = -1.42 + i * 0.085
    b.box([x, y + 0.025, 0.42], [0.03, 0.03, 0.12], C.handle)
    b.box([x, y + 0.02, 0.3], [0.012, 0.012, 0.12], C.steel)
  }

  // 天板の左手前の角に万力
  b.box([-1.5, y + 0.06, 0.55], [0.18, 0.12, 0.2], C.metal)
  b.box([-1.5, y + 0.13, 0.55], [0.22, 0.04, 0.08], C.steel)
  b.box([-1.5, y + 0.06, 0.68], [0.03, 0.03, 0.14], C.steel)

  // 部品トレー（小さな色つきパーツ）
  b.box([-0.4, y + 0.02, -0.38], [0.36, 0.04, 0.22], C.metal)
  const parts = [C.red, C.blue, C.green, C.yellow, C.steel, C.red]
  parts.forEach((color, i) => {
    b.box([-0.53 + (i % 3) * 0.13, y + 0.045, -0.43 + Math.floor(i / 3) * 0.1], [0.04, 0.03, 0.04], color)
  })

  // ペン立てとマグカップ（右端）
  b.box([1.35, y + 0.07, -0.35], [0.1, 0.14, 0.1], C.woodDark)
  for (const [dx, dz, color] of [
    [-0.02, 0.0, C.pencil],
    [0.02, 0.02, C.blue],
    [0.0, -0.02, C.red],
  ] as const) {
    b.box([1.35 + dx, y + 0.19, -0.35 + dz], [0.014, 0.14, 0.014], color)
  }
  b.box([1.32, y + 0.055, 0.3], [0.1, 0.11, 0.1], C.ceramic)
  b.box([1.32, y + 0.105, 0.3], [0.08, 0.01, 0.08], C.coffee)
  b.box([1.385, y + 0.055, 0.3], [0.03, 0.06, 0.02], C.ceramic)

  return b.build()
}

/** 立ち作業用デスク（天板 ~1.05m） */
export function WorkshopDesk() {
  const { desk, colors } = MEET_SERGITO
  const topY = WORKSHOP_DESK_TOP_Y
  const deskSurfaceY = topY + 0.035
  const legH = topY - 0.04
  const details = useMemo(() => buildDeskDetails(topY), [topY])

  return (
    <group position={[desk.x, 0, desk.z]}>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.07, 1.35]} />
        <meshStandardMaterial color={colors.wood} roughness={0.62} metalness={0.05} />
      </mesh>
      {[
        [-1.45, -0.55],
        [1.45, -0.55],
        [-1.45, 0.55],
        [1.45, 0.55],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, legH / 2, lz]} castShadow>
          <boxGeometry args={[0.07, legH, 0.07]} />
          <meshStandardMaterial color={colors.metal} roughness={0.42} metalness={0.55} />
        </mesh>
      ))}

      {/* モニター — 天板上面から積み上げ */}
      <group position={[0.55, deskSurfaceY, -0.2]}>
        <mesh position={[0, 0.11, 0.02]} castShadow>
          <boxGeometry args={[0.14, 0.22, 0.12]} />
          <meshStandardMaterial color={colors.metal} roughness={0.45} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.85, 0.52, 0.05]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.45} />
        </mesh>
        <mesh position={[0, 0.38, 0.03]}>
          <boxGeometry args={[0.78, 0.44, 0.015]} />
          <meshStandardMaterial
            color={colors.screen}
            emissive={colors.screenGlow}
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>
        <Text
          position={[0, 0.38, 0.045]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          MEEBCO
        </Text>
      </group>

      {/* 道具・紙・小物（明かりは真上のペンダントライトに任せ、机の上にランプは置かない） */}
      <VoxelModelMesh model={details} />
    </group>
  )
}
