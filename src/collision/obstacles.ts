export type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const CENTER_CORRIDOR_GAP = 6

function boxFromCenter(
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
  padding = 0,
): ObstacleBox {
  const halfWidth = width / 2 + padding
  const halfDepth = depth / 2 + padding

  return {
    minX: centerX - halfWidth,
    maxX: centerX + halfWidth,
    minZ: centerZ - halfDepth,
    maxZ: centerZ + halfDepth,
  }
}

function splitBoxesFromCenter(
  centerZ: number,
  totalWidth: number,
  depth: number,
  gap = CENTER_CORRIDOR_GAP,
  padding = 0,
): ObstacleBox[] {
  const wingWidth = (totalWidth - gap) / 2
  const offsetX = gap / 2 + wingWidth / 2

  return [
    boxFromCenter(-offsetX, centerZ, wingWidth, depth, padding),
    boxFromCenter(offsetX, centerZ, wingWidth, depth, padding),
  ]
}

const buildingDefs: Array<{ position: [number, number, number]; size: [number, number, number] }> = [
  { position: [-32, 0.625, -27], size: [15, 1.25, 4] },
  { position: [32, 0.75, -26], size: [14, 1.5, 4] },
  { position: [-36, 0.575, 29], size: [16, 1.15, 4] },
  { position: [35, 0.675, 30], size: [15, 1.35, 4] },
]

const treePositions: Array<[number, number, number]> = [
  [-22, 0, -15],
  [-16, 0, 22],
  [20, 0, -18],
  [24, 0, 20],
  [-44, 0, 3],
  [44, 0, -5],
]

const benchPositions: Array<[number, number, number]> = [
  [-14, 0.35, 12],
  [14, 0.35, 12],
  [-28, 0.35, -22],
  [28, 0.35, 24],
]

const sculpturePositions: Array<[number, number, number]> = [
  [-50, 0, -42],
  [-28, 0, -50],
  [18, 0, -52],
  [48, 0, -36],
  [-52, 0, 26],
  [-24, 0, 50],
  [22, 0, 52],
  [52, 0, 30],
]

const wallPanelPositions: Array<[number, number, number]> = [
  [-54, 0.575, -10],
  [-54, 0.575, 12],
  [54, 0.575, -14],
  [54, 0.575, 10],
  [-12, 0.575, -54],
  [14, 0.575, -54],
  [-14, 0.575, 54],
  [12, 0.575, 54],
]

function wallPanelBox(position: [number, number, number]): ObstacleBox {
  const isSideWall = Math.abs(position[0]) > Math.abs(position[2])

  if (isSideWall) {
    return boxFromCenter(position[0], position[2], 0.35, 5.2, 0.05)
  }

  return boxFromCenter(position[0], position[2], 5.2, 0.35, 0.05)
}

function signboardBox(): ObstacleBox {
  return boxFromCenter(-15, -15, 4.2, 3.2, 0.1)
}

export const WORLD_OBSTACLES: ObstacleBox[] = [
  ...buildingDefs.map((building) =>
    boxFromCenter(building.position[0], building.position[2], building.size[0], building.size[2], 0.1),
  ),
  ...splitBoxesFromCenter(-43, 28, 3.5, CENTER_CORRIDOR_GAP, 0.1),
  ...splitBoxesFromCenter(44, 28, 3.5, CENTER_CORRIDOR_GAP, 0.1),
  ...treePositions.map((position) => boxFromCenter(position[0], position[2], 1.8, 1.8, 0.05)),
  ...benchPositions.map((position) => boxFromCenter(position[0], position[2], 3.2, 0.8, 0.05)),
  ...sculpturePositions.map((position) => boxFromCenter(position[0], position[2], 2.6, 2.6, 0.1)),
  ...wallPanelPositions.map((position) => wallPanelBox(position)),
  ...splitBoxesFromCenter(-22, 14, 5, 5, 0.1),
  signboardBox(),
  ...splitBoxesFromCenter(52, 7.4, 0.5, 4, 0.1),
]
