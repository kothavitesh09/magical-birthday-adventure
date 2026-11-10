import { create } from "zustand";
import type { PandaAnimation, PandaExpression } from "@/types/panda";

const priorities: Record<PandaAnimation, number> = {
  idle: 0, look_left: 1, look_right: 1, look_up: 1, head_tilt: 1, sway: 1,
  wave: 2, happy: 2, blush: 2, surprise: 3, shy: 2, heart_holding: 2, clap: 2, sleep: 2,
  walk: 2, happy_walk: 2, run: 3, jump: 3, sit: 2, stand: 2, celebrate: 3, spin: 3, hop: 3,
  peek_door: 2, present_envelope: 2, hold_letter: 2, look_cake: 1, make_wish: 3,
  join_paws: 2, blow_candles: 3, gift_pop: 3, raise_paws: 3, hold_heart: 2,
  step_out: 2, look_meter: 1, present_doors: 2, look_door_left: 1, look_door_right: 1,
  cover_cheeks: 2, cover_eyes: 2, hide_box: 2, birthday_finale: 3, paw_heart: 2, point: 2,
};

export const transientDurations: Partial<Record<PandaAnimation, number>> = {
  wave: 2600, happy: 2200, blush: 2300, surprise: 1500, shy: 2400, clap: 2300,
  walk: 3000, happy_walk: 3300, run: 2200, jump: 1800, stand: 1000, celebrate: 3400,
  spin: 1800, hop: 2200, peek_door: 2400, present_envelope: 2600,
  make_wish: 4000, blow_candles: 2500, gift_pop: 2000,
  raise_paws: 2200, hold_heart: 3000,
  step_out: 3200, look_meter: 2200, present_doors: 2800, look_door_left: 1800, look_door_right: 1800,
  cover_eyes: 2200, hide_box: 2600, birthday_finale: 4200, paw_heart: 2400, point: 2200,
};

const loops = new Set<PandaAnimation>(["idle", "look_left", "look_right", "look_up", "head_tilt", "sway", "sleep", "sit", "look_cake", "heart_holding", "look_meter", "look_door_left", "look_door_right", "cover_cheeks"]);

type BirthdayState = {
  animation: PandaAnimation;
  animationStartedAt: number;
  transitionId: number;
  expression: PandaExpression;
  cameraCommand: { type: "zoom_in" | "zoom_out" | "turn_left" | "turn_right"; id: number } | null;
  reducedMotion: boolean;
  paused: boolean;
  journeyStep: number;
  setAnimation: (animation: PandaAnimation) => void;
  playAnimation: (animation: PandaAnimation, force?: boolean) => void;
  setExpression: (expression: PandaExpression) => void;
  cameraAction: (type: "zoom_in" | "zoom_out" | "turn_left" | "turn_right") => void;
  setReducedMotion: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  setJourneyStep: (step: number) => void;
};

export const useBirthdayStore = create<BirthdayState>((set) => ({
  animation: "idle",
  animationStartedAt: Date.now(),
  transitionId: 0,
  expression: "neutral",
  cameraCommand: null,
  reducedMotion: false,
  paused: false,
  journeyStep: 0,
  setAnimation: (animation) => set((state) => ({ animation, animationStartedAt: Date.now(), transitionId: state.transitionId + 1 })),
  playAnimation: (animation, force = false) => set((state) => {
    if (!force && !loops.has(state.animation) && priorities[animation] < priorities[state.animation]) return state;
    return { animation, animationStartedAt: Date.now(), transitionId: state.transitionId + 1 };
  }),
  setExpression: (expression) => set({ expression }),
  cameraAction: (type) => set((state) => ({ cameraCommand: { type, id: (state.cameraCommand?.id ?? 0) + 1 } })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setPaused: (paused) => set({ paused }),
  setJourneyStep: (step) => {
    const journeyStep = Math.max(0, Math.min(7, Math.floor(step)));
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("magical-birthday-step", String(journeyStep)); } catch { /* Storage can be disabled in private browsing. */ }
    }
    set({ journeyStep });
  },
}));
