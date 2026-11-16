import { Text, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { Attraction } from './topConfig'
import { VisitPassPromoBoard } from './VisitPassPromoBoard'
import { VoxelBlockMat } from './VoxelBlockMat'
import type { BlockKind } from '../mountain/config'
import { getNeonBlockMaterial } from '../mountain/neonBlockMaterials'
import { buildEighthStreetModel, EIGHTH_STREET_ICON } from './landmarks/eighthStreetModel'
import { buildHipHopClubModel, HIP_HOP_ICON } from './landmarks/hipHopClubModel'
import { buildJazzBarModel, JAZZ_BAR_ICON } from './landmarks/jazzBarModel'
import { buildPodcastStudioModel } from './landmarks/podcastStudioModel'
import {
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
  type LandmarkIconPlacement,
} from './landmarks/landmarkParts'
import { buildLearnArtModel, LEARN_ART_ICON } from './landmarks/learnArtModel'
import type { VoxelModel } from './voxel/voxelBuilder'
import { VoxelModelMesh } from './voxel/VoxelModelMesh'

/**
 * Park アトラクションのランドマーク入口。
 * - find: ドーム付き美術館
 * - traits: ネオン円筒タワー
 * - street: L字レンガ町屋＋アーチ
 * - mountain: ボクセル山エントランス（Mt. Meeb）
 * - neon: テトリス風積みブロック塔（Jerry Mountain）
 * - runway: 暗いパビリオン＋発光ランウェイ
 * - closet: カルチャー調のルックロッカー（きせかえ試着室）
 * - sergito: シーエリアの工房（Meet Sergito）
 * - fishing: シーエリア西のショアフィッシング
 * - opensea: シーエリア中央の OpenSea Market
 * - shooting: マウンテンエリアの木造射的場
 * - starlight: アストロ中央のスターライトラッシュ
 * - cinema: アストロ西のドキュメンタリー映画館
 * - learnArt: Music & Art 中央の現代アート上映
 * - jazzBar: Music & Art 東のジャズバー
 * - podcast: プラザ西のポッドキャストスタジオ
 * - pfp: カルチャー東のフォトブース
 */
export function AttractionBuilding({
  attraction,
  locale,
}: {
  attraction: Attraction
  locale: 'en' | 'ja'
}) {
  const accent =
    attraction.id === 'find'
      ? '#d4b46a'
      : attraction.id === 'traits'
        ? '#5ee0ff'
        : attraction.id === 'street'
          ? '#c9a46a'
          : attraction.id === 'neon'
            ? '#ff2bd6'
            : attraction.id === 'runway'
              ? '#f0f0f0'
              : attraction.id === 'closet'
                ? '#8eb4e8'
                : attraction.id === 'sergito'
                  ? '#d4a060'
                  : attraction.id === 'fishing'
                    ? '#7ec8e8'
                    : attraction.id === 'opensea'
                      ? '#2081e2'
                      : attraction.id === 'shooting'
                        ? '#e8b060'
                        : attraction.id === 'starlight'
                          ? '#5ce0ff'
                          : attraction.id === 'cinema'
                            ? '#5ce0ff'
                          : attraction.id === 'podcast'
                            ? '#ff9a3c'
                          : attraction.id === 'hiphop'
                            ? '#e85cff'
                          : attraction.id === 'learnArt'
                            ? '#e85cff'
                          : attraction.id === 'jazzBar'
                            ? '#4a8cff'
                          : attraction.id === 'pfp'
                            ? '#8eb4e8'
                            : '#c4a060'
  const frontZ = attraction.footprint.halfDepth

  return (
    <group position={[attraction.x, 0, attraction.z]}>
      {attraction.id === 'find' ? (
        <MuseumLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'traits' ? (
        <TraitTowerLandmark
          color={attraction.color}
          roofColor={attraction.roofColor}
          accent={accent}
        />
      ) : attraction.id === 'street' ? (
        <VoxelLandmark
          build={buildEighthStreetModel}
          footprint={attraction.footprint}
          icon={EIGHTH_STREET_ICON}
          iconLightColor="#ffd2a8"
        />
      ) : attraction.id === 'neon' ? (
        <JerryMountainLandmark accent={accent} />
      ) : attraction.id === 'runway' ? (
        <RunwayLandmark color={attraction.color} accent={accent} />
      ) : attraction.id === 'closet' ? (
        <TraitMuseumLandmark color={attraction.color} accent={accent} />
      ) : attraction.id === 'sergito' ? (
        <MeetSergitoLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'fishing' ? (
        <ShoreFishingLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'opensea' ? (
        <OpenSeaMarketLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'shooting' ? (
        <ShootingGalleryLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'starlight' ? (
        <StarlightDomeLandmark color={attraction.color} accent={accent} />
      ) : attraction.id === 'cinema' ? (
        <CinemaLandmark color={attraction.color} accent={accent} />
      ) : attraction.id === 'podcast' ? (
        <VoxelLandmark build={buildPodcastStudioModel} footprint={attraction.footprint} />
      ) : attraction.id === 'hiphop' ? (
        <VoxelLandmark
          build={buildHipHopClubModel}
          footprint={attraction.footprint}
          icon={HIP_HOP_ICON}
          iconLightColor="#ffd0f4"
        />
      ) : attraction.id === 'learnArt' ? (
        <VoxelLandmark
          build={buildLearnArtModel}
          footprint={attraction.footprint}
          icon={LEARN_ART_ICON}
          iconLightColor="#fff2e0"
        />
      ) : attraction.id === 'jazzBar' ? (
        <VoxelLandmark
          build={buildJazzBarModel}
          footprint={attraction.footprint}
          icon={JAZZ_BAR_ICON}
          iconLightColor="#ffd9a0"
        />
      ) : attraction.id === 'pfp' ? (
        <PfpStudioLandmark color={attraction.color} accent={accent} />
      ) : (
        <MountainLandmark color={attraction.color} snowColor={attraction.roofColor} accent={accent} />
      )}

      <EntrancePortal
        accent={accent}
        frontZ={frontZ}
        doorHalfWidth={attraction.footprint.doorHalfWidth}
      />
      <TitleBanner
        attraction={attraction}
        accent={accent}
        locale={locale}
        y={LANDMARK_LAYOUT.bannerY}
        z={frontZ + LANDMARK_LAYOUT.bannerZOffset}
      />
      <pointLight position={[0, 2.4, frontZ + 1.4]} intensity={12} distance={12} color={accent} />
      {attraction.id === 'pfp' && !attraction.underConstruction ? (
        <VisitPassPromoBoard
          position={[attraction.infoBoardLocal[0], 0, attraction.infoBoardLocal[1]]}
          accentColor={accent}
          locale={locale}
        />
      ) : (
        <AttractionInfoBoard
          position={[attraction.infoBoardLocal[0], 0, attraction.infoBoardLocal[1]]}
          accentColor={accent}
          description={attraction.description[locale]}
          heading={attraction.storyTitle[locale]}
          locale={locale}
          underConstruction={attraction.underConstruction}
        />
      )}
    </group>
  )
}

/** ボクセル風の山エントランス（基壇＋積みブロック＋雪頂） */
function MountainLandmark({
  color: _color,
  snowColor: _snowColor,
  accent,
}: {
  color: string
  snowColor: string
  accent: string
}) {
  const tiers: Array<{
    y: number
    w: number
    d: number
    h: number
    kind: 'dirt' | 'grass' | 'stone' | 'snow'
  }> = [
    { y: 0.45, w: 7.2, d: 7.4, h: 0.9, kind: 'dirt' },
    { y: 1.35, w: 6.2, d: 6.4, h: 1.0, kind: 'grass' },
    { y: 2.4, w: 5.0, d: 5.1, h: 1.1, kind: 'grass' },
    { y: 3.45, w: 3.8, d: 3.9, h: 1.0, kind: 'stone' },
    { y: 4.4, w: 2.6, d: 2.7, h: 0.95, kind: 'stone' },
    { y: 5.25, w: 1.7, d: 1.8, h: 0.8, kind: 'snow' },
  ]

  return (
    <group>
      {tiers.map((tier, index) => (
        <mesh key={index} position={[0, tier.y, -0.35]} castShadow receiveShadow>
          <boxGeometry args={[tier.w, tier.h, tier.d]} />
          <VoxelBlockMat kind={tier.kind} face={tier.kind === 'grass' ? 'top' : 'all'} />
        </mesh>
      ))}
      {/* 脇の岩塊 */}
      <mesh position={[-2.8, 1.5, -1.4]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.8, 3.2]} />
        <VoxelBlockMat kind="stone" />
      </mesh>
      <mesh position={[2.6, 1.3, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 2.4, 2.8]} />
        <VoxelBlockMat kind="dirt" />
      </mesh>
      {/* 山頂旗 */}
      <mesh position={[0, 5.85, -0.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 1.4, 8]} />
        <meshStandardMaterial color="#d8c8a0" />
      </mesh>
      <mesh position={[0.45, 6.35, -0.2]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

/** テトリス風ネオン積み塔 — コースと同じゼリーブロック質感 */
function JerryMountainLandmark({ accent }: { accent: string }) {
  const blocks: Array<{
    x: number
    y: number
    z: number
    w: number
    h: number
    d: number
    kind: BlockKind | null
  }> = [
    { x: 0, y: 0.35, z: -0.2, w: 6.4, h: 0.7, d: 6.2, kind: null },
    { x: -1.4, y: 1.15, z: -0.4, w: 2.4, h: 0.9, d: 2.4, kind: 'grass' },
    { x: 1.0, y: 1.15, z: -0.3, w: 2.8, h: 0.9, d: 2.2, kind: 'stone' },
    { x: -0.2, y: 2.1, z: -0.5, w: 3.6, h: 0.95, d: 2.6, kind: 'dirt' },
    { x: -1.6, y: 3.05, z: -0.6, w: 1.8, h: 0.9, d: 1.8, kind: 'gravel' },
    { x: 0.6, y: 3.05, z: -0.55, w: 2.6, h: 0.9, d: 1.9, kind: 'darkStone' },
    { x: -0.3, y: 4.0, z: -0.7, w: 2.2, h: 0.95, d: 2.0, kind: 'sand' },
    { x: 0.1, y: 4.95, z: -0.75, w: 1.5, h: 0.85, d: 1.5, kind: 'path' },
  ]

  return (
    <group>
      {blocks.map((b, index) => (
        <mesh
          key={index}
          position={[b.x, b.y, b.z]}
          castShadow
          receiveShadow
          material={
            b.kind
              ? getNeonBlockMaterial(b.kind, 'top')
              : undefined
          }
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
          {!b.kind ? (
            <meshStandardMaterial
              color="#12081c"
              emissive="#1a0830"
              emissiveIntensity={0.12}
              roughness={0.7}
            />
          ) : null}
        </mesh>
      ))}
      <mesh
        position={[-2.7, 1.6, -1.3]}
        castShadow
        material={getNeonBlockMaterial('stone', 'shaft')}
      >
        <boxGeometry args={[1.6, 2.4, 1.6]} />
      </mesh>
      <mesh
        position={[2.6, 1.4, -1.1]}
        castShadow
        material={getNeonBlockMaterial('darkStone', 'shaft')}
      >
        <boxGeometry args={[1.5, 2.0, 1.5]} />
      </mesh>
      <mesh position={[0, 5.7, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.1, 8]} />
        <meshStandardMaterial color="#9aa0b8" />
      </mesh>
      <mesh position={[0.4, 6.1, -0.6]} castShadow>
        <boxGeometry args={[0.8, 0.45, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, 3.2, 1.2]} intensity={7} distance={10} color="#a04090" />
      <pointLight position={[-1.5, 2.4, 0.8]} intensity={4.5} distance={8} color="#3a8068" />
    </group>
  )
}

/** 美術館: 広い基壇・両翼・中央ドーム */
function MuseumLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      {/* 階段 */}
      {[0, 1, 2].map((step) => (
        <mesh
          key={step}
          position={[0, 0.1 + step * 0.14, 3.55 - step * 0.35]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[6.2 - step * 0.4, 0.16, 0.7]} />
          <meshStandardMaterial color="#9a9288" roughness={0.9} />
        </mesh>
      ))}

      {/* 中央本館 */}
      <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 5.2, 6.2]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>

      {/* 両翼（中央本館 半幅 3.2 に内側を密着） */}
      {[-4.5, 4.5].map((x) => (
        <mesh key={`wing-${x}`} position={[x, 1.7, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 3.4, 4.2]} />
          <meshStandardMaterial color="#c4bdb2" roughness={0.88} />
        </mesh>
      ))}

      {/* コーニス */}
      <mesh position={[0, 5.3, 0]} castShadow>
        <boxGeometry args={[6.8, 0.28, 6.5]} />
        <meshStandardMaterial color="#e4ddd2" roughness={0.78} />
      </mesh>

      {/* ドーム */}
      <mesh position={[0, 6.55, -0.2]} castShadow>
        <sphereGeometry args={[2.15, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={roofColor} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 7.85, -0.2]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 12]} />
        <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 8.35, -0.2]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* 列柱 */}
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <group key={`col-${x}`} position={[x, 0, 3.15]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.48, 0.25, 0.48]} />
            <meshStandardMaterial color="#cfc6b8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 4.0, 14]} />
            <meshStandardMaterial color="#ebe4d8" roughness={0.75} />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <boxGeometry args={[0.46, 0.22, 0.46]} />
            <meshStandardMaterial color="#cfc6b8" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ペディメント帯 */}
      <mesh position={[0, 5.55, 3.15]} castShadow>
        <boxGeometry args={[5.8, 0.55, 0.35]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.55, 3.35]}>
        <boxGeometry args={[5.2, 0.08, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/** Meebits Runway: 暗いパビリオン＋発光の白ランウェイ */
function RunwayLandmark({ color, accent }: { color: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.24, 7.4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.18, 0.4]} receiveShadow>
        <boxGeometry args={[1.35, 0.08, 5.8]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.85}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[-0.72, 0.2, 0.4]}>
        <boxGeometry args={[0.06, 0.04, 5.8]} />
        <meshStandardMaterial color="#111" emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.72, 0.2, 0.4]}>
        <boxGeometry args={[0.06, 0.04, 5.8]} />
        <meshStandardMaterial color="#111" emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[-3.1, 1.7, -0.4]} castShadow>
        <boxGeometry args={[0.55, 3.4, 6.2]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[3.1, 1.7, -0.4]} castShadow>
        <boxGeometry args={[0.55, 3.4, 6.2]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[0, 3.55, -0.6]} castShadow>
        <boxGeometry args={[6.8, 0.35, 6.6]} />
        <meshStandardMaterial color="#111" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.4, -3.35]} castShadow>
        <boxGeometry args={[6.2, 4.6, 0.4]} />
        <meshStandardMaterial color="#050505" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.55, -3.12]}>
        <boxGeometry args={[4.2, 2.4, 0.08]} />
        <meshStandardMaterial color="#f8f8f8" emissive="#ffffff" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.95, 3.35]} castShadow>
        <boxGeometry args={[2.8, 1.9, 0.28]} />
        <meshStandardMaterial color="#101010" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Sea 右上: Meet Sergito 工房（小さなコテージ＋作業窓） */
function MeetSergitoLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.28, 7.2]} />
        <meshStandardMaterial color="#8a7060" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 3.5, 5.8]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[0, 3.75, -0.35]} castShadow>
        <boxGeometry args={[6.4, 0.35, 6.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, 2.2, -3.05]} castShadow>
        <boxGeometry args={[5.2, 3.0, 0.35]} />
        <meshStandardMaterial color="#a89078" roughness={0.92} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 2.35, -2.88]}>
          <boxGeometry args={[1.0, 1.2, 0.08]} />
          <meshStandardMaterial
            color="#fff4d8"
            emissive={accent}
            emissiveIntensity={0.35}
            roughness={0.45}
          />
        </mesh>
      ))}
      <mesh position={[2.4, 1.6, 2.6]} castShadow>
        <boxGeometry args={[1.4, 0.9, 1.0]} />
        <meshStandardMaterial color="#9a8068" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.9, 3.35]} castShadow>
        <boxGeometry args={[2.6, 1.8, 0.28]} />
        <meshStandardMaterial color="#806850" roughness={0.88} />
      </mesh>
      <pointLight position={[0, 2.6, 1.2]} intensity={9} distance={10} color={accent} />
    </group>
  )
}

/** Sea 中央: OpenSea Market（青系・帆船ロゴ） */
function OpenSeaMarketLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.24, 6.8]} />
        <meshStandardMaterial color="#2a4058" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.65, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 3.1, 5.2]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0, 3.35, -0.15]} castShadow>
        <boxGeometry args={[6.2, 0.28, 5.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.4} metalness={0.22} />
      </mesh>
      {/* 円形ロゴ板 + OpenSea ブランド画像（入口タイトルは TitleBanner に任せる） */}
      <mesh position={[0, 1.55, 2.52]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.1, 24]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <OpenSeaLogoBillboard />
      <pointLight position={[0, 2.8, 2.2]} intensity={10} distance={12} color={accent} />
      <pointLight position={[-2.2, 2.4, 1.2]} intensity={4} distance={8} color="#9ad0ff" />
    </group>
  )
}

