/** 工房内プレイヤー座標（EXIT / 会話距離判定用） */
export const meetSergitoPlayerWorld = {
  x: 0,
  z: 0,
  ready: false,
}

export function setMeetSergitoPlayerWorld(x: number, z: number) {
  meetSergitoPlayerWorld.x = x
  meetSergitoPlayerWorld.z = z
  meetSergitoPlayerWorld.ready = true
}
