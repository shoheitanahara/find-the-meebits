/** シネマ内プレイヤー座標（EXIT 判定用） */
export const cinemaPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setCinemaPlayerWorld(x: number, z: number) {
  cinemaPlayerWorld.x = x
  cinemaPlayerWorld.z = z
  cinemaPlayerWorld.ready = true
}
