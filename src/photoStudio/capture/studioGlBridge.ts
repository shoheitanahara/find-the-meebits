import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector2 } from 'three'
import type { Camera, Object3D, Scene, WebGLRenderer } from 'three'
import { PHOTO_STUDIO } from '../config'

/** Canvas 外の撮影ボタンから参照する renderer / scene / camera。 */
type StudioRenderContext = {
  gl: WebGLRenderer
  scene: Scene
  camera: Camera
}

let studioContext: StudioRenderContext | null = null

/** Canvas 内に置き、撮影用の scene / camera を登録する。 */
export function StudioGlBridge() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    studioContext = { gl, scene, camera }
    return () => {
      if (studioContext?.gl === gl) studioContext = null
    }
  }, [gl, scene, camera])

  return null
}

export function hasStudioGl() {
  return studioContext !== null
}

/** カスタムポーズの関節タップ判定用 */
export function getStudioCamera() {
  return studioContext?.camera ?? null
}

const _size = new Vector2()

/** この userData フラグが立った Object3D は撮影画像に写さない（関節マーカーなど） */
export const STUDIO_CAPTURE_HIDDEN = 'studioCaptureHidden'

function hideCaptureExcluded(scene: Scene) {
  const hidden: Object3D[] = []
  scene.traverse((obj) => {
    if (obj.userData[STUDIO_CAPTURE_HIDDEN] && obj.visible) {
      obj.visible = false
      hidden.push(obj)
    }
  })
  return hidden
}

/**
 * 画面表示サイズに関係なく、撮影の瞬間だけ高解像度で描き直した正方形スナップショットを返す。
 * 小さいスマホ画面のプレビュー（~700px）を 1024px に引き伸ばしてぼやけるのを防ぐ。
 *
 * 一時的に pixelRatio を上げて描画 → 中央の正方形をコピー → 元に戻して再描画。
 * 同期処理なので画面がちらつくことはない。
 */
export function renderStudioSnapshot(): HTMLCanvasElement | null {
  if (!studioContext) return null
  const { gl, scene, camera } = studioContext

  gl.getSize(_size)
  const cssSide = Math.min(_size.x, _size.y)
  if (cssSide < 2) return null

  const maxBuffer = Math.min(
    gl.capabilities.maxTextureSize,
    gl.getContext().getParameter(gl.getContext().MAX_RENDERBUFFER_SIZE) as number,
  )
  const longSide = Math.max(_size.x, _size.y)
  const targetSide = PHOTO_STUDIO.captureRenderSize
  // 長辺がバッファ上限を超えないよう倍率を抑える
  const ratio = Math.min(targetSide / cssSide, maxBuffer / longSide)

  const prevRatio = gl.getPixelRatio()
  const output = document.createElement('canvas')
  const hidden = hideCaptureExcluded(scene)

  try {
    gl.setPixelRatio(ratio)
    gl.render(scene, camera)

    const source = gl.domElement
    const side = Math.min(source.width, source.height)
    const sx = Math.floor((source.width - side) / 2)
    const sy = Math.floor((source.height - side) / 2)

    output.width = side
    output.height = side
    const ctx = output.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(source, sx, sy, side, side, 0, 0, side, side)
  } finally {
    for (const obj of hidden) obj.visible = true
    gl.setPixelRatio(prevRatio)
    gl.render(scene, camera)
  }

  return output
}
