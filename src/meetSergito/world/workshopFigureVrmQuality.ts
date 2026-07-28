import type { VRM } from '@pixiv/three-vrm'
import { LinearFilter, Mesh, MeshStandardMaterial, Texture } from 'three'

/**
 * 各辺をこの倍率に（0.5 = 512→256 など。ピクセル数は約 1/4）。
 * 工房フィギュア専用 — 他 VRM には適用しない。
 */
export const WORKSHOP_FIGURE_TEXTURE_SCALE = 0.5

const MATERIAL_MAP_KEYS = [
  'map',
  'normalMap',
  'emissiveMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
] as const

const downscaledTextures = new WeakSet<Texture>()

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
  texture.image = canvas
  texture.needsUpdate = true
  texture.anisotropy = 1
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  downscaledTextures.add(texture)
}

function downscaleMaterial(material: MeshStandardMaterial, scale: number) {
  for (const key of MATERIAL_MAP_KEYS) {
    const map = material[key]
    if (map) {
      downscaleTexture(map, scale)
    }
  }
}

/** 展示フィギュア向け — テクスチャ解像度を下げ、影を切る */
export function applyWorkshopFigureVrmQuality(vrm: VRM, textureScale = WORKSHOP_FIGURE_TEXTURE_SCALE) {
  vrm.scene.traverse((obj) => {
    if (!(obj instanceof Mesh)) {
      return
    }

    obj.castShadow = false
    obj.receiveShadow = false

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const material of materials) {
      if (material instanceof MeshStandardMaterial) {
        downscaleMaterial(material, textureScale)
      }
    }
  })
}
