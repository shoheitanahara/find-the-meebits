/**
 * Sergito の工房の作業場（フィギュア制作の現場感）。
 * - 手前左: 塗装台（塗料の瓶・筆立て・ターンテーブルの塗りかけフィギュア）
 * - 手前右: 3D プリンター作業台（印刷中の造形台・フィラメントのリール）
 * - 奥の壁: デスク裏の有孔ボードに実物の道具を掛ける（絵ではなく立体）
 * - 奥の角: 材木の束・木箱の山・木挽き台
 * - 天井: 作業場の真上にペンダントライト
 * 小物はボクセル1モデルにまとめて描く（描画コール 2）。
 */
import { useMemo } from 'react'
import { MEET_SERGITO, WORKSHOP_STATIONS } from '../config'
import { VoxelBuilder } from '../../top/voxel/voxelBuilder'
import { VoxelModelMesh } from '../../top/voxel/VoxelModelMesh'

const C = {
  wood: '#7a5a3a',
  woodLight: '#a07850',
  woodDark: '#4a3828',
  plank: '#b89060',
  plankDark: '#9a7448',
  metal: '#3a3a40',
  metalLight: '#8a8e96',
  steel: '#b8bcc4',
  rubber: '#1c1c20',
  primer: '#c8c4bc',
  skin: '#d8a880',
  paintRed: '#c84a3a',
  paintBlue: '#3a6ab8',
  paintYellow: '#e0b040',
  paintGreen: '#4a9a5a',
  paintPink: '#e07aa0',
  paintWhite: '#ece8e0',
  brush: '#d8c09a',
  bristle: '#2a2420',
  printBed: '#7ad8ff',
  filamentOrange: '#ff8a3c',
  filamentTeal: '#3ab8b0',
  filamentPurple: '#8a5ac8',
  filamentWhite: '#e8e8e8',
  pegboard: '#b89a70',
  pegHole: '#6a5438',
  mat: '#2e3a30',
  matEdge: '#3e4c40',
  handleRed: '#b8402e',
  tape: '#e8c030',
} as const

type Vec3 = readonly [number, number, number]

/** 4本脚のテーブル（天板の上面 = topY） */
function addTable(b: VoxelBuilder, w: number, d: number, topY: number, top: string, legs: string) {
  b.box([0, topY - 0.035, 0], [w, 0.07, d], top)
  for (const lx of [-w / 2 + 0.06, w / 2 - 0.06]) {
    for (const lz of [-d / 2 + 0.06, d / 2 - 0.06]) {
      b.box([lx, (topY - 0.07) / 2, lz], [0.07, topY - 0.07, 0.07], legs)
    }
  }
  // 下段の棚板
  b.box([0, 0.28, 0], [w - 0.12, 0.04, d - 0.12], top)
}

/** 手のひらサイズの立体フィギュア（塗りかけ・印刷中の作品） */
function addMiniFigure(b: VoxelBuilder, base: Vec3, scale: number, body: string, head: string) {
  const [x, y, z] = base
  const s = scale
  b.box([x - 0.045 * s, y + 0.09 * s, z], [0.06 * s, 0.18 * s, 0.07 * s], body)
  b.box([x + 0.045 * s, y + 0.09 * s, z], [0.06 * s, 0.18 * s, 0.07 * s], body)
  b.box([x, y + 0.28 * s, z], [0.18 * s, 0.2 * s, 0.1 * s], body)
  b.box([x, y + 0.47 * s, z], [0.16 * s, 0.16 * s, 0.15 * s], head)
}

