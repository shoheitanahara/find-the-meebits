import { useEffect } from 'react'
import { Html, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  JAZZ_BAR,
  JAZZ_BAR_SHOW_CREDIT,
  JAZZ_BAR_SHOW_TITLE,
} from '../config'
import { useJazzBarStore } from '../store'
import {
  JAZZ_BAR_YT_PLAYER_ELEMENT_ID,
  destroyJazzBarYoutubePlayer,
  mountJazzBarYoutubePlayer,
} from '../youtubePlayer'

/** iframe / YT Player 解像度（16:9） */
const EMBED_W = 960
const EMBED_H = 540

/**
 * drei Html(transform) の換算:
 * ワールド幅 ≈ CSS幅 × (distanceFactor / 400)
 */
const DISTANCE_FACTOR = (JAZZ_BAR.screen.width / EMBED_W) * 400

/**
 * 奥壁開口に張り付くスクリーン。
 * occlude="blending" で WebGL（アバター等）を前面、映像を壁面側に置く。
 */
export function JazzBarScreen() {
  const playbackStarted = useJazzBarStore((state) => state.playbackStarted)
  const { gl } = useThree()
  const { screen, colors } = JAZZ_BAR

  useEffect(() => {
    if (!playbackStarted) return

    let cancelled = false
    void mountJazzBarYoutubePlayer({ width: EMBED_W, height: EMBED_H }).then((player) => {
      if (cancelled && player) destroyJazzBarYoutubePlayer()
    })

    // blending は canvas を pointer-events:none にするので、視点操作用に戻す
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'

    return () => {
      cancelled = true
      destroyJazzBarYoutubePlayer()
    }
  }, [playbackStarted, gl])

  return (
    <group position={[screen.x, screen.y, screen.z]}>
      <Text
        position={[0, screen.height / 2 + 0.38, 0.06]}
        fontSize={0.22}
        color={colors.accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {JAZZ_BAR_SHOW_TITLE}
      </Text>
      <Text
        position={[0, screen.height / 2 + 0.12, 0.06]}
        fontSize={0.14}
        color="#a8b4c8"
        anchorX="center"
        anchorY="middle"
      >
        {JAZZ_BAR_SHOW_CREDIT}
      </Text>

      {playbackStarted ? (
        <Html
          transform
          occlude="blending"
          center
          distanceFactor={DISTANCE_FACTOR}
          position={[0, 0, 0]}
          /** blending は canvas z-index を range[0]/2 にする。UI(z-40〜100)より低く保つ */
          zIndexRange={[24, 0]}
          style={{
            width: EMBED_W,
            height: EMBED_H,
            pointerEvents: 'none',
          }}
        >
          <div
            id={JAZZ_BAR_YT_PLAYER_ELEMENT_ID}
            style={{
              width: EMBED_W,
              height: EMBED_H,
              background: '#000',
            }}
          />
        </Html>
      ) : null}
    </group>
  )
}
