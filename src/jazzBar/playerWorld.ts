/** シネマ内プレイヤー座標（EXIT 判定用） */
export const jazzBarPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setJazzBarPlayerWorld(x: number, z: number) {
  jazzBarPlayerWorld.x = x
  jazzBarPlayerWorld.z = z
  jazzBarPlayerWorld.ready = true
}
