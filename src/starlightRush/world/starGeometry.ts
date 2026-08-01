import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import { STARLIGHT_RUSH } from '../config'

/** 5尖の星形 Shape（押し出し用）。 */
export function createStarShape(outerR: number, innerR: number, points = 5) {
  const shape = new Shape()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

/** プール全体で共有する星ジオメトリ（軽量）。 */
export function useSharedStarGeometry() {
  return useMemo(() => {
    const shape = createStarShape(
      STARLIGHT_RUSH.starHitRadius,
      STARLIGHT_RUSH.starHitRadius * 0.42,
      5,
    )
    const geo = new ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 2,
      curveSegments: 1,
    })
    geo.center()
    return geo
  }, [])
}
