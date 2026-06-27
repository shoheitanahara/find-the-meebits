import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
} from 'three'
import { isMobilePerfMode } from '../game/perfConfig'

/** ダンスフロア中心（clubLandmarks の dance-floor spotlight と一致） */
const DANCE_FLOOR_Z = 2
const BALL_RADIUS = 0.54
const BALL_Y = 7.55
const MOUNT_TOP_Y = 11.35

const BEAM_COLORS = ['#f9a8d4', '#93c5fd', '#fde68a', '#c4b5fd', '#6ee7b7', '#f0abfc'] as const
const GLINT_COLORS = ['#ffffff', '#fbcfe8', '#bae6fd', '#fef08a', '#e9d5ff'] as const

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

function discoHash(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}
const _position = new Vector3()
const _normal = new Vector3()
const _quaternion = new Quaternion()
const _scale = new Vector3(1, 1, 1)
const _matrix = new Matrix4()
const _up = new Vector3(0, 1, 0)
const _target = new Vector3()

function fibonacciSphere(count: number, radius: number) {
  const points: Vector3[] = []

  for (let index = 0; index < count; index += 1) {
    const t = (index + 0.5) / count
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = (2 * Math.PI * index) / GOLDEN_RATIO

    points.push(
      new Vector3(
        radius * Math.sin(inclination) * Math.cos(azimuth),
        radius * Math.cos(inclination),
        radius * Math.sin(inclination) * Math.sin(azimuth),
      ),
    )
  }

  return points
}

