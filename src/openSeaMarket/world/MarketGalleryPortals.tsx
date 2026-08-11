import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { closeMarketDialogue } from '../dialogue/interactWithListing'
import { galleryLabel } from '../galleryLabels'
import { OPEN_SEA_MARKET } from '../config'
import { openSeaMarketPlayerWorld } from '../playerWorld'
import {
  useOpenSeaMarketStore,
  type MarketGateEntry,
  type MarketRoomIndex,
} from '../store'

/**
 * 左右壁の空洞ゲート。建物入口と同じく、開口の奥まで踏み込んだらギャラリー切替。
 * 看板は行き先（WEST / MAIN / EAST）。
 */
export function MarketGalleryPortals() {
  const activeRoomIndex = useOpenSeaMarketStore((s) => s.activeRoomIndex)
  const sessionGalleries = useOpenSeaMarketStore((s) => s.sessionGalleries)
  const insideWestRef = useRef(false)
  const insideEastRef = useRef(false)
  const locale = getLocale()

  const leftTarget = (activeRoomIndex - 1) as MarketRoomIndex
  const rightTarget = (activeRoomIndex + 1) as MarketRoomIndex
  const showWest =
    activeRoomIndex > 0 && (sessionGalleries[leftTarget]?.length ?? 0) > 0
  const showEast =
    activeRoomIndex < OPEN_SEA_MARKET.roomCount - 1 &&
    (sessionGalleries[rightTarget]?.length ?? 0) > 0

  useFrame(() => {
    const state = useOpenSeaMarketStore.getState()
    if (
      state.isSwitchingGallery ||
      state.bootPhase !== 'ready' ||
      !openSeaMarketPlayerWorld.ready
    ) {
      return
    }

    const { x, z } = openSeaMarketPlayerWorld
    const { roomHalfX, galleryGate } = OPEN_SEA_MARKET
    const inZ = Math.abs(z - galleryGate.z) <= galleryGate.halfWidth

    const inWest =
      showWest && inZ && x <= -roomHalfX + galleryGate.triggerDepth
    const inEast =
      showEast && inZ && x >= roomHalfX - galleryGate.triggerDepth

    if (inWest) {
      if (!insideWestRef.current) {
        insideWestRef.current = true
        enterRoom(leftTarget, 'fromEast')
      }
    } else {
      insideWestRef.current = false
    }

    if (inEast) {
      if (!insideEastRef.current) {
        insideEastRef.current = true
        enterRoom(rightTarget, 'fromWest')
      }
    } else {
      insideEastRef.current = false
    }
  })

  return (
    <group>
      {showWest ? (
        <GateFrame side="west" label={galleryLabel(leftTarget, locale)} />
      ) : null}
      {showEast ? (
        <GateFrame side="east" label={galleryLabel(rightTarget, locale)} />
      ) : null}
    </group>
  )
}

function enterRoom(roomIndex: MarketRoomIndex, entry: MarketGateEntry) {
  closeMarketDialogue()
  playSfx('uiConfirm')
  useOpenSeaMarketStore.getState().setActiveRoom(roomIndex, entry)
}

function GateFrame({ side, label }: { side: 'west' | 'east'; label: string }) {
  const { roomHalfX, galleryGate, wallHeight, colors } = OPEN_SEA_MARKET
  const x = side === 'west' ? -roomHalfX : roomHalfX
  const opening = galleryGate.halfWidth * 2
  const frameDepth = 0.55
  const lintelY = Math.min(wallHeight - 0.35, 3.35)
  const faceYaw = side === 'west' ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={[x, 0, galleryGate.z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[side === 'west' ? 0.35 : -0.35, 0.03, 0]}
        receiveShadow
      >
        <planeGeometry args={[frameDepth * 1.6, opening * 0.92]} />
        <meshStandardMaterial
          color="#dcecff"
          emissive={colors.accent}
          emissiveIntensity={0.4}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, lintelY, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, opening + 0.5]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh position={[0, 0.12, opening / 2 + 0.12]} castShadow>
        <boxGeometry args={[0.38, 0.24, 0.28]} />
        <meshStandardMaterial color={colors.wallAccent} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, -opening / 2 - 0.12]} castShadow>
        <boxGeometry args={[0.38, 0.24, 0.28]} />
        <meshStandardMaterial color={colors.wallAccent} roughness={0.7} />
      </mesh>

      {/* 行き先看板（部屋内側から読める） */}
      <group
        position={[side === 'west' ? 0.28 : -0.28, lintelY + 0.55, 0]}
        rotation={[0, faceYaw, 0]}
      >
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[1.55, 0.48, 0.06]} />
          <meshStandardMaterial color="#0b1220" roughness={0.7} metalness={0.1} />
        </mesh>
        <Text
          position={[0, 0.06, 0.04]}
          fontSize={0.28}
          color="#e8f4ff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          renderOrder={2}
          depthOffset={-2}
        >
          {label}
        </Text>
      </group>
    </group>
  )
}
