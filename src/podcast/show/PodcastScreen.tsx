import { useEffect } from 'react'
import { Html, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  PODCAST,
  PODCAST_SHOW_CREDIT,
  PODCAST_SHOW_TITLE,
} from '../config'
import { usePodcastStore } from '../store'
import {
  PODCAST_YT_PLAYER_ELEMENT_ID,
  destroyPodcastYoutubePlayer,
  mountPodcastYoutubePlayer,
} from '../youtubePlayer'

/** iframe / YT Player 解像度（16:9） */
const EMBED_W = 960
const EMBED_H = 540

/**
 * drei Html(transform) の換算:
 * ワールド幅 ≈ CSS幅 × (distanceFactor / 400)
 */
const DISTANCE_FACTOR = (PODCAST.screen.width / EMBED_W) * 400

/**
 * 奥壁開口に張り付くスクリーン。
 * occlude="blending" で WebGL（アバター等）を前面、映像を壁面側に置く。
 */
export function PodcastScreen() {
  const playbackStarted = usePodcastStore((state) => state.playbackStarted)
  const episodeTitle = usePodcastStore((state) => state.episodeTitle)
  const { gl } = useThree()
  const { screen, colors } = PODCAST
  const wallTitle = episodeTitle ?? PODCAST_SHOW_TITLE

  useEffect(() => {
    if (!playbackStarted) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      void mountPodcastYoutubePlayer({ width: EMBED_W, height: EMBED_H }).then((player) => {
        if (cancelled && player) {
          destroyPodcastYoutubePlayer()
        }
      })
    }, 80)

    // blending は canvas を pointer-events:none にするので、視点操作用に戻す
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      destroyPodcastYoutubePlayer()
    }
  }, [playbackStarted, gl])

  return (
    <group position={[screen.x, screen.y, screen.z]}>
      <Text
        position={[0, screen.height / 2 + 0.48, 0.06]}
        fontSize={0.16}
        color="#d0b090"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {PODCAST_SHOW_CREDIT}
      </Text>
      <Text
        position={[0, screen.height / 2 + 0.22, 0.06]}
        fontSize={episodeTitle ? 0.2 : 0.22}
        color={colors.accentWarm}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        maxWidth={screen.width * 0.92}
        textAlign="center"
      >
        {wallTitle}
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
            id={PODCAST_YT_PLAYER_ELEMENT_ID}
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