function addPaintStation(b: VoxelBuilder) {
  const topY = 0.9
  addTable(b, 1.7, 0.9, topY, C.wood, C.metal)
  // 天板に敷いた養生シートと絵の具の跡
  b.box([0, topY + 0.006, 0], [1.4, 0.012, 0.7], C.paintWhite)
  b.box([-0.35, topY + 0.014, 0.12], [0.12, 0.006, 0.08], C.paintRed)
  b.box([0.2, topY + 0.014, -0.18], [0.09, 0.006, 0.1], C.paintBlue)
  // 塗料の瓶（ふた付き）
  const jars = [C.paintRed, C.paintBlue, C.paintYellow, C.paintGreen, C.paintPink, C.paintWhite]
  jars.forEach((color, i) => {
    const x = -0.68 + i * 0.12
    b.box([x, topY + 0.06, -0.28], [0.08, 0.1, 0.08], color)
    b.box([x, topY + 0.12, -0.28], [0.085, 0.025, 0.085], C.rubber)
  })
  // 筆立てと筆
  b.box([0.62, topY + 0.08, -0.25], [0.12, 0.16, 0.12], C.metalLight)
  for (const [dx, dz, h] of [
    [-0.02, -0.02, 0.26],
    [0.03, 0.01, 0.3],
    [0.0, 0.03, 0.22],
  ] as const) {
    b.box([0.62 + dx, topY + 0.12 + h / 2, -0.25 + dz], [0.018, h, 0.018], C.brush)
    b.box([0.62 + dx, topY + 0.13 + h, -0.25 + dz], [0.025, 0.04, 0.025], C.bristle)
  }
  // ターンテーブルと塗りかけのフィギュア（体はサーフェイサーの灰色、頭だけ塗装済み）
  b.box([0.05, topY + 0.03, 0.12], [0.36, 0.04, 0.36], C.rubber)
  b.box([0.05, topY + 0.055, 0.12], [0.3, 0.015, 0.3], C.metalLight)
  addMiniFigure(b, [0.05, topY + 0.065, 0.12], 1.4, C.primer, C.skin)
  // 下段の塗料缶
  for (const [x, color] of [
    [-0.5, C.paintBlue],
    [-0.25, C.paintRed],
    [0.35, C.paintYellow],
  ] as const) {
    b.box([x, 0.4, 0.05], [0.18, 0.2, 0.18], color)
    b.box([x, 0.51, 0.05], [0.19, 0.02, 0.19], C.metalLight)
  }
  // 足元の作業椅子（スツール）
  b.box([0.1, 0.62, 0.85], [0.42, 0.06, 0.42], C.woodDark)
  b.box([0.1, 0.3, 0.85], [0.06, 0.6, 0.06], C.metal)
  b.box([0.1, 0.03, 0.85], [0.4, 0.06, 0.4], C.metal)
}

/** 3D プリンター1台（枠・造形台・ノズル・印刷途中の作品） */
function addPrinter(b: VoxelBuilder, x: number, topY: number, progress: number) {
  const w = 0.62
  const h = 0.72
  b.box([x, topY + 0.05, 0], [w, 0.1, w], C.rubber)
  for (const dx of [-w / 2 + 0.03, w / 2 - 0.03]) {
    for (const dz of [-w / 2 + 0.03, w / 2 - 0.03]) {
      b.box([x + dx, topY + 0.1 + h / 2, dz], [0.04, h, 0.04], C.metal)
    }
  }
  b.box([x, topY + 0.1 + h, 0], [w, 0.04, w], C.metal)
  // 造形台（発光）と印刷途中のフィギュア
  b.box([x, topY + 0.18, 0], [w - 0.14, 0.02, w - 0.14], C.printBed, { glow: true })
  const layers = Math.max(1, Math.round(progress * 6))
  for (let i = 0; i < layers; i += 1) {
    const width = i < 3 ? 0.16 : 0.12
    b.box([x, topY + 0.2 + i * 0.035, 0], [width, 0.03, 0.1], C.filamentWhite)
  }
  // ガントリーとノズル
  const gantryY = topY + 0.22 + layers * 0.035 + 0.08
  b.box([x, gantryY, 0], [w - 0.06, 0.035, 0.05], C.metalLight)
  b.box([x + 0.05, gantryY - 0.04, 0], [0.08, 0.08, 0.08], C.metal)
  b.box([x + 0.05, gantryY - 0.1, 0], [0.025, 0.05, 0.025], C.filamentOrange, { glow: true })
  // 前面の操作パネル
  b.box([x + 0.18, topY + 0.07, w / 2 + 0.005], [0.14, 0.05, 0.01], C.printBed, { glow: true })
}

function addPrinterStation(b: VoxelBuilder) {
  const topY = 0.85
  addTable(b, 2.0, 0.85, topY, C.woodLight, C.metal)
  addPrinter(b, -0.5, topY, 0.45)
  addPrinter(b, 0.3, topY, 0.9)
  // できあがった試作品
  addMiniFigure(b, [0.82, topY, 0.15], 1.0, C.filamentWhite, C.filamentWhite)
  addMiniFigure(b, [0.92, topY, -0.12], 1.0, C.filamentTeal, C.filamentTeal)
  // フィラメントのリール（下段に立てて並べる）
  const spools = [C.filamentOrange, C.filamentTeal, C.filamentPurple, C.filamentWhite]
  spools.forEach((color, i) => {
    const x = -0.75 + i * 0.32
    b.box([x, 0.45, 0], [0.08, 0.26, 0.26], C.rubber)
    b.box([x, 0.45, 0], [0.1, 0.2, 0.2], color)
  })
}

