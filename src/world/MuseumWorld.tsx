import { Buildings } from './Buildings'
import { Ground } from './Ground'
import { Ocean } from './Ocean'
import { Plaza } from './Plaza'
import { Props } from './Props'
import { VrmSculpturePreloader } from './VrmSculpturePreloader'

export function MuseumWorld() {
  return (
    <group>
      <VrmSculpturePreloader />
      <Ocean />
      <Ground />
      <Plaza />
      <Buildings />
      <Props />
    </group>
  )
}
