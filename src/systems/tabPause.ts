let tabHiddenPausedMs = 0
let tabHiddenSince: number | null = null
let tabResumeGeneration = 0
let suppressResumeDeltaUntil = 0

const MAX_RESUME_FRAME_DELTA = 0.05
const RESUME_DELTA_SUPPRESS_MS = 80

export function resetTabPauseClock() {
  tabHiddenPausedMs = 0
  tabHiddenSince = null
  suppressResumeDeltaUntil = 0
}

export function noteTabHidden() {
  if (tabHiddenSince === null) {
    tabHiddenSince = Date.now()
  }
}

export function noteTabVisible() {
  if (tabHiddenSince === null) {
    return
  }

  tabHiddenPausedMs += Date.now() - tabHiddenSince
  tabHiddenSince = null
  tabResumeGeneration += 1
  suppressResumeDeltaUntil = performance.now() + RESUME_DELTA_SUPPRESS_MS
}

export function getTabResumeGeneration() {
  return tabResumeGeneration
}

/** タブ復帰直後の巨大 delta だけ抑える（常時クランプはしない） */
export function clampFrameDeltaAfterTabResume(delta: number) {
  if (performance.now() >= suppressResumeDeltaUntil) {
    return delta
  }

  return Math.min(delta, MAX_RESUME_FRAME_DELTA)
}

export function getTabPausedMs() {
  const activeHiddenMs = tabHiddenSince === null ? 0 : Date.now() - tabHiddenSince
  return tabHiddenPausedMs + activeHiddenMs
}

export function isTabHidden() {
  return tabHiddenSince !== null
}

export function syncTabPauseFromVisibility() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.visibilityState === 'hidden') {
    noteTabHidden()
  } else {
    noteTabVisible()
  }
}