/** 奥の壁の有孔ボードと道具（立体の道具を掛ける） */
function addPegboard(b: VoxelBuilder, centerX: number, wallZ: number) {
  const w = 4.4
  const h = 1.7
  const y = 2.35
  const z = wallZ + 0.03
  b.box([centerX, y, z], [w, h, 0.04], C.pegboard)
  b.box([centerX, y + h / 2 + 0.03, z + 0.01], [w + 0.1, 0.06, 0.06], C.woodDark)
  b.box([centerX, y - h / 2 - 0.03, z + 0.01], [w + 0.1, 0.06, 0.06], C.woodDark)
  // 有孔ボードの穴（細かい点）
  for (let ix = -10; ix <= 10; ix += 1) {
    for (let iy = -3; iy <= 3; iy += 1) {
      b.box([centerX + ix * 0.2, y + iy * 0.22, z + 0.021], [0.025, 0.025, 0.004], C.pegHole)
    }
  }
  const fz = z + 0.06
  // ハンマー
  b.box([centerX - 1.7, y + 0.05, fz], [0.05, 0.5, 0.04], C.woodLight)
  b.box([centerX - 1.7, y + 0.33, fz], [0.22, 0.08, 0.07], C.metal)
  // レンチ2本
  for (const [dx, len] of [
    [-1.3, 0.42],
    [-1.12, 0.34],
  ] as const) {
    b.box([centerX + dx, y, fz], [0.04, len, 0.02], C.steel)
    b.box([centerX + dx, y + len / 2, fz], [0.09, 0.06, 0.02], C.steel)
  }
  // のこぎり
  b.box([centerX - 0.55, y - 0.05, fz], [0.62, 0.16, 0.012], C.steel)
  b.box([centerX - 0.15, y - 0.03, fz], [0.16, 0.2, 0.05], C.handleRed)
  // ドライバー4本
  for (let i = 0; i < 4; i += 1) {
    const dx = 0.35 + i * 0.16
    b.box([centerX + dx, y + 0.18, fz], [0.05, 0.16, 0.05], i % 2 === 0 ? C.handleRed : C.tape)
    b.box([centerX + dx, y - 0.02, fz], [0.015, 0.24, 0.015], C.steel)
  }
  // メジャーとクランプ
  b.box([centerX + 1.2, y + 0.2, fz], [0.16, 0.16, 0.07], C.tape)
  b.box([centerX + 1.6, y - 0.05, fz], [0.05, 0.42, 0.04], C.metal)
  b.box([centerX + 1.68, y + 0.13, fz], [0.16, 0.05, 0.05], C.metal)
  b.box([centerX + 1.68, y - 0.23, fz], [0.16, 0.05, 0.05], C.metal)
  // 下の小棚にフィラメントのリールと瓶
  b.box([centerX + 1.3, y - h / 2 - 0.15, z + 0.15], [1.4, 0.04, 0.26], C.woodDark)
  for (const [i, color] of [C.filamentOrange, C.filamentPurple, C.filamentTeal].entries()) {
    b.box([centerX + 0.85 + i * 0.3, y - h / 2 - 0.01, z + 0.15], [0.08, 0.24, 0.24], color)
  }
}

function addLumber(b: VoxelBuilder) {
  // 床に積んだ板（段ごとに少しずらす）
  for (let row = 0; row < 4; row += 1) {
    for (let i = 0; i < 3; i += 1) {
      const color = (row + i) % 2 === 0 ? C.plank : C.plankDark
      b.box([(row % 2) * 0.08, 0.07 + row * 0.13, -0.3 + i * 0.3], [2.0, 0.12, 0.26], color)
    }
  }
  // 壁に立てかけた長い板（奥の壁側）
  for (let i = 0; i < 5; i += 1) {
    const x = -0.8 + i * 0.32
    const h = 2.4 + (i % 2) * 0.35
    b.box([x, h / 2, -0.82 + (i % 2) * 0.05], [0.24, h, 0.08], i % 2 === 0 ? C.plank : C.plankDark)
  }
}

