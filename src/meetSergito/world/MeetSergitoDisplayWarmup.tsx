import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMeetSergitoStore } from '../store'

/** 全アセット揃ったあと、描画が安定するまで待つフレーム数 */
const DISPLAY_SETTLE_FRAMES = 4

/**
 * ファイル取得完了後に数フレーム描画してからオーバーレイを外す。
 * 全シーン compile は端末によっては固まるので行わない。
 */
export function MeetSergitoDisplayWarmup() {
  const assetsReady = useMeetSergitoStore((state) => state.assetsReady)
  const bootPhase = useMeetSergitoStore((state) => state.bootPhase)
  const settleFramesRef = useRef(0)

  useFrame(() => {
    if (!assetsReady || bootPhase === 'ready') {
      settleFramesRef.current = 0
      return
    }

    settleFramesRef.current += 1
    if (settleFramesRef.current >= DISPLAY_SETTLE_FRAMES) {
      useMeetSergitoStore.getState().setDisplayReady()
    }
  })

  return null
}
