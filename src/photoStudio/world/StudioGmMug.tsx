import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { PHOTO_STUDIO, getGmMugColorVariant, type PhotoStudioGmMugColorId } from '../config'

type StudioGmMugProps = {
  /** スタジオ背景色。GM 文字に使う */
  letterColor: string
  colorId: PhotoStudioGmMugColorId
}

/** 縦長に伸ばした太字 GM（マグ面にフィットさせる） */
function createGmLabelTexture(letterColor: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new CanvasTexture(canvas)
  }

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = letterColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.translate(size / 2, size / 2)
  // 横を少し圧縮・縦を伸ばして縦長フォント感
  ctx.scale(0.68, 2.0)
  ctx.font = '900 220px "Arial Black", Impact, "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('GM', 0, 8)
  ctx.restore()

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * GM ポーズ用マグカップ。
 * 取っ手は本体に食い込ませて隙間なし。前面に縦長 GM ラベル。
 */
export function StudioGmMug({ letterColor, colorId }: StudioGmMugProps) {
  const { scale, rotation } = PHOTO_STUDIO.gmMug
  const { colors } = getGmMugColorVariant(colorId)
  const labelTexture = useMemo(
    () => createGmLabelTexture(letterColor),
    [letterColor],
  )

  useEffect(() => {
    return () => {
      labelTexture.dispose()
    }
  }, [labelTexture])

  // 原点付近＝底〜掌。持ちやすいよう底を y≈0 付近に置く。
  return (
    <group
      scale={scale}
      rotation={[rotation[0], rotation[1], rotation[2]]}
    >
      {/* カップ本体（やや上すぼまり） */}
      <mesh position={[0, 0.055, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.115, 20]} />
        <meshStandardMaterial color={colors.body} roughness={0.68} metalness={0.03} />
      </mesh>
      {/* 内側 */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.046, 0.05, 0.095, 16]} />
        <meshStandardMaterial color={colors.inside} roughness={0.92} metalness={0} />
      </mesh>
      {/* リム */}
      <mesh position={[0, 0.111, 0]} castShadow>
        <cylinderGeometry args={[0.057, 0.057, 0.01, 20]} />
        <meshStandardMaterial color={colors.rim} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* 底（掌に載せる基準） */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.058, 0.012, 16]} />
        <meshStandardMaterial color={colors.rim} roughness={0.75} metalness={0.03} />
      </mesh>

      {/*
        C ハンドル — 本体半径 (~0.057) に食い込ませて接続。
        水平バーを壁の内側まで伸ばし、隙間をなくす。
      */}
      <group position={[-0.05, 0.055, 0]}>
        <mesh position={[-0.012, 0.032, 0]} castShadow>
          <boxGeometry args={[0.04, 0.016, 0.024]} />
          <meshStandardMaterial color={colors.handle} roughness={0.65} metalness={0.04} />
        </mesh>
        <mesh position={[-0.012, -0.028, 0]} castShadow>
          <boxGeometry args={[0.04, 0.016, 0.024]} />
          <meshStandardMaterial color={colors.handle} roughness={0.65} metalness={0.04} />
        </mesh>
        <mesh position={[-0.034, 0.002, 0]} castShadow>
          <boxGeometry args={[0.016, 0.072, 0.024]} />
          <meshStandardMaterial color={colors.handle} roughness={0.65} metalness={0.04} />
        </mesh>
      </group>

      {/* GM ラベル（大きめ・縦長テクスチャ） */}
      <mesh position={[-0.02, 0.055, 0.059]} castShadow>
        <planeGeometry args={[0.1, 0.09]} />
        <meshStandardMaterial
          map={labelTexture}
          transparent
          roughness={0.55}
          metalness={0.02}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
