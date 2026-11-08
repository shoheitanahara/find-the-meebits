import { useEffect } from 'react'
import { Html, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  CINEMA,
  CINEMA_FILM_CREDIT,
  CINEMA_FILM_TITLE,
} from '../config'
import { useCinemaStore } from '../store'
import {
  CINEMA_YT_PLAYER_ELEMENT_ID,
  destroyCinemaYoutubePlayer,
  mountCinemaYoutubePlayer,
} from '../youtubePlayer'

/** iframe / YT Player 解像度（16:9） */
const EMBED_W = 960
const EMBED_H = 540

/**
 * drei Html(transform) の換算:
 * ワールド幅 ≈ CSS幅 × (distanceFactor / 400)
 */
const DISTANCE_FACTOR = (CINEMA.screen.width / EMBED_W) * 400

/**
 * 奥壁開口に張り付くスクリーン。
 * occlude="blending" で WebGL（アバター等）を前面、映像を壁面側に置く。
 */
export function CinemaScreen() {
  const playbackStarted = useCinemaStore((state) => state.playbackStarted)
  const { gl } = useThree()
  const { screen, colors } = CINEMA

  useEffect(() => {
    if (!playbackStarted) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      void mountCinemaYoutubePlayer({ width: EMBED_W, height: EMBED_H }).then((player) => {
        if (cancelled && player) {
          destroyCinemaYoutubePlayer()
        }
      })
    }, 80)

    // blending は canvas を pointer-events:none にするので、視点操作用に戻す
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      destroyCinemaYoutubePlayer()
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
        {CINEMA_FILM_TITLE}
      </Text>
      <Text
        position={[0, screen.height / 2 + 0.12, 0.06]}
        fontSize={0.14}
        color="#a8b4c8"
        anchorX="center"
        anchorY="middle"
      >
        {CINEMA_FILM_CREDIT}
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
            id={CINEMA_YT_PLAYER_ELEMENT_ID}
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
