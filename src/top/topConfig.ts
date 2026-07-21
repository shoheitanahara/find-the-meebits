import type { AttractionId } from './topStore'

export type Attraction = {
  id: AttractionId
  title: string
  subtitle: string
  description: {
    en: string
    ja: string
  }
  storyTitle: {
    en: string
    ja: string
  }
  color: string
  roofColor: string
  x: number
  z: number
  entranceZ: number
}

export const TOP_ATTRACTIONS: Attraction[] = [
  {
    id: 'find',
    title: 'FIND THE MEEBIT',
    subtitle: 'The Museum',
    description: {
      en: 'Somewhere in the museum,\none Meebit is waiting.\nCan you find them?',
      ja: '美術館のどこかで、\nひとりのMeebitが待っている。\n見つけ出せるかな？',
    },
    storyTitle: {
      en: 'THE LOST MEEBIT',
      ja: '待っているMeebit',
    },
    color: '#74364a',
    roofColor: '#33202f',
    x: -13,
    z: -8.5,
    entranceZ: -5.3,
  },
  {
    id: 'traits',
    title: 'TRAIT HUNT',
    subtitle: 'The Gallery',
    description: {
      en: 'Only a few traits remain.\nFollow the clues and reveal\nwho they describe.',
      ja: '残された特徴は、\nわずかな手がかり。\nその先のMeebitを見抜けるか？',
    },
    storyTitle: {
      en: 'THE TRAITS LEFT BEHIND',
      ja: '残された特徴',
    },
    color: '#28576b',
    roofColor: '#163142',
    x: 0,
    z: -11,
    entranceZ: -7.8,
  },
  {
    id: 'street',
    title: '8TH STREET',
    subtitle: 'The Night Alley',
    description: {
      en: 'The alley repeats after dark.\nNotice what changed and\nfind the way out.',
      ja: '同じ夜の路地が繰り返す。\n小さな変化を見破り、\n出口へたどり着け。',
    },
    storyTitle: {
      en: 'THE REPEATING ALLEY',
      ja: '繰り返す夜の路地',
    },
    color: '#5a3d72',
    roofColor: '#2e213f',
    x: 13,
    z: -8.5,
    entranceZ: -5.3,
  },
]
