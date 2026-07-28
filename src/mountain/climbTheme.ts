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
  /** タイトル画面のキャッチ（大きく表示） */
  tagline: { en: string; ja: string }
  /** 日替わりリセット等の補足（小さく表示） */
  dailyNote: { en: string; ja: string }
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
  progressKey: 'meebits-mountain-progress-v3',
  brand: { en: 'Mt. Meeb', ja: 'Mt. Meeb' },
  eyebrow: { en: 'Voxel Summit Run', ja: 'ボクセル頂上ラン' },
  tagline: {
    en: 'Jump the gaps. Dash the ledges. Grab the flag at the top!',
    ja: '隙間を跳び、棚を駆け、頂の旗を掴め！',
  },
  dailyNote: {
    en: '20 stages to 1000m. The mountain reshapes every day — route and progress reset at midnight JST.',
    ja: '全20ステージ、標高1000m。山は毎日形を変える — ルートと進捗は毎日深夜（JST）にリセット。',
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
  progressKey: 'meebits-jerry-mountain-progress-v1',
  brand: { en: 'Jerry Mountain', ja: 'ジェリーマウンテン' },
  eyebrow: { en: 'Neon Stack Run', ja: 'ネオン積み木ラン' },
  tagline: {
    en: 'Neon blocks over the void. One wrong step — and down you go.',
    ja: 'ネオンのブロック、底なしの闇。一歩ミスれば、落下。',
  },
  dailyNote: {
    en: 'Same climb as Mt. Meeb — new neon maze every day. Progress resets at midnight JST.',
    ja: 'Mt. Meeb と同じ登り。ネオンの迷路は毎日変わる。進捗は毎日深夜（JST）にリセット。',
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
