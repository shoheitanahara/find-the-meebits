/**
 * ワールド内の文字（看板・建物のサイン・スクリーンなど）に使う Text。
 * UI と同じ Montserrat を使う。drei の Text は font 未指定だと Roboto になるため、
 * ワールドの文字はすべてここを経由させる。
 *
 * 日本語など Montserrat にない文字は、troika が自動で代替フォントに切り替える。
 */
import { Text as DreiText } from '@react-three/drei'
import type { ComponentProps } from 'react'
import montserratSemiBold from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff?url'

/** UI と同じフォント（Montserrat SemiBold） */
export const WORLD_FONT_URL: string = montserratSemiBold

export function Text(props: ComponentProps<typeof DreiText>) {
  return <DreiText font={WORLD_FONT_URL} {...props} />
}
