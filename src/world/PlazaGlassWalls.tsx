import { useMemo } from 'react'
import {
  getPlazaGlassCornerPosts,
  getPlazaGlassWallSegments,
  type PlazaGlassWallSegment,
} from './plazaGlassWallConfig'

const GLASS = '#b8e0f0'
const FRAME = '#e8eef2'
const FRAME_EDGE = '#94a3b8'

/**
 * プラザ外周のガラス壁。
 * 各辺に出入り口を複数空けて、浜〜館内を行き来しやすくする。
 */
export function PlazaGlassWalls() {
  const panels = useMemo(() => getPlazaGlassWallSegments(), [])
  const posts = useMemo(() => getPlazaGlassCornerPosts(), [])

  return (
    <group>
      {panels.map((segment) => (
        <GlassPanel key={`glass-${segment.position.join(',')}`} segment={segment} />
      ))}
      {posts.map((segment) => (
        <CornerPost key={`post-${segment.position.join(',')}`} segment={segment} />
      ))}
    </group>
  )
}

function GlassPanel({ segment }: { segment: PlazaGlassWallSegment }) {
  const [w, h, d] = segment.size
  const isNorthSouth = w >= d
  const railThickness = 0.08
  const railDepth = Math.max(w, d) > 0.5 ? Math.min(w, d) + 0.06 : Math.max(w, d)

  return (
    <group position={segment.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={GLASS}
          transparent
          opacity={0.32}
          roughness={0.18}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* 上下のフレーム */}
      <mesh position={[0, h / 2 - railThickness / 2, 0]} castShadow>
        <boxGeometry
          args={
            isNorthSouth
              ? [w + 0.04, railThickness, railDepth]
              : [railDepth, railThickness, d + 0.04]
          }
        />
        <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, -h / 2 + railThickness / 2, 0]} castShadow>
        <boxGeometry
          args={
            isNorthSouth
              ? [w + 0.04, railThickness, railDepth]
              : [railDepth, railThickness, d + 0.04]
          }
        />
        <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
      </mesh>

      {/* 左右の縦枠 */}
      {isNorthSouth ? (
        <>
          <mesh position={[-w / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.07, h, d + 0.05]} />
            <meshStandardMaterial color={FRAME_EDGE} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[w / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.07, h, d + 0.05]} />
            <meshStandardMaterial color={FRAME_EDGE} roughness={0.5} metalness={0.3} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0, -d / 2]} castShadow>
            <boxGeometry args={[w + 0.05, h, 0.07]} />
            <meshStandardMaterial color={FRAME_EDGE} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, d / 2]} castShadow>
            <boxGeometry args={[w + 0.05, h, 0.07]} />
            <meshStandardMaterial color={FRAME_EDGE} roughness={0.5} metalness={0.3} />
          </mesh>
        </>
      )}
    </group>
  )
}

function CornerPost({ segment }: { segment: PlazaGlassWallSegment }) {
  const [w, h, d] = segment.size
  return (
    <mesh position={segment.position} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={FRAME_EDGE} roughness={0.48} metalness={0.28} />
    </mesh>
  )
}
