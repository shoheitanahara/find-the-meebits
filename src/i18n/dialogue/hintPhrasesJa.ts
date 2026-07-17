/** Target hint phrase fragments — Japanese (array lengths must match English). */

export type MapZone = 'entrance' | 'front' | 'center' | 'back' | 'west' | 'east'

export type VenueHintPhrases = {
  zone: Record<MapZone, string[]>
  sameZone: Record<MapZone, string[]>
  farZone: Record<MapZone, string[]>
  veryClose: string[]
  prefixes: string[]
}

export const MUSEUM_HINT_PHRASES_JA: VenueHintPhrases = {
  prefixes: [
    'ここだけの話、',
    'ねえ、',
    'こっそり教えるけど、',
    '小耳に挟んだんだけど、',
    'ヒントを言うと、',
  ],
  veryClose: ['すぐ近くにいるよ。探してみて'],
  zone: {
    entrance: ['入口の近くにいるよ', '入口エリアにいるよ'],
    front: ['館内の手前の方にいるよ', 'ギャラリーの手前にいるよ'],
    center: ['館内の中央あたりにいるよ', 'ギャラリーの中央にいるよ'],
    back: ['館内の奥の方にいるよ', 'ギャラリーの奥にいるよ'],
    west: ['館内の西側にいるよ', 'ギャラリーの西側にいるよ'],
    east: ['館内の東側にいるよ', 'ギャラリーの東側にいるよ'],
  },
  sameZone: {
    entrance: ['あなたと同じ入口エリアにいるよ。探してみて'],
    front: ['あなたと同じ手前のエリアにいるよ。探してみて'],
    center: ['あなたと同じ中央エリアにいるよ。探してみて'],
    back: ['あなたと同じ奥のエリアにいるよ。探してみて'],
    west: ['あなたと同じ西側にいるよ。探してみて'],
    east: ['あなたと同じ東側にいるよ。探してみて'],
  },
  farZone: {
    entrance: ['ここからずっと入口の方にいるよ'],
    front: ['ここからずっと館内の手前の方にいるよ'],
    center: ['ここからずっと館内の中央の方にいるよ'],
    back: ['ここからずっと館内の奥の方にいるよ'],
    west: ['ここからずっと館内の西側にいるよ'],
    east: ['ここからずっと館内の東側にいるよ'],
  },
}

export const CLUB_HINT_PHRASES_JA: VenueHintPhrases = {
  prefixes: [
    'ここだけの話、',
    'ねえ、',
    '小耳に挟んだんだけど、',
    'フロアの噂だと、',
    'こっそり教えるけど、',
  ],
  veryClose: ['ダンスフロアのすぐ近くにいるよ。探してみて', 'この人混みのすぐ近くにいるよ。探してみて'],
  zone: {
    entrance: ['入口のアーチの近くにいるよ', '正面のドアのそばにいるよ'],
    front: ['ダンスフロアの手前の方にいるよ', '手前のライトの近くにいるよ'],
    center: ['ダンスフロアの中央にいるよ', '中央のスポットライトの下にいるよ'],
    back: ['DJブースの近くにいるよ', '奥のデッキのあたりにいるよ'],
    west: ['クラブの西側にいるよ', '西のエリアにいるよ'],
    east: ['クラブの東側にいるよ', '東のエリアにいるよ'],
  },
  sameZone: {
    entrance: ['あなたと同じ入口エリアにいるよ。探してみて'],
    front: ['あなたと同じダンスフロアの手前にいるよ。探してみて'],
    center: ['あなたと同じ人混みの中にいるよ。探してみて'],
    back: ['あなたと同じ奥のデッキのあたりにいるよ。探してみて'],
    west: ['あなたと同じ西側にいるよ。探してみて'],
    east: ['あなたと同じ東側にいるよ。探してみて'],
  },
  farZone: {
    entrance: ['ここからずっと入口のアーチの方にいるよ'],
    front: ['ここからずっとダンスフロアの手前の方にいるよ'],
    center: ['ここからずっと中央のライトの方にいるよ'],
    back: ['ここからずっとDJブースの方にいるよ'],
    west: ['ここからずっとクラブの西側にいるよ'],
    east: ['ここからずっとクラブの東側にいるよ'],
  },
}
