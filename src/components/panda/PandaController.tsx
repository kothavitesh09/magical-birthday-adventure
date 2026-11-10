"use client";

import { useBirthdayStore } from "@/store/birthdayStore";
import { transientDurations } from "@/store/birthdayStore";
import { PandaCharacter } from "@/components/panda/PandaCharacter";
import { useEffect } from "react";

/** Keeps the current mood as the single source of truth for the replaceable character view. */
export function PandaController() {
  const animation = useBirthdayStore((state) => state.animation);
  const transitionId = useBirthdayStore((state) => state.transitionId);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const reducedMotion = useBirthdayStore((state) => state.reducedMotion);
  const paused = useBirthdayStore((state) => state.paused);

  useEffect(() => {
    const duration = transientDurations[animation];
    if (!duration || paused) return;
    const currentTransition = transitionId;
    const timeout = window.setTimeout(() => {
      if (useBirthdayStore.getState().transitionId === currentTransition) playAnimation("idle", true);
    }, duration);
    return () => window.clearTimeout(timeout);
  }, [animation, transitionId, playAnimation, paused]);

  return <PandaCharacter animation={reducedMotion && animation !== "idle" ? "idle" : animation} reducedMotion={reducedMotion} />;
}
