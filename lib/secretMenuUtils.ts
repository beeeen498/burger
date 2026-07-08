// ── localStorage keys ─────────────────────────────────
const LS_SECRET_UNLOCKED = "secretMenu_unlocked"
const LS_UNLOCK_TIME = "secretMenu_unlockedAt"
// const ACCESS_DURATION = 24 * 60 * 60 * 1000
const ACCESS_DURATION = 1 * 1000

// ── Check if secret menu is currently active ──────────
export function isSecretMenuActive(): boolean {
  const unlocked = localStorage.getItem(LS_SECRET_UNLOCKED) === "yes"
  const unlockedAt = localStorage.getItem(LS_UNLOCK_TIME)

  if (!unlocked || !unlockedAt) return false

  const expiresAt = new Date(unlockedAt).getTime() + ACCESS_DURATION
  if (Date.now() >= expiresAt) {
    // ── Timer expired — clean up ──
    localStorage.removeItem(LS_SECRET_UNLOCKED)
    localStorage.removeItem(LS_UNLOCK_TIME)
    return false
  }

  return true
}