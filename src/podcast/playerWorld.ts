/** シネマ内プレイヤー座標（EXIT 判定用） */
export const podcastPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setPodcastPlayerWorld(x: number, z: number) {
  podcastPlayerWorld.x = x
  podcastPlayerWorld.z = z
  podcastPlayerWorld.ready = true
}
