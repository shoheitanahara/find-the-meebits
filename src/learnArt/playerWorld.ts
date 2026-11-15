/** シネマ内プレイヤー座標（EXIT 判定用） */
export const learnArtPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setLearnArtPlayerWorld(x: number, z: number) {
  learnArtPlayerWorld.x = x
  learnArtPlayerWorld.z = z
  learnArtPlayerWorld.ready = true
}
