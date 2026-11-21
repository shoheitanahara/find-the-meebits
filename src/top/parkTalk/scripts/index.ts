import type { TalkScript } from '../types'
import { ARTIST_SCRIPTS } from './artist'
import { BUBBLY_SCRIPTS } from './bubbly'
import { COOL_SCRIPTS } from './cool'
import { EXPLORER_SCRIPTS } from './explorer'
import { ROBOT_SCRIPTS } from './robot'
import { SAGE_SCRIPTS } from './sage'
import { SISTERLY_SCRIPTS } from './sisterly'
import { SPORTY_SCRIPTS } from './sporty'
import { STREET_SCRIPTS } from './street'
import { STYLISH_SCRIPTS } from './stylish'

export const PARK_TALK_SCRIPTS: readonly TalkScript[] = [
  ...STREET_SCRIPTS,
  ...SPORTY_SCRIPTS,
  ...COOL_SCRIPTS,
  ...ARTIST_SCRIPTS,
  ...STYLISH_SCRIPTS,
  ...BUBBLY_SCRIPTS,
  ...SISTERLY_SCRIPTS,
  ...EXPLORER_SCRIPTS,
  ...SAGE_SCRIPTS,
  ...ROBOT_SCRIPTS,
]
