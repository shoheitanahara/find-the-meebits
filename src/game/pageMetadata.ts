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
      title: 'Mountain Climb | Meebits Park',
      description: 'Climb the voxel mountain with jumps and dashes. Reach the summit in a few minutes.',
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
      title: '山登り | Meebits Park',
      description: 'ボクセルの山をジャンプとダッシュで登り、山頂を目指そう。',
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
