import type { Locale } from '../i18n/locale'

export type ParkTip = {
  title: string
  body: string
}

const copy = {
  en: {
    lead: 'A few things that help in the park.',
    controls: 'PC: WASD or arrows to move · E to talk · Mobile: joystick + Talk when nearby',
    tips: [
      {
        title: 'Red marker',
        body: 'Walk up to a Meebit. A red dot above them means you can talk.',
      },
      {
        title: 'Attractions',
        body: 'Step inside the gate at an attraction entrance to go in.',
      },
      {
        title: 'Districts',
        body: 'Use gates to reach the plaza, mountain, culture, sea — and more areas to come.',
      },
    ] as ParkTip[],
  },
  ja: {
    lead: 'パークを楽しむための基本操作です。',
    controls: 'PC: WASD / 矢印で移動 · E で話す · スマホ: スティック + 近くで「話す」',
    tips: [
      {
        title: '赤いマーカー',
        body: 'Meebitに近づくと、頭上に赤い点が表示されます。話しかけられます。',
      },
      {
        title: 'アトラクション',
        body: '建物のゲート内に入ると、アトラクションに入れます。',
      },
      {
        title: '地区を移動',
        body: 'ゲートから広場・登山・カルチャー・シーなど、ほかのエリアへも行けます（今後も増え予定）。',
      },
    ] as ParkTip[],
  },
} as const

export function getParkTips(locale: Locale) {
  return copy[locale]
}
