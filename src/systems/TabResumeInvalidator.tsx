import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/** タブ復帰直後に R3F のレンダーループを即キックする */
export function TabResumeInvalidator() {
  const invalidate = useThree((state) => state.invalidate)
  const clock = useThree((state) => state.clock)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const kick = () => {
      // 非表示中に溜まった clock delta を捨ててからループ再開
      clock.oldTime = performance.now()
      invalidate()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') kick()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pageshow', kick)
    window.addEventListener('focus', kick)
    gl.domElement.addEventListener('webglcontextrestored', kick)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', kick)
      window.removeEventListener('focus', kick)
      gl.domElement.removeEventListener('webglcontextrestored', kick)
    }
  }, [clock, gl, invalidate])

  return null
}