function OpenSeaLogoBillboard() {
  const map = useTexture('/brand-opensea.png')
  return (
    <mesh position={[0, 1.55, 2.585]}>
      <planeGeometry args={[1.28, 0.45]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} />
    </mesh>
  )
}

/** Sea 西棟: 波打ち際の釣り小屋 */
function ShoreFishingLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[6.8, 0.24, 6.6]} />
        <meshStandardMaterial color="#a89068" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.55, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 2.9, 5.0]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      {/* 片流れ屋根 */}
      <mesh position={[0, 3.2, -0.15]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[5.9, 0.22, 5.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} metalness={0.12} />
      </mesh>
      {/* 竿立て（入口中央を空けて左右へ） */}
      {([-2.35, -1.75] as const).map((x) => (
        <mesh key={x} position={[x, 1.7, 2.15]} rotation={[0.35, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 2.4, 6]} />
          <meshStandardMaterial color="#5a4030" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[2.15, 1.1, 2.1]} castShadow>
        <boxGeometry args={[1.5, 0.7, 1.1]} />
        <meshStandardMaterial color="#8a7058" roughness={0.85} />
      </mesh>
      {/* 浮きバケツ */}
      <mesh position={[-2.45, 0.55, 2.35]} castShadow>
        <cylinderGeometry args={[0.35, 0.3, 0.55, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} roughness={0.55} />
      </mesh>
      <pointLight position={[0, 2.5, 1.4]} intensity={8} distance={10} color={accent} />
    </group>
  )
}

/**
 * 電球が一列に流れるチェイスライト。
 * 材質は各電球で1つずつ・ジオメトリは共有して軽さを保つ。
 */
function ChaseLights({
  xs,
  y,
  z,
  color,
}: {
  xs: number[]
  y: number
  z: number
  color: string
}) {
  const refs = useRef<Array<Mesh | null>>([])

  useFrame((state) => {
    const step = Math.floor(state.clock.elapsedTime * 7)
    refs.current.forEach((mesh, i) => {
      const mat = mesh?.material as { emissiveIntensity?: number } | undefined
      if (!mat) return
      // 3つおきに明るい「流れ」を作る
      mat.emissiveIntensity = (step + i) % 3 === 0 ? 1.9 : 0.35
    })
  })

  return (
    <>
      {xs.map((x, i) => (
        <mesh
          key={`chase-${x}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[x, y, z]}
        >
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </mesh>
      ))}
    </>
  )
}

/** Astro 西棟: クラシック映画館（キャノピー・マーキー文字・チケット・ポスター列）— 宇宙地区の青シアン */
function CinemaLandmark({ color, accent }: { color: string; accent: string }) {
  const hull = '#0e1422'
  const panel = '#2a3448'
  const trim = '#1a3048'
  const neon = accent
  const bulb = '#b8f0ff'
  const marqueeLetters = [-2.35, -1.4, -0.45, 0.45, 1.4, 2.35]
  return (
    <group>
      {/* 基壇 */}
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[7.6, 0.28, 6.8]} />
        <meshStandardMaterial color={hull} roughness={0.62} metalness={0.35} />
      </mesh>
      {/* 本館 */}
      <mesh position={[0, 2.05, -0.45]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 3.8, 5.6]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.28} />
      </mesh>
      {/* 上部パラペット＋センタークレスト */}
      <mesh position={[0, 4.15, -0.45]} castShadow>
        <boxGeometry args={[6.9, 0.42, 6.0]} />
        <meshStandardMaterial color={panel} roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[0, 4.7, 2.0]} castShadow>
        <boxGeometry args={[1.1, 0.85, 0.45]} />
        <meshStandardMaterial color={trim} roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 5.2, 2.0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={0.55} />
      </mesh>
      {/* 正面階段（広め） */}
      {[0, 1, 2, 3].map((step) => (
        <mesh key={step} position={[0, 0.14 + step * 0.16, 3.05 - step * 0.26]} castShadow receiveShadow>
          <boxGeometry args={[5.0 - step * 0.32, 0.15, 0.52]} />
          <meshStandardMaterial color="#1a2434" roughness={0.78} metalness={0.2} />
        </mesh>
      ))}
      {/* チケットブース */}
      <mesh position={[-2.55, 1.15, 2.45]} castShadow>
        <boxGeometry args={[1.65, 1.9, 1.25]} />
        <meshStandardMaterial color={panel} roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[-2.55, 1.45, 3.1]}>
        <planeGeometry args={[1.15, 0.75]} />
        <meshStandardMaterial color="#061018" emissive={neon} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[-2.55, 2.25, 3.08]}>
        <boxGeometry args={[1.2, 0.18, 0.08]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={0.4} />
      </mesh>
      {/* ポスターケース 3連 */}
      {[-1.15, 0.15, 1.45].map((x, i) => (
        <group key={`poster-${x}`} position={[x, 2.25, 2.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.95, 1.55, 0.14]} />
            <meshStandardMaterial color="#121820" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[0.76, 1.28]} />
            <meshStandardMaterial
              color={i === 1 ? trim : '#152030'}
              emissive={neon}
              emissiveIntensity={0.1 + i * 0.04}
            />
          </mesh>
        </group>
      ))}
      {/* キャノピー */}
      <mesh position={[0, 3.15, 2.85]} castShadow>
        <boxGeometry args={[6.4, 0.18, 1.8]} />
        <meshStandardMaterial color="#101820" roughness={0.45} metalness={0.4} />
      </mesh>
      {/* 点灯マーキー本体 */}
      <mesh position={[0, 3.65, 2.55]} castShadow>
        <boxGeometry args={[6.0, 0.85, 1.5]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={0.72} roughness={0.28} />
      </mesh>
      {/* マーキー文字ブロック */}
      {marqueeLetters.map((x, i) => (
        <mesh key={`letter-${x}`} position={[x, 3.68, 3.28]}>
          <boxGeometry args={[0.55, 0.42, 0.08]} />
          <meshStandardMaterial
            color="#0a1018"
            emissive={i % 2 === 0 ? '#e8fbff' : '#9ae8ff'}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      {/* 下縁の球電球（順番に流れるチェイスライト）。入口の真上は空けて左右に寄せる */}
      <ChaseLights xs={[-2.7, -2.25, -1.8]} y={2.85} z={3.55} color={bulb} />
      <ChaseLights xs={[1.8, 2.25, 2.7]} y={2.85} z={3.55} color={bulb} />
      {/* 入口アーチ＋枠 */}
      <mesh position={[0, 1.45, 2.7]} castShadow>
        <boxGeometry args={[2.55, 2.5, 0.4]} />
        <meshStandardMaterial color="#060a12" roughness={0.75} metalness={0.25} />
      </mesh>
      <mesh position={[0, 2.85, 2.72]}>
        <boxGeometry args={[2.85, 0.32, 0.45]} />
        <meshStandardMaterial color={trim} roughness={0.5} metalness={0.35} />
      </mesh>
      {/* 柱装飾 */}
      {[-3.1, 3.1].map((x) => (
        <group key={`col-${x}`}>
          <mesh position={[x, 2.0, 2.15]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 3.6, 10]} />
            <meshStandardMaterial color={panel} roughness={0.45} metalness={0.4} />
          </mesh>
          <mesh position={[x, 3.95, 2.15]}>
            <boxGeometry args={[0.55, 0.22, 0.55]} />
            <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 3.55, 3.4]} intensity={18} distance={14} color={neon} />
      <pointLight position={[-2.55, 1.55, 3.3]} intensity={7} distance={7} color={bulb} />
    </group>
  )
}

/** テーマ彫刻を正面やや上から照らすライト */
const ICON_LIGHT = { height: 2.6, forward: 1.9, intensity: 16, distance: 9 } as const

/**
 * ボクセルモデルの建物（1棟＝通常＋発光の2バッチ）。
 * 形の定義は landmarks/*Model.ts、ここは描画と彫刻用ライトだけ。
 */
function VoxelLandmark({
  build,
  footprint,
  icon,
  iconLightColor,
}: {
  build: (entrance: LandmarkEntrance) => VoxelModel
  footprint: Attraction['footprint']
  /** 建物横のテーマ彫刻（省略可） */
  icon?: LandmarkIconPlacement
  iconLightColor?: string
}) {
  const { doorHalfWidth, halfDepth } = footprint
  const model = useMemo(
    () => build({ doorHalfWidth, frontZ: halfDepth }),
    [build, doorHalfWidth, halfDepth],
  )

  return (
    <group>
      <VoxelModelMesh model={model} />
      {icon ? (
        <pointLight
          position={[icon.x, ICON_LIGHT.height, icon.z + ICON_LIGHT.forward]}
          intensity={ICON_LIGHT.intensity}
          distance={ICON_LIGHT.distance}
          color={iconLightColor ?? '#fff2e0'}
        />
      ) : null}
    </group>
  )
}

function StarlightDomeLandmark({ color, accent }: { color: string; accent: string }) {
  const hullDark = '#0e1422'
  const panel = '#2a3448'
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.32, 5.8]} />
        <meshStandardMaterial color={hullDark} roughness={0.55} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.1, 5.2]} />
        <meshStandardMaterial color={panel} roughness={0.45} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.6, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 2.4, 16]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.62} />
      </mesh>
      <mesh position={[0, 3.15, -0.4]} castShadow>
        <sphereGeometry args={[1.55, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.28}
          transparent
          opacity={0.55}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.85, 1.5]} castShadow>
        <boxGeometry args={[2.4, 1.2, 1.4]} />
        <meshStandardMaterial color={panel} roughness={0.4} metalness={0.58} />
      </mesh>
      <mesh position={[0, 2.6, 1.55]}>
        <torusGeometry args={[0.55, 0.06, 8, 20]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} />
      </mesh>
    </group>
  )
}

function ShootingGalleryLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.24, 7.2]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.7, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 3.2, 5.6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.55, -0.45]} castShadow>
        <boxGeometry args={[6.8, 0.4, 6.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} metalness={0.08} />
      </mesh>
      {/* 正面カウンター */}
      <mesh position={[0, 0.85, 2.85]} castShadow>
        <boxGeometry args={[4.6, 1.1, 0.55]} />
        <meshStandardMaterial color="#5a4030" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.45, 2.85]} castShadow>
        <boxGeometry args={[4.8, 0.12, 0.7]} />
        <meshStandardMaterial color="#7a5840" roughness={0.78} />
      </mesh>
      {/* 的レーン看板 */}
      <mesh position={[0, 2.55, -2.95]} castShadow>
        <boxGeometry args={[4.2, 1.6, 0.18]} />
        <meshStandardMaterial color="#2a2018" roughness={0.88} />
      </mesh>
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, 2.55, -2.82]}>
          <circleGeometry args={[0.32, 16]} />
          <meshStandardMaterial
            color={x === 0 ? '#e8b060' : '#c45a4a'}
            emissive={x === 0 ? accent : '#c45a4a'}
            emissiveIntensity={0.45}
            roughness={0.5}
          />
        </mesh>
      ))}
      {/* 樽 */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={`barrel-${x}`} position={[x, 0.55, 2.4]} castShadow>
          <cylinderGeometry args={[0.42, 0.48, 1.0, 12]} />
          <meshStandardMaterial color="#6a4a30" roughness={0.88} />
        </mesh>
      ))}
      {/* 木箱 */}
      <mesh position={[-2.5, 0.4, 1.2]} castShadow>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color="#7a5a38" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 0.35, 1.0]} castShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#6a5030" roughness={0.9} />
      </mesh>
      <pointLight position={[0, 2.8, 1.5]} intensity={10} distance={11} color={accent} />
    </group>
  )
}

/** Culture 東棟: フォトブース（カラーパネル＋カメラブース） */
function PfpStudioLandmark({ color, accent }: { color: string; accent: string }) {
  const swatches = ['#638596', '#f2c94c', '#8550a0', '#e07a6a', '#3d6bb3']
  return (
    <group>
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.28, 7.2]} />
        <meshStandardMaterial color="#121820" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 3.5, 5.8]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.14} />
      </mesh>
      <mesh position={[0, 3.75, -0.35]} castShadow>
        <boxGeometry args={[6.6, 0.32, 6.2]} />
        <meshStandardMaterial color="#0a1018" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* 背景カラーウォール */}
      <mesh position={[0, 2.1, -3.05]} castShadow>
        <boxGeometry args={[5.4, 2.8, 0.2]} />
        <meshStandardMaterial color="#638596" roughness={0.7} />
      </mesh>
      {swatches.map((hex, index) => (
        <mesh key={hex} position={[-2.0 + index * 1.0, 3.45, 2.95]} castShadow>
          <boxGeometry args={[0.72, 0.55, 0.12]} />
          <meshStandardMaterial color={hex} roughness={0.55} metalness={0.1} />
        </mesh>
      ))}
      {/* カメラ三脚風 */}
      <mesh position={[2.1, 1.35, 2.55]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#2a3038" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[2.1, 2.55, 2.55]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.7]} />
        <meshStandardMaterial color="#1a1e24" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[2.1, 2.55, 2.95]}>
        <circleGeometry args={[0.18, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
      </mesh>
      <pointLight position={[0, 2.9, 1.2]} intensity={11} distance={12} color={accent} />
    </group>
  )
}

/** Culture 左棟: ルックロッカー（額縁ウォール＋青いスクリーン） */
function TraitMuseumLandmark({ color, accent }: { color: string; accent: string }) {
  const frames: Array<[number, number]> = [
    [-1.7, 2.35],
    [0, 2.35],
    [1.7, 2.35],
    [-1.7, 1.15],
    [0, 1.15],
    [1.7, 1.15],
  ]

  return (
    <group>
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.28, 7.2]} />
        <meshStandardMaterial color="#121c30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 3.5, 5.8]} />
        <meshStandardMaterial color={color} roughness={0.86} metalness={0.12} />
      </mesh>
      <mesh position={[0, 3.75, -0.35]} castShadow>
        <boxGeometry args={[6.6, 0.32, 6.2]} />
        <meshStandardMaterial color="#0a1424" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.2, -3.15]} castShadow>
        <boxGeometry args={[5.6, 3.0, 0.35]} />
        <meshStandardMaterial color="#0c1528" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.25, -2.95]}>
        <boxGeometry args={[4.4, 2.2, 0.08]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
      </mesh>
      {frames.map(([x, y], index) => (
        <group key={index} position={[x, y, 2.95]}>
          <mesh>
            <boxGeometry args={[1.15, 0.95, 0.1]} />
            <meshStandardMaterial color="#0a1424" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[0.88, 0.7, 0.04]} />
            <meshStandardMaterial
              color="#f4f6fa"
              emissive={accent}
              emissiveIntensity={0.18}
              roughness={0.55}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.9, 3.4]} castShadow>
        <boxGeometry args={[2.6, 1.8, 0.28]} />
        <meshStandardMaterial color="#152038" roughness={0.88} />
      </mesh>
      <pointLight position={[0, 2.6, 1.2]} intensity={10} distance={10} color={accent} />
    </group>
  )
}

/** Trait Hunt: ネオン円筒タワー（他棟と揃う高さ） */
function TraitTowerLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  const neon = ['#ff6b9d', '#5ee0ff', '#ffe066', '#a78bfa'] as const

  return (
    <group>
      {/* 基壇ディスク */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 3.55, 0.32, 24]} />
        <meshStandardMaterial color="#0d1822" metalness={0.35} roughness={0.5} />
      </mesh>

      {/* 本体タワー（旧 8m → 約 4m） */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.45, 2.7, 4.0, 24]} />
        <meshStandardMaterial color={color} metalness={0.22} roughness={0.48} />
      </mesh>

      {/* ネオンリング */}
      {[1.15, 2.25, 3.35].map((y, index) => (
        <mesh key={`ring-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.55 + index * 0.04, 0.07, 8, 40]} />
          <meshStandardMaterial
            color={neon[index % neon.length]}
            emissive={neon[index % neon.length]}
            emissiveIntensity={1.15}
          />
        </mesh>
      ))}

      {/* 縦ネオン */}
      {Array.from({ length: 8 }, (_, index) => {
        const a = (index / 8) * Math.PI * 2
        return (
          <mesh
            key={`vneon-${index}`}
            position={[Math.cos(a) * 2.55, 2.2, Math.sin(a) * 2.55]}
            castShadow
          >
            <boxGeometry args={[0.09, 3.7, 0.09]} />
            <meshStandardMaterial
              color={neon[index % neon.length]}
              emissive={neon[index % neon.length]}
              emissiveIntensity={0.9}
            />
          </mesh>
        )
      })}

      {/* トレイト見本オーブ（2段） */}
      {([-1, 1] as const).map((side) =>
        [0, 1].map((row) => (
          <mesh
            key={`orb-${side}-${row}`}
            position={[side * 3.05, 1.45 + row * 1.15, 1.05]}
            castShadow
          >
            <sphereGeometry args={[0.28, 14, 12]} />
            <meshStandardMaterial
              color={neon[(row + (side > 0 ? 1 : 0)) % neon.length]}
              emissive={neon[(row + (side > 0 ? 1 : 0)) % neon.length]}
              emissiveIntensity={0.85}
              roughness={0.35}
            />
          </mesh>
        )),
      )}

      {/* 上空ディスク屋根 */}
      <mesh position={[0, 4.35, 0]} castShadow>
        <cylinderGeometry args={[3.1, 2.2, 0.42, 24]} />
        <meshStandardMaterial color={roofColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.62, 0]}>
        <torusGeometry args={[2.35, 0.09, 8, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0, 5.0, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.0} />
      </mesh>
    </group>
  )
}

function EntrancePortal({
  accent,
  frontZ,
  doorHalfWidth,
}: {
  accent: string
  frontZ: number
  doorHalfWidth: number
}) {
  const doorW = doorHalfWidth * 2
  return (
    <group position={[0, 0, frontZ]}>
      <mesh position={[0, 0.12, 0.35]} receiveShadow>
        <boxGeometry args={[doorW + 0.6, 0.24, 1.1]} />
        <meshStandardMaterial color="#101014" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.55, 0.02]} castShadow>
        <boxGeometry args={[doorW, 3.1, 0.18]} />
        <meshStandardMaterial color="#050608" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.2, 0.12]}>
        <boxGeometry args={[doorW + 0.25, 0.12, 0.14]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

function TitleBanner({
  attraction,
  accent,
  locale,
  y,
  z,
}: {
  attraction: Attraction
  accent: string
  locale: 'en' | 'ja'
  y: number
  z: number
}) {
  const underConstruction = Boolean(attraction.underConstruction)
  const title = underConstruction
    ? locale === 'ja'
      ? '工事中'
      : 'UNDER CONSTRUCTION'
    : attraction.title
  const subtitle = underConstruction
    ? locale === 'ja'
      ? 'COMING SOON'
      : 'COMING SOON'
    : attraction.subtitle

  return (
    <group position={[0, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[5.9, 1.25, 0.22]} />
        <meshStandardMaterial
          color="#0e0c12"
          emissive={accent}
          emissiveIntensity={0.14}
          roughness={0.48}
          metalness={0.22}
        />
      </mesh>
      <Text
        position={[0, 0.14, 0.15]}
        fontSize={underConstruction ? 0.4 : 0.44}
        color="#f6df9d"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.4}
      >
        {title}
      </Text>
      <Text
        position={[0, -0.38, 0.13]}
        fontSize={0.22}
        color="#c5bda9"
        anchorX="center"
        anchorY="middle"
      >
        {subtitle}
      </Text>
    </group>
  )
}

function AttractionInfoBoard({
  position,
  accentColor,
  description,
  heading,
  locale,
  underConstruction = false,
}: {
  position: [number, number, number]
  accentColor: string
  description: string
  heading: string
  locale: 'en' | 'ja'
  underConstruction?: boolean
}) {
  const displayHeading = underConstruction
    ? locale === 'ja'
      ? '工事中'
      : 'UNDER CONSTRUCTION'
    : heading
  const displayDescription = underConstruction ? '' : description

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.24, 1.05]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 2.15, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.04]} castShadow>
        <boxGeometry args={[3.05, 1.58, 0.16]} />
        <meshStandardMaterial
          color="#17151d"
          emissive={accentColor}
          emissiveIntensity={0.08}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, displayDescription ? 2.06 : 1.55, 0.15]}
        fontSize={displayDescription ? 0.16 : underConstruction ? 0.24 : 0.28}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.7}
        textAlign="center"
        overflowWrap="normal"
        whiteSpace="nowrap"
      >
        {displayHeading}
      </Text>
      {displayDescription ? (
        <Text
          position={[0, 1.36, 0.15]}
          fontSize={0.145}
          lineHeight={1.22}
          color="#f1eadc"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          maxWidth={2.7}
          overflowWrap="normal"
        >
          {displayDescription}
        </Text>
      ) : null}
    </group>
  )
}
