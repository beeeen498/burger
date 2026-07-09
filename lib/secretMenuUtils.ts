const LS_SECRET_UNLOCKED = "secretMenu_unlocked"
const LS_UNLOCK_TIME = "secretMenu_unlockedAt"
const LS_BURGER_CLICKED = "secretMenu_burgerClicked"
const LS_WHISPER_DONE = "secretMenu_whisperDone"
const LS_DISMISS_COUNT = "secretMenu_dismissCount"
export const ACCESS_DURATION = 1 * 1000 // 4 hours

// ── Check if secret menu is currently active ──────────
export function isSecretMenuActive(): boolean {
  const unlocked = localStorage.getItem(LS_SECRET_UNLOCKED) === "yes"
  const unlockedAt = localStorage.getItem(LS_UNLOCK_TIME)

  if (!unlocked || !unlockedAt) return false

  const expiresAt = new Date(unlockedAt).getTime() + ACCESS_DURATION
  if (Date.now() >= expiresAt) {
    // ── Timer expired — clean up everything ──
    localStorage.removeItem(LS_SECRET_UNLOCKED)
    localStorage.removeItem(LS_UNLOCK_TIME)
    localStorage.removeItem(LS_BURGER_CLICKED)
    localStorage.removeItem(LS_WHISPER_DONE)
    localStorage.removeItem(LS_DISMISS_COUNT)
    return false
  }

  return true
}