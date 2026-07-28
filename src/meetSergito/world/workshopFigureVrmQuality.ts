import type { VRM } from '@pixiv/three-vrm'
import { LinearFilter, Mesh, MeshStandardMaterial, Texture } from 'three'
import { isMobilePerfMode } from '../../game/perfConfig'

/**
 * 各辺をこの倍率に（0.5 = 面積約 1/4）。
 * 工房フィギュア専用 — 他 VRM には適用しない。
 */
export const WORKSHOP_FIGURE_TEXTURE_SCALE_PC = 0.5
/** スマホはフィギュアが小さいのでさらに落とす（数は減らさない） */
export const WORKSHOP_FIGURE_TEXTURE_SCALE_MOBILE = 0.22

export function getWorkshopFigureTextureScale() {
  return isMobilePerfMode() ? WORKSHOP_FIGURE_TEXTURE_SCALE_MOBILE : WORKSHOP_FIGURE_TEXTURE_SCALE_PC
}

/** @deprecated getWorkshopFigureTextureScale() を使う */
export const WORKSHOP_FIGURE_TEXTURE_SCALE = WORKSHOP_FIGURE_TEXTURE_SCALE_PC

const MATERIAL_MAP_KEYS = [
  'map',
  'normalMap',
  'emissiveMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
] as const

const DETAIL_MAP_KEYS = [
  'normalMap',
  'emissiveMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
] as const

const downscaledTextures = new WeakSet<Texture>()

function disposeImageSource(image: unknown) {
  if (image && typeof (image as { close?: () => void }).close === 'function') {
    ;(image as { close: () => void }).close()
  }
}

function downscaleTexture(texture: Texture, scale: number) {
  if (downscaledTextures.has(texture)) {
    return
  }

  const image = texture.image as CanvasImageSource & { width?: number; height?: number } | undefined
  const srcW = image?.width ?? 0
  const srcH = image?.height ?? 0
  if (!image || srcW <= 0 || srcH <= 0) {
    return
  }

  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))
  if (w >= srcW && h >= srcH) {
    downscaledTextures.add(texture)
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.drawImage(image, 0, 0, w, h)
  disposeImageSource(image)
  texture.image = canvas
  texture.needsUpdate = true
  texture.anisotropy = 1
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  downscaledTextures.add(texture)
}

function downscaleMaterial(material: MeshStandardMaterial, scale: number, stripDetailMaps: boolean) {
  if (stripDetailMaps) {
    for (const key of DETAIL_MAP_KEYS) {
      const map = material[key]
      if (map) {
        map.dispose()
        material[key] = null
      }
    }
    material.needsUpdate = true
  }

  for (const key of MATERIAL_MAP_KEYS) {
    const map = material[key]
    if (map) {
      downscaleTexture(map, scale)
    }
  }
}

/** 展示フィギュア向け — テクスチャ解像度を下げ、影を切る */
export function applyWorkshopFigureVrmQuality(
  vrm: VRM,
  textureScale = getWorkshopFigureTextureScale(),
) {
  const stripDetailMaps = isMobilePerfMode()

  vrm.scene.traverse((obj) => {
    if (!(obj instanceof Mesh)) {
      return
    }

    obj.castShadow = false
    obj.receiveShadow = false
    obj.frustumCulled = true

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const material of materials) {
      if (material instanceof MeshStandardMaterial) {
        downscaleMaterial(material, textureScale, stripDetailMaps)
      }
    }
  })
}
