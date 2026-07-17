import type { VenueId } from '../game/venueConfig'
import { getMuseumSeasonTreeCollisionCenters } from '../world/MuseumSeasonDecor'
import {
  BENCH_POSITIONS,
  SCULPTURE_POSITIONS,
  VRM_SCULPTURE_PLACEMENTS,
  WALL_PANEL_POSITIONS,
} from '../world/worldLandmarks'
import {
  CLUB_BAR_PLACEMENTS,
  CLUB_COLLISION,
  CLUB_COUCH_PLACEMENTS,
  CLUB_DJ_BOOTH_POSITION,
  CLUB_PARTITION_PLACEMENTS,
  CLUB_SPEAKER_PLACEMENTS,
  CLUB_VRM_SCULPTURE_PLACEMENTS,
  clubWorldFootprint,
} from '../world/clubLandmarks'

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

const museumBuildingDefs: Array<{ position: [number, number, number]; size: [number, number, number] }> = [
  { position: [-32, 0.625, -27], size: [15, 1.25, 4] },
  { position: [32, 0.75, -26], size: [14, 1.5, 4] },
  { position: [-36, 0.575, 29], size: [16, 1.15, 4] },
  { position: [35, 0.675, 30], size: [15, 1.35, 4] },
]


function wallPanelBox(position: [number, number, number]): ObstacleBox {
  const isSideWall = Math.abs(position[0]) > Math.abs(position[2])

  if (isSideWall) {
    return boxFromCenter(position[0], position[2], 0.35, 5.2, 0.05)
  }

  return boxFromCenter(position[0], position[2], 5.2, 0.35, 0.05)
}

function clubOrientedObstacle(
  centerX: number,
  centerZ: number,
  localWidth: number,
  localDepth: number,
  rotationY: number,
  padding = 0,
): ObstacleBox {
  const { width, depth } = clubWorldFootprint(localWidth, localDepth, rotationY)
  return boxFromCenter(centerX, centerZ, width, depth, padding)
}

function buildClubDjBoothObstacles(): ObstacleBox[] {
  const [centerX, , centerZ] = CLUB_DJ_BOOTH_POSITION
  const layout = CLUB_COLLISION.djBooth

  return [
    boxFromCenter(
      centerX,
      centerZ + layout.counter.offsetZ,
      layout.counter.width,
      layout.counter.depth,
      0.08,
    ),
    boxFromCenter(
      centerX - layout.sideCabinet.offsetX,
      centerZ + layout.sideCabinet.offsetZ,
      layout.sideCabinet.width,
      layout.sideCabinet.depth,
      0.06,
    ),
    boxFromCenter(
      centerX + layout.sideCabinet.offsetX,
      centerZ + layout.sideCabinet.offsetZ,
      layout.sideCabinet.width,
      layout.sideCabinet.depth,
      0.06,
    ),
  ]
}

function buildClubObstacles(): ObstacleBox[] {
  return [
    ...CLUB_PARTITION_PLACEMENTS.map(({ position, size }) =>
      boxFromCenter(position[0], position[2], size[0], size[2], 0.08),
    ),
    ...CLUB_COUCH_PLACEMENTS.map(({ position, footprint, rotationY }) =>
      clubOrientedObstacle(position[0], position[2], footprint[0], footprint[1], rotationY, 0.06),
    ),
    ...CLUB_SPEAKER_PLACEMENTS.map(({ position, footprint, rotationY }) =>
      clubOrientedObstacle(position[0], position[2], footprint[0], footprint[1], rotationY, 0.06),
    ),
    ...CLUB_BAR_PLACEMENTS.map(({ position, footprint, rotationY }) =>
      clubOrientedObstacle(position[0], position[2], footprint[0], footprint[1], rotationY, 0.08),
    ),
    ...CLUB_VRM_SCULPTURE_PLACEMENTS.map(({ position }) =>
      boxFromCenter(position[0], position[2], CLUB_COLLISION.sculpture.width, CLUB_COLLISION.sculpture.depth, 0.1),
    ),
    ...buildClubDjBoothObstacles(),
  ]
}

function buildMuseumObstacles(): ObstacleBox[] {
  return [
    ...museumBuildingDefs.map((building) =>
      boxFromCenter(building.position[0], building.position[2], building.size[0], building.size[2], 0.1),
    ),
    ...splitBoxesFromCenter(-43, 28, 3.5, CENTER_CORRIDOR_GAP, 0.1),
    ...splitBoxesFromCenter(44, 28, 3.5, CENTER_CORRIDOR_GAP, 0.1),
    ...BENCH_POSITIONS.map((position) => boxFromCenter(position[0], position[2], 3.2, 0.8, 0.05)),
    ...SCULPTURE_POSITIONS.map((position) => boxFromCenter(position[0], position[2], 2.8, 2.8, 0.1)),
    ...VRM_SCULPTURE_PLACEMENTS.map(({ position }) =>
      boxFromCenter(position[0], position[2], 2.8, 2.8, 0.1),
    ),
    ...WALL_PANEL_POSITIONS.map((position) => wallPanelBox(position)),
    ...splitBoxesFromCenter(-22, 14, 5, 5, 0.1),
    boxFromCenter(-15, -15, 4.2, 3.2, 0.1),
    ...splitBoxesFromCenter(52, 7.4, 0.5, 4, 0.1),
    // 季節デコの幹のみ（ヒント landmark には含めない）
    ...getMuseumSeasonTreeCollisionCenters().map(([x, z]) => boxFromCenter(x, z, 0.7, 0.7, 0.05)),
  ]
}

export function getWorldObstacles(venueId: VenueId = 'museum'): ObstacleBox[] {
  return venueId === 'club' ? buildClubObstacles() : buildMuseumObstacles()
}

/** @deprecated Use getWorldObstacles(venueId) */
export const WORLD_OBSTACLES = buildMuseumObstacles()
