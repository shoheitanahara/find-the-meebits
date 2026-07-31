import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'
import { ui } from '../i18n/ui'
import { getParkNpcById } from './parkNpcRegistry'
import { useTopStore } from './topStore'

/** PC: 近づいたときに E で話せる／読めるプロンプト。 */
export function ParkInteractionPrompt() {
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const nearestAboutBoard = useTopStore((state) => state.nearestAboutBoard)
  const aboutBrowserOpen = useTopStore((state) => state.aboutBrowserOpen)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)
  const t = ui()

  if (isDialogueOpen || aboutBrowserOpen) return null

  if (nearestAboutBoard) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 hidden justify-center lg:flex">
        <div className="rounded-full border border-[#5ce0ff]/45 bg-[#080912]/85 px-5 py-2 text-sm font-bold text-[#dff8ff] shadow-xl backdrop-blur-md">
          {t.pressEReadAbout}
        </div>
      </div>
    )
  }

  if (!nearestNpcId) return null
  if (!getParkNpcById(nearestNpcId)) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 hidden justify-center lg:flex">
      <div className="rounded-full border border-[#d4b46a]/45 bg-[#080912]/85 px-5 py-2 text-sm font-bold text-[#f4ead2] shadow-xl backdrop-blur-md">
        {t.pressEInspect}
      </div>
    </div>
  )
}
