import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'
import { ui } from '../i18n/ui'
import { getParkNpcById } from './parkNpcRegistry'

/** PC: 近づいたときに E で話せるプロンプト。 */
export function ParkInteractionPrompt() {
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)

  if (!nearestNpcId || isDialogueOpen) return null
  if (!getParkNpcById(nearestNpcId)) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 hidden justify-center lg:flex">
      <div className="rounded-full border border-[#d4b46a]/45 bg-[#080912]/85 px-5 py-2 text-sm font-bold text-[#f4ead2] shadow-xl backdrop-blur-md">
        {ui().pressEInspect}
      </div>
    </div>
  )
}
