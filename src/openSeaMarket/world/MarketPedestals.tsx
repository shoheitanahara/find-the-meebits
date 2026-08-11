import { useEffect, useMemo, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { VRMUtils } from '@pixiv/three-vrm'
import { isSoldMeebit, type ListedMeebit } from '../../opensea/types'
import {
  acquireVrmColorExhibitScene,
  releaseVrmColorExhibitScene,
} from '../../world/vrmSculptureCache'
import { OPEN_SEA_MARKET } from '../config'
import { MARKET_PEDESTAL_PLACEMENTS } from '../marketLandmarks'
import { marketNpcPositions, openSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore } from '../store'
import { getSoldRibbonTexture } from './soldRibbonTexture'

const pedestalMaterial = new MeshStandardMaterial({
  color: OPEN_SEA_MARKET.colors.pedestal,
  roughness: 0.88,
  metalness: 0.05,
})

const TAG_WIDTH = 1.85
const TAG_HEIGHT = 0.72
const RIBBON_SIZE = 0.7

let soldRibbonMaterial: MeshBasicMaterial | null = null

function getSoldRibbonMaterial() {
  if (!soldRibbonMaterial) {
    soldRibbonMaterial = new MeshBasicMaterial({
      map: getSoldRibbonTexture(),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  }
  return soldRibbonMaterial
}

function formatPrice(price: number) {
  if (Number.isInteger(price)) return String(price)
  return String(Math.round(price * 1000) / 1000)
}

/** Digital Sculpture 台座群（出品 listing） */
export function MarketPedestals() {
  const listings = useOpenSeaMarketStore((s) => s.sessionPedestalListings)
  const walkerIds = useOpenSeaMarketStore((s) => s.sessionWalkerIds)
  const setNearestTalkTarget = useOpenSeaMarketStore((s) => s.setNearestTalkTarget)
  const slots = useMemo(() => {
    const n = Math.min(listings.length, MARKET_PEDESTAL_PLACEMENTS.length)
    return Array.from({ length: n }, (_, i) => ({
      listing: listings[i]!,
      placement: MARKET_PEDESTAL_PLACEMENTS[i]!,
      index: i,
    }))
  }, [listings])

  const listingIdSet = useMemo(
    () => new Set(slots.map((s) => s.listing.tokenId)),
    [slots],
  )
  const walkerIdSet = useMemo(() => new Set(walkerIds), [walkerIds])

  useFrame(() => {
    if (!openSeaMarketPlayerWorld.ready) {
      setNearestTalkTarget(null)
      return
    }
    const talkRadius = OPEN_SEA_MARKET.talkRadius
    let bestId: number | null = null
    let bestKind: 'listing' | 'guide' | null = null
    let bestDist: number = talkRadius
    for (const slot of slots) {
      const pos = marketNpcPositions.get(slot.listing.tokenId)
      if (!pos) continue
      const d = Math.hypot(pos.x - openSeaMarketPlayerWorld.x, pos.z - openSeaMarketPlayerWorld.z)
      if (d < bestDist) {
        bestDist = d
        bestId = slot.listing.tokenId
        bestKind = 'listing'
      }
    }
    for (const walkerId of walkerIdSet) {
      if (listingIdSet.has(walkerId)) continue
      const pos = marketNpcPositions.get(walkerId)
      if (!pos) continue
      const d = Math.hypot(pos.x - openSeaMarketPlayerWorld.x, pos.z - openSeaMarketPlayerWorld.z)
      if (d < bestDist) {
        bestDist = d
        bestId = walkerId
        bestKind = 'guide'
      }
    }
    const state = useOpenSeaMarketStore.getState()
    if (state.nearestTalkTokenId !== bestId || state.nearestTalkKind !== bestKind) {
      setNearestTalkTarget(bestId, bestKind)
    }
  })

  return (
    <group>
      {slots.map((slot) => (
        <MarketPedestalSlot
          key={slot.listing.tokenId}
          listing={slot.listing}
          x={slot.placement.x}
          z={slot.placement.z}
          rotationY={slot.placement.rotationY}
          index={slot.index}
        />
      ))}
    </group>
  )
}

function MarketPedestalSlot({
  listing,
  x,
  z,
  rotationY,
  index,
}: {
  listing: ListedMeebit
  x: number
  z: number
  rotationY: number
  index: number
}) {
  const { pedestal, sculptureVrmScale, colors } = OPEN_SEA_MARKET

  useEffect(() => {
    marketNpcPositions.set(listing.tokenId, { x, z, rotationY })
    return () => {
      marketNpcPositions.delete(listing.tokenId)
    }
  }, [listing.tokenId, x, z, rotationY])

  const sold = isSoldMeebit(listing)
  const priceLabel =
    listing.priceEth == null ? (sold ? '—' : 'Listed') : `${formatPrice(listing.priceEth)} ETH`

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh
        position={[0, pedestal.sizeY / 2, 0]}
        castShadow
        receiveShadow
        material={pedestalMaterial}
      >
        <boxGeometry args={[pedestal.sizeX, pedestal.sizeY, pedestal.sizeZ]} />
      </mesh>

      <MarketSculptureFigure
        meebitId={listing.tokenId}
        index={index}
        y={pedestal.topY}
        scale={sculptureVrmScale}
      />

      {/* 透明値札: 足元が見える。文字はアウトラインで可読性確保 */}
      <group position={[0, pedestal.sizeY + 0.28, pedestal.sizeZ * 0.48]}>
        <group rotation={[-0.18, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[TAG_WIDTH, TAG_HEIGHT, 0.04]} />
            <meshStandardMaterial
              color="#dbeafe"
              transparent
              opacity={0.14}
              roughness={0.25}
              metalness={0.05}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[0, 0.14, 0.04]}
            fontSize={0.22}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.018}
            outlineColor="#0b1220"
            renderOrder={2}
            depthOffset={-2}
          >
            {`#${listing.tokenId}`}
          </Text>
          <Text
            position={[0, -0.16, 0.04]}
            fontSize={0.14}
            color={colors.priceTag}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.014}
            outlineColor="#0b1220"
            renderOrder={2}
            depthOffset={-2}
          >
            {priceLabel}
          </Text>
          {sold ? (
            <mesh
              position={[
                -(TAG_WIDTH / 2) + RIBBON_SIZE / 2 - 0.01,
                TAG_HEIGHT / 2 - RIBBON_SIZE / 2 + 0.01,
                0.035,
              ]}
              renderOrder={3}
              material={getSoldRibbonMaterial()}
            >
              <planeGeometry args={[RIBBON_SIZE, RIBBON_SIZE]} />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  )
}

function MarketSculptureFigure({
  meebitId,
  index,
  y,
  scale,
}: {
  meebitId: number
  index: number
  y: number
  scale: number
}) {
  const [scene, setScene] = useState<Group | null>(null)
  const setPedestalVrmReady = useOpenSeaMarketStore((s) => s.setPedestalVrmReady)

  useEffect(() => {
    let active: Group | null = null
    let ownsPoolRef = false
    let cancelled = false

    acquireVrmColorExhibitScene(meebitId)
      .then((acquired) => {
        if (cancelled) {
          releaseVrmColorExhibitScene(meebitId, acquired)
          return
        }
        active = acquired
        ownsPoolRef = true
        setScene(acquired)
        setPedestalVrmReady(index)
      })
      .catch(() => {
        if (!cancelled) setPedestalVrmReady(index)
      })

    return () => {
      cancelled = true
      if (!active) return
      if (ownsPoolRef) {
        releaseVrmColorExhibitScene(meebitId, active)
      } else {
        VRMUtils.deepDispose(active)
      }
      setScene(null)
    }
  }, [meebitId, index, setPedestalVrmReady])

  if (!scene) return null
  return (
    <group position={[0, y, 0]}>
      <primitive object={scene} scale={scale} />
    </group>
  )
}