function addCrates(b: VoxelBuilder) {
  const crate = (x: number, y: number, z: number, size: number) => {
    b.box([x, y + size / 2, z], [size, size, size], C.woodLight)
    // 板の継ぎ目（側面と前面の帯）
    for (const dy of [-size * 0.25, size * 0.25]) {
      b.box([x, y + size / 2 + dy, z + size / 2 + 0.005], [size, 0.04, 0.01], C.woodDark)
      b.box([x + size / 2 + 0.005, y + size / 2 + dy, z], [0.01, 0.04, size], C.woodDark)
    }
  }
  crate(-0.35, 0, -0.3, 0.8)
  crate(0.5, 0, -0.35, 0.7)
  crate(-0.25, 0.8, -0.35, 0.6)
  crate(0.4, 0, 0.45, 0.55)
  // 木箱の上の道具箱
  b.box([0.5, 0.78, -0.35], [0.5, 0.16, 0.26], C.handleRed)
  b.box([0.5, 0.88, -0.35], [0.3, 0.04, 0.04], C.metal)
}

function addSawhorse(b: VoxelBuilder) {
  for (const dx of [-0.75, 0.75]) {
    b.box([dx, 0.68, 0], [0.1, 0.08, 0.6], C.woodDark)
    for (const dz of [-0.22, 0.22]) {
      b.box([dx, 0.34, dz], [0.07, 0.66, 0.07], C.woodDark)
    }
  }
  // 板とのこぎり、木くず
  b.box([0, 0.76, 0], [2.0, 0.07, 0.34], C.plank)
  b.box([0.25, 0.81, 0.02], [0.55, 0.012, 0.12], C.steel)
  b.box([0.6, 0.83, 0.02], [0.12, 0.06, 0.05], C.handleRed)
  for (const [dx, dz] of [
    [-0.3, 0.3],
    [0.4, -0.25],
    [0.05, 0.35],
  ] as const) {
    b.box([dx, 0.02, dz], [0.14, 0.02, 0.08], C.plank)
  }
}

/** デスクの下の作業マット */
function addDeskMat(b: VoxelBuilder) {
  const { desk } = MEET_SERGITO
  b.box([desk.x, 0.018, desk.z + 0.3], [4.4, 0.012, 2.6], C.matEdge)
  b.box([desk.x, 0.026, desk.z + 0.3], [4.2, 0.008, 2.4], C.mat)
}

/** 天井から吊るす作業用ペンダントライト（コード・笠・電球＋光） */
function PendantLamp({ x, z, height = 3.25 }: { x: number; z: number; height?: number }) {
  const ceilingY = MEET_SERGITO.ceilingY
  const cord = ceilingY - height
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height + cord / 2, 0]}>
        <boxGeometry args={[0.025, cord, 0.025]} />
        <meshStandardMaterial color="#1c1c20" roughness={0.6} />
      </mesh>
      <mesh position={[0, height, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.42, 0.32, 12, 1, true]} />
        <meshStandardMaterial color="#2a3a34" roughness={0.45} metalness={0.5} side={2} />
      </mesh>
      <mesh position={[0, height - 0.12, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#fff6e8" emissive="#ffcf8a" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, height - 0.25, 0]} intensity={9} distance={6.5} decay={2} color="#ffd8a0" />
    </group>
  )
}

export function WorkshopStations() {
  const model = useMemo(() => {
    const b = new VoxelBuilder()
    const { paint, printer, lumber, crates, sawhorse } = WORKSHOP_STATIONS
    const { desk, roomMinZ } = MEET_SERGITO
    b.group([paint.x, 0, paint.z], addPaintStation)
    b.group([printer.x, 0, printer.z], addPrinterStation)
    b.group([lumber.x, 0, lumber.z], addLumber)
    b.group([crates.x, 0, crates.z], addCrates)
    b.group([sawhorse.x, 0, sawhorse.z], addSawhorse)
    // 奥の壁の内側の面（壁の厚み 0.28）
    addPegboard(b, desk.x, roomMinZ + 0.28)
    addDeskMat(b)
    return b.build()
  }, [])

  const { paint, printer } = WORKSHOP_STATIONS
  const { desk } = MEET_SERGITO

  return (
    <group>
      <VoxelModelMesh model={model} />
      <PendantLamp x={desk.x} z={desk.z + 0.2} />
      <PendantLamp x={paint.x} z={paint.z} />
      <PendantLamp x={printer.x} z={printer.z} />
    </group>
  )
}
