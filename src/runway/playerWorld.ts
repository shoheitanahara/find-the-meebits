/** ランウェイ内プレイヤー座標（EXIT 判定用） */
export const runwayPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setRunwayPlayerWorld(x: number, z: number) {
  runwayPlayerWorld.x = x
  runwayPlayerWorld.z = z
  runwayPlayerWorld.ready = true
}