function MirrorBallAssembly({ ballY }: { ballY: number }) {
  const ballRef = useRef<Object3D>(null)
  const glintRefs = useRef<(Mesh | null)[]>([])
  const mobile = isMobilePerfMode()
  const tileCount = mobile ? 48 : 96
  const tileRadius = mobile ? 0.052 : 0.058

  const tilePoints = useMemo(() => fibonacciSphere(tileCount, BALL_RADIUS * 1.002), [tileCount])
  const glintOffsets = useMemo(
    () =>
      fibonacciSphere(mobile ? 6 : 10, BALL_RADIUS * 1.04).map((point, index) => ({
        point,
        color: GLINT_COLORS[index % GLINT_COLORS.length],
        phase: index * 1.37,
      })),
    [mobile],
  )

  const tilesRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = tilesRef.current
    if (!mesh) {
      return
    }

    tilePoints.forEach((point, index) => {
      _normal.copy(point).normalize()
      _quaternion.setFromUnitVectors(_up, _normal)
      _position.copy(point)
      const jitter = 0.86 + (index % 5) * 0.035
      _scale.set(tileRadius * jitter, tileRadius * jitter, 1)
      _matrix.compose(_position, _quaternion, _scale)
      mesh.setMatrixAt(index, _matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [tilePoints])

  useLayoutEffect(() => {
    glintOffsets.forEach((glint, index) => {
      const node = glintRefs.current[index]
      if (!node) {
        return
      }

      node.position.copy(glint.point)
      _target.copy(glint.point).multiplyScalar(2)
      node.lookAt(_target)
    })
  }, [glintOffsets])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime

    if (ballRef.current) {
      ballRef.current.rotation.y = elapsed * (0.42 + Math.sin(elapsed * 0.13) * 0.05)
      ballRef.current.rotation.x = Math.sin(elapsed * 0.17) * 0.04 + Math.cos(elapsed * 0.29) * 0.018
    }

    for (let index = 0; index < glintRefs.current.length; index += 1) {
      const glint = glintRefs.current[index]
      const spec = glintOffsets[index]
      if (!glint || !spec) {
        continue
      }

      const pulse = 0.45 + Math.sin(elapsed * 4.8 + spec.phase) * 0.35
      const material = glint.material
      if (material && 'emissiveIntensity' in material) {
        material.emissiveIntensity = 0.25 + pulse * 0.85
      }
      if (material && 'opacity' in material && typeof material.opacity === 'number') {
        material.opacity = 0.38 + pulse * 0.32
      }
    }
  })

  return (
    <group position={[0, ballY, 0]}>
      <mesh position={[0, MOUNT_TOP_Y - ballY, 0]}>
        <cylinderGeometry args={[0.05, 0.07, MOUNT_TOP_Y - ballY - 0.35, 12]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.82} roughness={0.34} />
      </mesh>

      <mesh position={[0, (MOUNT_TOP_Y - ballY) * 0.5, 0]}>
        <torusGeometry args={[0.18, 0.028, 10, 24]} />
        <meshStandardMaterial color="#52525b" metalness={0.9} roughness={0.25} />
      </mesh>

      <group ref={ballRef}>
        <mesh>
          <sphereGeometry args={[BALL_RADIUS * 1.06, 32, 32]} />
          <meshStandardMaterial
            color="#c4b5fd"
            emissive="#a78bfa"
            emissiveIntensity={0.08}
            transparent
            opacity={0.09}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[BALL_RADIUS * 0.94, 28, 28]} />
          <meshStandardMaterial color="#111118" metalness={0.35} roughness={0.88} />
        </mesh>

        <instancedMesh ref={tilesRef} args={[undefined, undefined, tileCount]} castShadow>
          <circleGeometry args={[1, 20]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            emissive="#f8fafc"
            emissiveIntensity={0.1}
            metalness={1}
            roughness={0.14}
            side={DoubleSide}
          />
        </instancedMesh>

        {glintOffsets.map((glint, index) => (
          <mesh
            key={`glint-${index}`}
            ref={(node) => {
              glintRefs.current[index] = node
            }}
          >
            <circleGeometry args={[0.1, 24]} />
            <meshStandardMaterial
              color={glint.color}
              emissive={glint.color}
              emissiveIntensity={0.65}
              transparent
              opacity={0.58}
              depthWrite={false}
              blending={AdditiveBlending}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function SoftDiscoBeam({
  angle,
  length,
  color,
  opacity,
  seed = 0,
}: {
  angle: number
  length: number
  color: string
  opacity: number
  seed?: number
}) {
  const steps = 11

  return (
    <group rotation={[0, angle, 0]}>
      {Array.from({ length: steps }, (_, index) => {
        const t = (index + 1) / steps
        const radiusJitter = 0.9 + discoHash(seed + index * 4.7) * 0.2
        const radius = (0.65 + t * 3.1) * radiusJitter
        const zJitter = (discoHash(seed + index * 9.1) - 0.5) * 0.55
        const z = length * Math.pow(t, 1.55 + discoHash(seed + index * 2.3) * 0.35) * 0.9 + zJitter
        const stepOpacity = opacity * (0.16 + (1 - t) * 0.58) * (0.88 + discoHash(seed + index * 6.2) * 0.22)

        return (
          <group key={`pool-${index}`} position={[0, 0.013, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[radius, 36]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.72}
                transparent
                opacity={stepOpacity}
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[radius * 0.48, 28]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.82}
                transparent
                opacity={stepOpacity * 0.3}
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function DiscoFloorProjections() {
  const primaryRef = useRef<Object3D>(null)
  const secondaryRef = useRef<Object3D>(null)
  const spotsRef = useRef<Object3D>(null)
  const mobile = isMobilePerfMode()

  const beams = useMemo(() => {
    const count = mobile ? 4 : 6
    return Array.from({ length: count }, (_, index) => {
      const lengthJitter = discoHash(index * 41.9 + 8.4)
      const colorPick = Math.floor(discoHash(index * 73.2 + 1.2) * BEAM_COLORS.length)

      return {
        angle: (index / count) * Math.PI * 2,
        length: 18 + lengthJitter * 12,
        color: BEAM_COLORS[colorPick % BEAM_COLORS.length],
        opacity: (mobile ? 0.12 : 0.16) + discoHash(index * 29.5) * 0.06,
        seed: index * 13.7 + 4.2,
      }
    })
  }, [mobile])

  const spots = useMemo(() => {
    const count = mobile ? 10 : 16
    return Array.from({ length: count }, (_, index) => {
      const angle = (index * Math.PI * 2) / GOLDEN_RATIO + (discoHash(index * 23.7) - 0.5) * 1.35
      const radius = 4.2 + discoHash(index * 59.1) * 14.8
      const size = 0.58 + discoHash(index * 91.3) * 1.05

      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        size,
        color: BEAM_COLORS[Math.floor(discoHash(index * 13.1 + 3.4) * BEAM_COLORS.length)],
        phase: index * 0.91 + discoHash(index * 37.6) * 4.8,
      }
    })
  }, [mobile])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime

    if (primaryRef.current) {
      primaryRef.current.rotation.y = elapsed * 0.11 + Math.sin(elapsed * 0.23) * 0.045
    }

    if (secondaryRef.current) {
      secondaryRef.current.rotation.y = -elapsed * 0.067 + Math.cos(elapsed * 0.19) * 0.035
    }

    if (spotsRef.current) {
      spotsRef.current.rotation.y = elapsed * 0.085 + Math.sin(elapsed * 0.31) * 0.05
      spotsRef.current.children.forEach((group, index) => {
        const spot = spots[index]
        if (!spot) {
          return
        }

        group.children.forEach((child, childIndex) => {
          if (!(child instanceof Mesh)) {
            return
          }

          const material = child.material
          if (material && 'opacity' in material && typeof material.opacity === 'number') {
            const pulse = 0.14 + (0.5 + Math.sin(elapsed * 3.2 + spot.phase)) * 0.5 * 0.2
            material.opacity = childIndex === 0 ? pulse : pulse * 0.7
          }
        })
      })
    }
  })

  return (
    <group>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[13.5, 64]} />
        <meshStandardMaterial
          color="#1e1033"
          emissive="#a855f7"
          emissiveIntensity={0.05}
          transparent
          opacity={0.28}
          roughness={0.95}
        />
      </mesh>

      <group ref={primaryRef}>
        {beams.map((beam, index) => (
          <SoftDiscoBeam key={`beam-a-${index}`} {...beam} />
        ))}
      </group>

      {!mobile ? (
        <group ref={secondaryRef}>
          {beams.map((beam, index) => (
            <SoftDiscoBeam
              key={`beam-b-${index}`}
              angle={beam.angle + Math.PI / beams.length}
              color={beam.color}
              length={beam.length * (0.78 + discoHash(index * 67.4) * 0.18)}
              opacity={beam.opacity * (0.72 + discoHash(index * 44.2) * 0.16)}
              seed={beam.seed + 19.3}
            />
          ))}
        </group>
      ) : null}

      <group ref={spotsRef}>
        {spots.map((spot, index) => (
          <group key={`spot-${index}`} position={[spot.x, 0.016, spot.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[spot.size, 32]} />
              <meshStandardMaterial
                color={spot.color}
                emissive={spot.color}
                emissiveIntensity={0.9}
                transparent
                opacity={0.2}
                depthWrite={false}
                blending={AdditiveBlending}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[spot.size * 0.45, 24]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={spot.color}
                emissiveIntensity={1}
                transparent
                opacity={0.14}
                depthWrite={false}
                blending={AdditiveBlending}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function ClubMirrorBall() {
  return (
    <group position={[0, 0, DANCE_FLOOR_Z]}>
      <MirrorBallAssembly ballY={BALL_Y} />
      <DiscoFloorProjections />
    </group>
  )
}
