// ── Hook for ingredient add/remove feedback ─────────────────────────
// Plays a pop sound and triggers a short vibration on add/remove

import { useRef } from "react";

export function useIngredientFeedback() {
  // ── Audio refs — preloaded so there's no delay on first play ───────
  const addSoundRef    = useRef<HTMLAudioElement | null>(null);
  const removeSoundRef = useRef<HTMLAudioElement | null>(null);

  // ── Lazy init — only create Audio in the browser, not on the server ─
  const getAddSound = () => {
    if (!addSoundRef.current) {
      addSoundRef.current = new Audio("/sounds/pop-add.mp3");
      addSoundRef.current.volume = 0.5;
    }
    return addSoundRef.current;
  };

  const getRemoveSound = () => {
    if (!removeSoundRef.current) {
      removeSoundRef.current = new Audio("/sounds/pop-remove.mp3");
      removeSoundRef.current.volume = 0.5;
    }
    return removeSoundRef.current;
  };

  // ── Play add feedback — high pop + short vibration ──────────────────
  const playAdd = () => {
    // reset and play so rapid clicks don't get blocked
    const sound = getAddSound();
    sound.currentTime = 0;
    sound.play().catch(() => {});

    // short vibration pulse — ignored on desktop and iOS
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // ── Play remove feedback — low pop + short vibration ────────────────
  const playRemove = () => {
    const sound = getRemoveSound();
    sound.currentTime = 0;
    sound.play().catch(() => {});

    if (navigator.vibrate) navigator.vibrate(20);
  };

  return { playAdd, playRemove };
}