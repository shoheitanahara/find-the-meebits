const MAX_CONCURRENT_LOADS = 24

type PendingLoad<T> = {
  priority: number
  run: () => void
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

let activeLoads = 0
const pendingLoads: PendingLoad<unknown>[] = []

export function enqueueVrmLoad<T>(loader: () => Promise<T>, priority = 9999): Promise<T> {
  return new Promise((resolve, reject) => {
    pendingLoads.push({
      priority,
      resolve: resolve as (value: unknown) => void,
      reject,
      run: () => {
        activeLoads += 1

        loader()
          .then(resolve, reject)
          .finally(() => {
            activeLoads -= 1
            drainQueue()
          })
      },
    })

    pendingLoads.sort((left, right) => left.priority - right.priority)
    drainQueue()
  })
}

function drainQueue() {
  while (activeLoads < MAX_CONCURRENT_LOADS && pendingLoads.length > 0) {
    const nextLoad = pendingLoads.shift()
    nextLoad?.run()
  }
}
