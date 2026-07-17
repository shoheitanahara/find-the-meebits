const STORY_INTRO_SESSION_KEY = 'meebits-story-intro-seen'

export function hasSeenStoryIntro(): boolean {
  try {
    return sessionStorage.getItem(STORY_INTRO_SESSION_KEY) === '1'
  } catch {
    return true
  }
}

export function markStoryIntroSeen(): void {
  try {
    sessionStorage.setItem(STORY_INTRO_SESSION_KEY, '1')
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}
