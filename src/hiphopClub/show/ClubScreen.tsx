import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CLUB } from '../config'
import { useClubStore } from '../store'
import {
  CLUB_YT_PLAYER_ELEMENT_ID,
  destroyClubYoutubePlayer,
  mountClubYoutubePlayer,
} from '../youtubePlayer'

const EMBED_W = 960
const EMBED_H = 540
const DISTANCE_FACTOR = (CLUB.screen.width / EMBED_W) * 400

/** Podcast 同型: 正面壁に YouTube を張り付けて再生（壁面タイトル文字なし） */
export function ClubScreen() {
  const playbackStarted = useClubStore((state) => state.playbackStarted)
  const { gl } = useThree()
  const { screen } = CLUB

  useEffect(() => {
    if (!playbackStarted) return

    let cancelled = false
    void mountClubYoutubePlayer({ width: EMBED_W, height: EMBED_H }).then((player) => {
      if (cancelled && player) destroyClubYoutubePlayer()
    })

    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'

    return () => {
      cancelled = true
      destroyClubYoutubePlayer()
    }
  }, [playbackStarted, gl])

  return (
    <group position={[screen.x, screen.y, screen.z]}>
      {playbackStarted ? (
        <Html
          transform
          occlude="blending"
          center
          distanceFactor={DISTANCE_FACTOR}
          position={[0, 0, 0]}
          zIndexRange={[24, 0]}
          style={{
            width: EMBED_W,
            height: EMBED_H,
            pointerEvents: 'none',
          }}
        >
          <div
            id={CLUB_YT_PLAYER_ELEMENT_ID}
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
