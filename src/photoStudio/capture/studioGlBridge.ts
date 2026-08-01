import type { WebGLRenderer } from 'three'

/** Canvas 外の撮影ボタンから参照する renderer。 */
let studioGl: WebGLRenderer | null = null

export function setStudioGl(gl: WebGLRenderer | null) {
  studioGl = gl
}

export function getStudioGl() {
  return studioGl
}
