/**
 * Mt. Meeb と同系統クライミングの世界観スキン。
 * URL パスで確定（ページ単位ロード）。
 */
export type ClimbThemeId = 'meeb' | 'neon'

export type ClimbTheme = {
  id: ClimbThemeId
  progressKey: string
  /** UI・メタ用 */
  brand: { en: string; ja: string }
  blurb: { en: string; ja: string }
  eyebrow: { en: string; ja: string }
  /** Canvas 背後の DOM 背景 */
  shellBg: string
  titleGradient: string
  atmosphere: {
    background: string
    fog: string
    fogNear: number
    fogFar: number
    ambient: number
    hemiSky: string
    hemiGround: string
    hemiIntensity: number
    sunIntensity: number
    sunColor: string
  }
  voidMode: 'magma' | 'abyss'
  flag: {
    pole: string
    cloth: string
    clothEmissive: string
    tip: string
    tipEmissive: string
    light: string
  }
}

export function getClimbThemeId(
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
): ClimbThemeId {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.includes('neon-stack')) return 'neon'
  return 'meeb'
}

const MEEB_THEME: ClimbTheme = {
  id: 'meeb',
  progressKey: 'meebits-mountain-progress-v2',
  brand: { en: 'Mt. Meeb', ja: 'Mt. Meeb' },
  eyebrow: { en: '20 Stages · 1000m', ja: '全20ステージ · 1000m' },
  blurb: {
    en: 'Winding ledges and gappy cliffs. Clear a stage to unlock the next — 50m each, up to 1000m.',
    ja: '曲がりくねった棚と隙間だらけの崖。1ステージ50m、クリアで次が解放され約1000mまで登れる。',
  },
  shellBg: 'bg-[#87b8d8]',
  titleGradient: 'bg-gradient-to-b from-[#6a9fc0] via-[#87b8d8] to-[#3d6b3a]',
  atmosphere: {
    background: '#5a7a98',
    fog: '#5a7a98',
    fogNear: 55,
    fogFar: 300,
    ambient: 0.34,
    hemiSky: '#c8d8ea',
    hemiGround: '#1a0808',
    hemiIntensity: 0.48,
    sunIntensity: 1.65,
    sunColor: '#ffffff',
  },
  voidMode: 'magma',
  flag: {
    pole: '#f0e4c8',
    cloth: '#ff3a28',
    clothEmissive: '#ff2a18',
    tip: '#ffe08a',
    tipEmissive: '#ffcc55',
    light: '#ff8855',
  },
}

const NEON_THEME: ClimbTheme = {
  id: 'neon',
  progressKey: 'meebits-neon-stack-progress-v1',
  brand: { en: 'Neon Stack', ja: 'ネオンスタック' },
  eyebrow: { en: '20 Stages · Neon Abyss', ja: '全20ステージ · ネオン奈落' },
  blurb: {
    en: 'Same climb, different world — tetromino cliffs over a black void. Clear stages to push higher.',
    ja: 'ゲーム性は同じ。テトリス風ブロックの崖を、暗黒の奈落の上で登る。クリアで次ステージが解放。',
  },
  shellBg: 'bg-[#242060]',
  titleGradient: 'bg-gradient-to-b from-[#2e2870] via-[#3a3090] to-[#4a38a8]',
  atmosphere: {
    background: '#2a2470',
    fog: '#3a3490',
    fogNear: 75,
    fogFar: 340,
    ambient: 1.35,
    hemiSky: '#b8a8f0',
    hemiGround: '#4a4080',
    hemiIntensity: 1.65,
    sunIntensity: 3.2,
    sunColor: '#ffffff',
  },
  voidMode: 'abyss',
  flag: {
    pole: '#d0d8ff',
    cloth: '#ff2bd6',
    clothEmissive: '#ff4af0',
    tip: '#5ef0ff',
    tipEmissive: '#3ad8ff',
    light: '#ff66ee',
  },
}

export function getClimbTheme(
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
): ClimbTheme {
  return getClimbThemeId(pathname) === 'neon' ? NEON_THEME : MEEB_THEME
}
