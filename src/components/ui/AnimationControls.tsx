"use client";

import { useState } from "react";
import { useBirthdayStore } from "@/store/birthdayStore";
import type { AnimationCategory, AnimationOption, PandaExpression } from "@/types/panda";

const categories: AnimationCategory[] = ["Everyday", "Emotions", "Full body", "Birthday"];
const options: AnimationOption[] = [
  { id: "idle", label: "Breathe", icon: "~", category: "Everyday" },
  { id: "look_left", label: "Look left", icon: "←", category: "Everyday" },
  { id: "look_right", label: "Look right", icon: "→", category: "Everyday" },
  { id: "look_up", label: "Look up", icon: "↑", category: "Everyday" },
  { id: "head_tilt", label: "Head tilt", icon: "⌁", category: "Everyday" },
  { id: "sway", label: "Sway", icon: "〰", category: "Everyday" },
  { id: "sleep", label: "Sleepy", icon: "☾", category: "Everyday" },
  { id: "walk", label: "Walk", icon: "⌁", category: "Everyday" },
  { id: "wave", label: "Wave", icon: "✋", category: "Emotions" },
  { id: "happy", label: "Happy", icon: "☀", category: "Emotions" },
  { id: "blush", label: "Blush", icon: "♡", category: "Emotions" },
  { id: "surprise", label: "Surprised", icon: "!", category: "Emotions" },
  { id: "shy", label: "Shy", icon: "♡", category: "Emotions" },
  { id: "heart_holding", label: "Heart hug", icon: "♥", category: "Emotions" },
  { id: "clap", label: "Clap", icon: "✧", category: "Emotions" },
  { id: "happy_walk", label: "Happy walk", icon: "♪", category: "Full body" },
  { id: "run", label: "Run", icon: ">", category: "Full body" },
  { id: "jump", label: "Jump", icon: "↑", category: "Full body" },
  { id: "sit", label: "Sit", icon: "♡", category: "Full body" },
  { id: "stand", label: "Stand up", icon: "↟", category: "Full body" },
  { id: "celebrate", label: "Dance", icon: "✦", category: "Full body" },
  { id: "spin", label: "Spin", icon: "⟳", category: "Full body" },
  { id: "hop", label: "Hop", icon: "✧", category: "Full body" },
  { id: "peek_door", label: "Peek out", icon: "◧", category: "Birthday" },
  { id: "present_envelope", label: "Present a note", icon: "✉", category: "Birthday" },
  { id: "hold_letter", label: "Hold a letter", icon: "▱", category: "Birthday" },
  { id: "look_cake", label: "See the cake", icon: "♧", category: "Birthday" },
  { id: "make_wish", label: "Make a wish", icon: "✧", category: "Birthday" },
  { id: "join_paws", label: "Paws together", icon: "♡", category: "Birthday" },
  { id: "blow_candles", label: "Blow candles", icon: "♨", category: "Birthday" },
  { id: "gift_pop", label: "Gift box pop", icon: "▣", category: "Birthday" },
  { id: "raise_paws", label: "Paws up", icon: "↑", category: "Birthday" },
  { id: "hold_heart", label: "Hold a heart", icon: "♥", category: "Birthday" },
  { id: "step_out", label: "Step through door", icon: "⇥", category: "Birthday" },
  { id: "look_meter", label: "See the meter", icon: "◉", category: "Birthday" },
  { id: "present_doors", label: "Present doors", icon: "♧", category: "Birthday" },
  { id: "look_door_left", label: "Look at left door", icon: "←", category: "Birthday" },
  { id: "look_door_right", label: "Look at right door", icon: "→", category: "Birthday" },
  { id: "cover_cheeks", label: "Cover cheeks", icon: "♡", category: "Birthday" },
  { id: "cover_eyes", label: "Hide eyes", icon: "◒", category: "Birthday" },
  { id: "hide_box", label: "Hide in gift", icon: "▣", category: "Birthday" },
  { id: "birthday_finale", label: "Finale dance", icon: "✦", category: "Birthday" },
  { id: "paw_heart", label: "Paw over heart", icon: "♥", category: "Birthday" },
  { id: "point", label: "Point it out", icon: "☞", category: "Birthday" },
];

const expressions: { id: PandaExpression; label: string; symbol: string }[] = [
  { id: "neutral", label: "Soft", symbol: "◡" }, { id: "happy", label: "Happy", symbol: "⌣" },
  { id: "sad", label: "Sad", symbol: "⌢" }, { id: "surprised", label: "Oh!", symbol: "◯" },
  { id: "curious", label: "Curious", symbol: "◔" }, { id: "sleepy", label: "Sleepy", symbol: "﹏" },
  { id: "shy", label: "Shy", symbol: "˘" }, { id: "blushing", label: "Blush", symbol: "♡" },
  { id: "excited", label: "Excited", symbol: "✦" },
  { id: "proud", label: "Proud", symbol: "★" }, { id: "affectionate", label: "Loving", symbol: "♥" },
  { id: "embarrassed", label: "Oops", symbol: "♡" },
];

export function AnimationControls() {
  const [category, setCategory] = useState<AnimationCategory>("Everyday");
  const active = useBirthdayStore((state) => state.animation);
  const expression = useBirthdayStore((state) => state.expression);
  const paused = useBirthdayStore((state) => state.paused);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const setAnimation = useBirthdayStore((state) => state.setAnimation);
  const setExpression = useBirthdayStore((state) => state.setExpression);
  const setPaused = useBirthdayStore((state) => state.setPaused);
  const current = options.find((item) => item.id === active)?.label ?? "Breathe";

  return <>
    <div className="animation-status"><span className={`status-pulse ${paused ? "is-paused" : ""}`} /><span>{paused ? "PAUSED" : "NOW PLAYING"}</span><strong>{current}</strong><button onClick={() => setPaused(!paused)} aria-label={paused ? "Resume animation" : "Pause animation"}>{paused ? "▶" : "Ⅱ"}</button><button onClick={() => { setPaused(false); setAnimation("idle"); setExpression("neutral"); }} aria-label="Reset panda to idle">↺</button></div>
    <div className="animation-tabs" role="tablist" aria-label="Animation categories">
      {categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <div className="mood-grid animation-grid" role="group" aria-label={`${category} panda animations`}>
      {options.filter((item) => item.category === category).map((option) => <button key={option.id} className={`mood-button ${active === option.id ? "is-active" : ""}`} onClick={() => { setPaused(false); playAnimation(option.id); }} aria-pressed={active === option.id}>
        <span className="mood-icon" aria-hidden="true">{option.icon}</span><span className="mood-label">{option.label}</span>
      </button>)}
    </div>
    <div className="expression-test"><div className="expression-label"><span>FACE EXPRESSIONS</span><span>Choose a look</span></div>
      <div className="expression-row" role="group" aria-label="Expression testing">
        {expressions.map((item) => <button key={item.id} className={expression === item.id ? "expression-active" : ""} onClick={() => { setPaused(false); setExpression(item.id); }} aria-pressed={expression === item.id} aria-label={`${item.label} expression`}><span>{item.symbol}</span><small>{item.label}</small></button>)}
      </div>
    </div>
  </>;
}
