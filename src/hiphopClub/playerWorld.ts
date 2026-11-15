/** シネマ内プレイヤー座標（EXIT 判定用） */
export const clubPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setClubPlayerWorld(x: number, z: number) {
  clubPlayerWorld.x = x
  clubPlayerWorld.z = z
  clubPlayerWorld.ready = true
}
