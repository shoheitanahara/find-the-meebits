import type { Locale } from '../i18n/locale'
import type { AppEdition } from './appEdition'

const metadata = {
  en: {
    top: {
      title: 'Meebits Park',
      description: 'Choose your Meebit and explore three interactive attractions in Meebits Park.',
    },
    v1: {
      title: 'Find the Meebit | Meebits Park',
      description: 'Search the museum crowd and find the target Meebit.',
    },
    v2: {
      title: 'Trait Hunt | Meebits Park',
      description: 'Follow the trait clues and find Meebits with matching features.',
    },
    '8th-street': {
      title: '8th Street | Meebits Park',
      description: 'Walk the repeating night alley, spot what changed, and find the way out.',
    },
    mountain: {
      title: 'Mt. Meeb | Meebits Park',
      description: 'Climb the voxel mountain with jumps and dashes. Clear 20 stages up to 1000m.',
    },
    neon: {
      title: 'Jerry Mountain | Meebits Park',
      description: 'Climb tetromino neon cliffs over a black abyss. Same climb, darker world — 20 stages.',
    },
    runway: {
      title: 'Meebits Runway | Meebits Park',
      description: 'A dark room and a glowing catwalk. Watch Meebits matching today’s color walk the runway.',
    },
    closet: {
      title: 'Look Locker | Meebits Park',
      description: 'Pick looks, find matching Meebits, and try them on as your avatar.',
    },
    sergito: {
      title: 'Meet Sergito | Meebits Park',
      description: 'Visit Sergito’s workshop. He’ll look at your Meebit and share a short, personal comment.',
    },
    shooting: {
      title: 'Shooting Gallery | Meebits Park',
      description: 'Aim at moving fairground targets from the mountain booth. Forty-five seconds to chase a high score.',
    },
    starlight: {
      title: 'Starlight Rush | Meebits Park',
      description: 'Ride a cosmic coaster and shoot colorful stars racing toward you. Ninety seconds of Starlight Rush.',
    },
    pfp: {
      title: 'Photo Booth | Meebits Park',
      description: 'Shoot a clean square Meebit PFP and issue today’s visit pass with your park records.',
    },
  },
  ja: {
    top: {
      title: 'ミービッツ・パーク | Meebits Park',
      description: 'お気に入りのMeebitを選び、3つのアトラクションを巡るインタラクティブパーク。',
    },
    v1: {
      title: 'Find the Meebit | Meebits Park',
      description: '美術館に集まったMeebitの中から、ターゲットを探し出そう。',
    },
    v2: {
      title: 'トレイトハント | Meebits Park',
      description: '特徴のヒントを頼りに、同じ特徴を持つMeebitを探そう。',
    },
    '8th-street': {
      title: '8番ストリート | Meebits Park',
      description: '繰り返す夜の路地を歩き、小さな変化を見破って出口を目指そう。',
    },
    mountain: {
      title: 'Mt. Meeb | Meebits Park',
      description: 'ジャンプとダッシュでボクセルの山を登ろう。全20ステージ・約1000m。',
    },
    neon: {
      title: 'ジェリーマウンテン | Meebits Park',
      description: 'テトリス風ネオンの崖を、暗黒の奈落の上で登ろう。ゲーム性はMt. Meebと同じ。',
    },
    runway: {
      title: 'Meebits Runway | Meebits Park',
      description: '暗い会場に輝くランウェイ。本日の色に合うMeebitが次々と歩くショー。',
    },
    closet: {
      title: 'ルックロッカー | Meebits Park',
      description: '見た目を選んで合うMeebitを見つけ、アバターにきせかえよう。',
    },
    sergito: {
      title: 'Meet Sergito | Meebits Park',
      description: 'Sergitoの工房を訪れ、あなたのMeebitを見てもらおう。traitに合わせた短いコメントが返ってくる。',
    },
    shooting: {
      title: 'シューティングギャラリー | Meebits Park',
      description: 'マウンテン地区の射的場で、動く的を狙おう。制限時間45秒のスコアアタック。',
    },
    starlight: {
      title: 'スターライト・ラッシュ | Meebits Park',
      description: '宇宙ジェットコースターに乗り、奥から流れてくる星を撃て。90秒のスコアアタック。',
    },
    pfp: {
      title: 'フォトブース | Meebits Park',
      description: 'きれいな正方形のMeebit PFPを撮影し、今日のパーク記録つき来場証明書を発行しよう。',
    },
  },
} as const

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

export function applyPageMetadata(edition: AppEdition, locale: Locale) {
  const pageMetadata = metadata[locale][edition]
  const canonicalUrl = new URL(window.location.pathname, window.location.origin).toString()

  document.title = pageMetadata.title
  document.documentElement.lang = locale
  setMetaContent('meta[name="description"]', pageMetadata.description)
  setMetaContent('meta[property="og:title"]', pageMetadata.title)
  setMetaContent('meta[property="og:description"]', pageMetadata.description)
  setMetaContent('meta[property="og:url"]', canonicalUrl)
  setMetaContent('meta[name="twitter:title"]', pageMetadata.title)
  setMetaContent('meta[name="twitter:description"]', pageMetadata.description)
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
}
