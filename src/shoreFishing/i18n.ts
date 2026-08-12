import { getLocale } from '../i18n/locale'
import {
  getFishKind,
  SHORE_FISHING,
  type FishKindId,
  type ShoreFishingRatingId,
} from './config'

const fishNames: Record<FishKindId, { en: string; ja: string }> = {
  sardine: { en: 'Sardine', ja: 'イワシ' },
  horseMackerel: { en: 'Horse Mackerel', ja: 'アジ' },
  ray: { en: 'Ray', ja: 'エイ' },
  seaBass: { en: 'Sea Bass', ja: 'スズキ' },
  snapper: { en: 'Snapper', ja: 'タイ' },
  flounder: { en: 'Flounder', ja: 'カレイ' },
  tuna: { en: 'Tuna', ja: 'マグロ' },
  seahorse: { en: 'Seahorse', ja: 'タツノオトシゴ' },
  hammerhead: { en: 'Hammerhead', ja: 'シュモクザメ' },
  greatWhite: { en: 'Great White', ja: 'ホオジロザメ' },
}

const ratingNames: Record<ShoreFishingRatingId, { en: string; ja: string }> = {
  legend: { en: 'LEGEND', ja: 'レジェンド' },
  captain: { en: 'CAPTAIN', ja: 'キャプテン' },
  angler: { en: 'ANGLER', ja: 'アングラー' },
  castaway: { en: 'CASTAWAY', ja: 'カースタウェイ' },
  tidewalker: { en: 'TIDE WALKER', ja: 'タイドウォーカー' },
}

const copy = {
  en: {
    title: 'Shore Fishing',
    subtitle: 'A shadow. A strike. The sea decides.',
    rulesTitle: 'Fish on!',
    controls: 'Walk the shore. Cast on a shadow. Reel on the big bite.',
    scoreGuideTitle: 'Catch list',
    ratingGuideTitle: 'Ratings',
    start: 'Cast off',
    playAgain: 'Fish again',
    backToTitle: 'Back to title',
    best: 'Best today',
    score: 'Score',
    time: 'Time',
    caught: 'Caught',
    cast: 'Cast',
    hook: 'Reel!',
    cancel: 'Cancel',
    wait: 'Waiting…',
    waitFish: 'Waiting for a bite… (Reel to cancel)',
    nibble: 'Nibble…',
    bite: 'Bite!',
    miss: 'Got away…',
    empty: 'No fish nearby…',
    catch: 'Caught!',
    nearShore: 'Shoreline — ready to cast',
    walkHint: 'Walk to the edge of the island',
    sessionTitle: 'This session',
    emptySession: 'No fish yet.',
    resultTitle: 'Time’s up',
    countdown: 'Get ready',
  },
  ja: {
    title: 'ショアフィッシング',
    subtitle: '影。一振り。海が決める。',
    rulesTitle: 'Fish on!',
    controls: '岸を歩いて影にキャスト。大きく沈んだらすぐ引け。',
    scoreGuideTitle: '釣れる魚',
    ratingGuideTitle: '評価',
    start: '釣りに出る',
    playAgain: 'もう一度釣る',
    backToTitle: '最初のカードに戻る',
    best: '本日ベスト',
    score: 'スコア',
    time: '残り',
    caught: '釣果',
    cast: 'キャスト',
    hook: '今だ！',
    cancel: 'やめる',
    wait: '待ち中…',
    waitFish: '魚を待ってる…（引くとキャンセル）',
    nibble: 'つついてる…',
    bite: '食った！',
    miss: '逃げられた…',
    empty: '近くに魚影がない…',
    catch: '釣れた！',
    nearShore: '岸辺 — キャストできます',
    walkHint: '島のふちまで歩いてね',
    sessionTitle: 'この回の釣果',
    emptySession: 'まだ釣れていない',
    resultTitle: 'タイムアップ',
    countdown: '準備して',
  },
} as const

export function shoreFishingUi() {
  return copy[getLocale()]
}

export function fishLabel(id: FishKindId) {
  return fishNames[id][getLocale()]
}

export function ratingLabel(id: ShoreFishingRatingId) {
  return ratingNames[id][getLocale()]
}

export function fishScoreRows() {
  return SHORE_FISHING.fishKinds
    .map((f) => {
      const kind = getFishKind(f.id)
      return {
        id: kind.id,
        color: kind.color,
        score: kind.score,
        rare: Boolean(kind.rare),
        label: fishLabel(kind.id),
      }
    })
    .sort((a, b) => b.score - a.score)
}
