import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/** タブ復帰直後に R3F のレンダーループを即キックする */
export function TabResumeInvalidator() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        invalidate()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [invalidate])

  return null
}
