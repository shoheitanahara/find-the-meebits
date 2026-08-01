import type { VRM } from '@pixiv/three-vrm'
import { MToonMaterial } from '@pixiv/three-vrm'
import { Color, Mesh, MeshStandardMaterial } from 'three'

/**
 * 公式 Meebit の「ソフトプラスチック」寄りに MToon を寄せる。
 * 強いトゥーン境界と強いフレネルはリアルタイムで安っぽく見えやすいので弱める。
 */
export function applyStudioVrmShading(vrm: VRM) {
  vrm.scene.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const material of materials) {
      if (material instanceof MToonMaterial) {
        // 面ごとのソフトな明暗（公式のマット寄りグラデ）
        material.shadingToonyFactor = 0.28
        material.shadingShiftFactor = -0.06
        material.giEqualizationFactor = 0.35

        const shade = material.shadeColorFactor
        if (shade) {
          material.shadeColorFactor = new Color(shade).lerp(material.color, 0.16)
        }

        // フレネルはごく弱く（帯ハイライト防止）
        material.parametricRimColorFactor = new Color('#9aa8bc')
        material.parametricRimFresnelPowerFactor = 4.0
        material.parametricRimLiftFactor = 0.02
        material.rimLightingMixFactor = 0.25

        material.needsUpdate = true
        continue
      }

      if (material instanceof MeshStandardMaterial) {
        material.roughness = Math.max(material.roughness ?? 0.75, 0.68)
        material.metalness = Math.min(material.metalness ?? 0, 0.05)
        material.envMapIntensity = Math.min(material.envMapIntensity ?? 1, 0.55)
        material.needsUpdate = true
      }
    }
  })
}
