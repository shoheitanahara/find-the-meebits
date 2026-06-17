import { Buildings } from './Buildings'
import { Ground } from './Ground'
import { Ocean } from './Ocean'
import { Plaza } from './Plaza'
import { Props } from './Props'

export function WorldRoot() {
  return (
    <group>
      <Ocean />
      <Ground />
      <Plaza />
      <Buildings />
      <Props />
    </group>
  )
}
