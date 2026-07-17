import { Buildings } from './Buildings'
import { Ground } from './Ground'
import { getMuseumSeason } from './museumSeason'
import { MuseumSeasonDecor } from './MuseumSeasonDecor'
import { Ocean } from './Ocean'
import { Plaza } from './Plaza'
import { Props } from './Props'
import { SummerShore } from './SummerShore'
import { VrmSculpturePreloader } from './VrmSculpturePreloader'

export function MuseumWorld() {
  const season = getMuseumSeason()
  const isSummer = season === 'summer'

  return (
    <group>
      <VrmSculpturePreloader />
      {isSummer ? <SummerShore /> : (
        <>
          <Ocean />
          <Ground />
        </>
      )}
      <Plaza />
      <Buildings />
      <Props />
      <MuseumSeasonDecor />
    </group>
  )
}
