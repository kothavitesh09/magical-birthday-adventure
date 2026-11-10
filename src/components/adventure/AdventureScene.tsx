"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Gift, Heart, Home, Sparkles, Star, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBirthdayStore } from "@/store/birthdayStore";
import { birthdayLetter } from "@/data/birthdayLetter";
import type { StoryScene } from "@/components/adventure/StoryWorld";
import { usePageVisible, useReducedMotionPreference } from "@/hooks/motion";
import { transitionTo } from "@/utils/sceneTransition";
import { BIRTHDAY_GIRL_NAME } from "@/data/birthdayGirl";
import type { ReactNode } from "react";
import FinaleExperience from "@/components/adventure/FinaleExperience";
import finaleStyles from "@/components/adventure/FinaleExperience.module.css";

const StoryWorld = dynamic(() => import("@/components/adventure/StoryWorld"), {
  ssr: false,
  loading: () => <div className="story-loading"><Sparkles size={34} /><span>Gathering a little birthday magic…</span></div>,
});

const story = {
  3: { kicker: "A LITTLE REMINDER", title: <>A Little Something Special for <span className="birthday-name">{BIRTHDAY_GIRL_NAME}</span> 💕</>, subtitle: "Because someone as special as you deserves endless compliments!", action: "Discover What’s Behind the Doors" },
  4: { kicker: "A SECRET WORLD AWAITS", title: "Mystery Doors", subtitle: "Choose a door and uncover a special surprise! ♡", action: "Continue to Your Letter" },
  5: { kicker: "A LITTLE SOMETHING FROM THE HEART", title: <>A Letter Just for You, <span className="birthday-name">{BIRTHDAY_GIRL_NAME}</span> 💌</>, subtitle: "Some things are better expressed through words.", action: "Open the Letter" },
  6: { kicker: "A BIRTHDAY WISH JUST FOR YOU", title: <>Happy Birthday, <span className="birthday-name">{BIRTHDAY_GIRL_NAME}</span>! 🎂</>, subtitle: "Today is all about you! May your life always be filled with happiness, laughter, beautiful memories, and endless magical moments.", action: "Make a Wish!" },
  7: { kicker: "YOUR BIRTHDAY SURPRISE", title: "Happy Birthday!", subtitle: "May your life always be filled with beautiful moments, endless happiness, wonderful surprises, and countless reasons to smile.", action: "Experience Again" },
} satisfies Record<StoryScene, { kicker: string; title: ReactNode; subtitle: string; action: string }>;

const compliments = [
  { title: "Kind Heart", text: "Your kindness makes the world a little more beautiful.", icon: "♡" },
  { title: "Beautiful Smile", text: "Your smile has a magical way of making everything brighter.", icon: "✦" },
  { title: "Pure Sunshine", text: "You bring happiness into places without even trying.", icon: "☼" },
  { title: "Simply Perfect", text: "Never forget that you are wonderful exactly as you are.", icon: "♡" },
  { title: "Amazing Personality", text: "Your presence makes every moment more special.", icon: "✿" },
];

const doors = [
  { title: "Little Happiness", icon: Heart, revealTitle: "A heartful of happiness", reveal: "Keep close the little moments that make your heart feel warm." },
  { title: "Secret Wishes", icon: Star, revealTitle: "A wish among the stars", reveal: "May the quiet wish you hold find its way to the brightest star." },
  { title: "Mystery Surprise", icon: Gift, revealTitle: "A little golden surprise", reveal: "The best surprises are wrapped in love and waiting to unfold." },
];

const nextPaths: Record<StoryScene, string> = { 3: "/doors", 4: "/letter", 5: "/wish", 6: "/finale", 7: "/" };

export default function AdventureScene({ scene }: { scene: StoryScene }) {
  const router = useRouter();
  const reducedMotion = useReducedMotionPreference();
  const pageVisible = usePageVisible();
  const sceneRoot = useRef<HTMLElement>(null);
  const [revealedCompliments, setRevealedCompliments] = useState<number[]>([]);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [exploredDoors, setExploredDoors] = useState<number[]>([]);
  const [hoveredDoor, setHoveredDoor] = useState<number | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterComplete, setLetterComplete] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const [wishPreparing, setWishPreparing] = useState(false);
  const [blowingWish, setBlowingWish] = useState(false);
  const [candlesOut, setCandlesOut] = useState(false);
  const [wishComplete, setWishComplete] = useState(false);
  const [finaleStage, setFinaleStage] = useState<"waiting" | "opening" | "celebrating" | "replaying">("waiting");
  const [finaleCycle, setFinaleCycle] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const soundContext = useRef<AudioContext | null>(null);
  const actionLock = useRef(false);
  const blowTimer = useRef<number | null>(null);
  const complimentReturnTimer = useRef<number | null>(null);
  const letterTimer = useRef<number | null>(null);
  const finaleTimers = useRef<number[]>([]);
  const finaleRevealRef = useRef<((withSound: boolean) => void) | null>(null);
  const finaleIntroStarted = useRef(false);
  const exploredDoorsRef = useRef<number[]>([]);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const setExpression = useBirthdayStore((state) => state.setExpression);
  const setJourneyStep = useBirthdayStore((state) => state.setJourneyStep);
  const setReducedMotion = useBirthdayStore((state) => state.setReducedMotion);
  const meta = story[scene];

  useEffect(() => {
    setReducedMotion(reducedMotion);
    try {
      const saved = Number(window.localStorage.getItem("magical-birthday-step") ?? 0);
      setJourneyStep(Math.max(saved, scene));
    } catch { setJourneyStep(scene); }
    if (scene === 4) {
      try {
        const restored: unknown = JSON.parse(window.localStorage.getItem("birthday-door-explored") ?? "[]");
        const valid = Array.isArray(restored) ? [...new Set(restored.filter((door): door is number => Number.isInteger(door) && door >= 0 && door < doors.length))] : [];
        exploredDoorsRef.current = valid;
        window.queueMicrotask(() => setExploredDoors(valid));
      } catch { exploredDoorsRef.current = []; }
      playAnimation("wave", true); setExpression("happy");
    }
    else if (scene === 3) { playAnimation("cover_cheeks", true); setExpression("happy"); }
    else if (scene === 5) { playAnimation("hold_letter", true); setExpression("affectionate"); }
    else if (scene === 6) { playAnimation("join_paws", true); setExpression("happy"); }
    else if (scene === 7) { playAnimation("look_cake", true); setExpression("curious"); }
    return () => {
      if (blowTimer.current !== null) window.clearTimeout(blowTimer.current);
      if (complimentReturnTimer.current !== null) window.clearTimeout(complimentReturnTimer.current);
      if (letterTimer.current !== null) window.clearTimeout(letterTimer.current);
      finaleTimers.current.forEach(window.clearTimeout);
      void soundContext.current?.close().catch(() => undefined);
      soundContext.current = null;
    };
  }, [playAnimation, reducedMotion, scene, setExpression, setJourneyStep, setReducedMotion]);

  useEffect(() => {
    if (!sceneRoot.current || reducedMotion) return;
    const context = gsap.context(() => {
      const targets = scene === 3 ? ".compliment-card"
        : scene === 4 ? ".door-choice-label"
          : scene === 5 ? ".letter-panel"
            : scene === 6 ? ".story-heading, .wish-note"
              : ".finale-copy";
      const finaleTargets = scene === 7 ? ", .story-scene-7 .story-action-wrap" : "";
      gsap.fromTo(`${targets}${finaleTargets}`, { autoAlpha: 0, filter: "blur(5px)" }, {
        autoAlpha: 1, filter: "blur(0px)", duration: 0.72, stagger: scene === 3 ? 0.12 : 0.08,
        ease: "power2.out", clearProps: "filter,visibility,opacity",
      });
    }, sceneRoot);
    return () => context.revert();
  }, [reducedMotion, scene]);

  const chime = useCallback((final = false) => {
    if (!soundOn) return;
    try {
      soundContext.current ??= new window.AudioContext();
      const context = soundContext.current;
      if (context.state === "suspended") void context.resume().catch(() => undefined);
      [587, 740, ...(final ? [988] : [])].forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime + index * 0.1;
        oscillator.type = "sine"; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.035, start + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36);
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + 0.38);
      });
    } catch { /* Sound is decorative; the scene remains interactive if audio is blocked. */ }
  }, [soundOn]);

  const chooseCompliment = (index: number) => {
    if (revealedCompliments.includes(index)) return;
    setRevealedCompliments((current) => current.includes(index) ? current : [...current, index]);
    playAnimation(index % 2 ? "blush" : "happy", true);
    setExpression(index % 2 ? "blushing" : "happy");
    if (complimentReturnTimer.current !== null) window.clearTimeout(complimentReturnTimer.current);
    complimentReturnTimer.current = window.setTimeout(() => {
      playAnimation("cover_cheeks", true);
      setExpression("happy");
    }, 2450);
    chime();
  };

  const chooseDoor = (index: number) => {
    setSelectedDoor(index);
    const nextExplored = [...new Set([...exploredDoorsRef.current, index])].sort((a, b) => a - b);
    exploredDoorsRef.current = nextExplored;
    setExploredDoors(nextExplored);
    try {
      window.localStorage.setItem("birthday-door-explored", JSON.stringify(nextExplored));
      window.localStorage.setItem("birthday-door-selected", String(index));
    } catch { /* Keep current door progress in memory if storage is disabled. */ }
    playAnimation(index === 0 ? "heart_holding" : index === 1 ? "look_up" : "surprise", true);
    setExpression(index === 0 ? "affectionate" : index === 1 ? "curious" : "surprised");
    chime();
  };

  const openLetter = () => {
    if (actionLock.current || letterOpen) return;
    actionLock.current = true;
    setLetterOpen(true);
    playAnimation("present_envelope", true);
    setExpression("affectionate");
    chime(true);
    letterTimer.current = window.setTimeout(() => {
      setLetterComplete(true);
      playAnimation("hold_letter", true);
      setExpression("affectionate");
      actionLock.current = false;
    }, reducedMotion ? 0 : 1900);
  };

  const makeWish = () => {
    if (actionLock.current || wishMade) return;
    actionLock.current = true;
    setWishMade(true);
    setWishPreparing(true);
    playAnimation("make_wish", true);
    setExpression("sleepy");
    chime();
    blowTimer.current = window.setTimeout(() => {
      blowTimer.current = null;
      setWishPreparing(false);
      actionLock.current = false;
    }, reducedMotion ? 0 : 1650);
  };

  const blowCandles = () => {
    if (actionLock.current || !wishMade || blowingWish || candlesOut) return;
    actionLock.current = true;
    setBlowingWish(true);
    playAnimation("blow_candles", true);
    setExpression("neutral");
    chime();
    blowTimer.current = window.setTimeout(() => {
      setCandlesOut(true);
      setBlowingWish(false);
      blowTimer.current = window.setTimeout(() => {
        blowTimer.current = null;
        setWishComplete(true);
        playAnimation("celebrate", true);
        setExpression("excited");
        actionLock.current = false;
        chime(true);
      }, reducedMotion ? 0 : 1050);
    }, reducedMotion ? 0 : 520);
  };

  const clearFinaleTimers = useCallback(() => {
    finaleTimers.current.forEach(window.clearTimeout);
    finaleTimers.current = [];
  }, []);

  const playFinaleReveal = useCallback((withSound = true) => {
    if (actionLock.current) return;
    actionLock.current = true;
    clearFinaleTimers();
    setFinaleStage("opening");
    playAnimation("gift_pop", true);
    setExpression("surprised");
    if (withSound) chime();
    finaleTimers.current.push(window.setTimeout(() => {
      playAnimation("jump", true);
      setExpression("excited");
    }, reducedMotion ? 0 : 760));
    finaleTimers.current.push(window.setTimeout(() => {
      setFinaleStage("celebrating");
      playAnimation("birthday_finale", true);
      setExpression("excited");
      actionLock.current = false;
      chime(true);
    }, reducedMotion ? 0 : 1750));
  }, [chime, clearFinaleTimers, playAnimation, reducedMotion, setExpression]);

  useEffect(() => {
    finaleRevealRef.current = playFinaleReveal;
  }, [playFinaleReveal]);

  useEffect(() => {
    if (scene !== 7 || finaleIntroStarted.current) return;
    const timer = window.setTimeout(() => {
      finaleIntroStarted.current = true;
      finaleRevealRef.current?.(false);
    }, reducedMotion ? 0 : 520);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, scene]);

  const replayFinale = () => {
    if (actionLock.current) return;
    actionLock.current = true;
    clearFinaleTimers();
    setFinaleStage("replaying");
    playAnimation("hide_box", true);
    setExpression("shy");
    finaleTimers.current.push(window.setTimeout(() => {
      setFinaleCycle((cycle) => cycle + 1);
      setFinaleStage("opening");
      playAnimation("gift_pop", true);
      setExpression("surprised");
      chime();
      finaleTimers.current.push(window.setTimeout(() => {
        playAnimation("jump", true);
        setExpression("excited");
      }, reducedMotion ? 0 : 760));
      finaleTimers.current.push(window.setTimeout(() => {
        setFinaleStage("celebrating");
        playAnimation("birthday_finale", true);
        setExpression("excited");
        actionLock.current = false;
        chime(true);
      }, reducedMotion ? 0 : 1750));
    }, reducedMotion ? 0 : 750));
  };

  const restartAdventure = () => {
    if (actionLock.current) return;
    actionLock.current = true;
    setJourneyStep(0);
    try {
      window.localStorage.setItem("birthday-cuteness-score", "0");
      window.localStorage.setItem("magical-birthday-step", "0");
      window.localStorage.removeItem("birthday-door-explored");
      window.localStorage.removeItem("birthday-door-selected");
      window.localStorage.removeItem("abhinaya-finale-treasures-v1");
      window.localStorage.removeItem("abhinaya-finale-wish-v1");
    } catch { /* Route navigation still works if local storage is unavailable. */ }
    playAnimation("idle", true);
    setExpression("neutral");
    chime(true);
    transitionTo(router, "/", reducedMotion);
  };

  const advance = () => {
    if (actionLock.current) return;
    if (scene === 4 && selectedDoor === null) {
      const nextDoor = doors.findIndex((_, index) => !exploredDoorsRef.current.includes(index));
      playAnimation("present_doors", true);
      setExpression("curious");
      document.querySelector<HTMLButtonElement>(`[data-door-index="${nextDoor}"]`)?.focus();
      return;
    }
    if (scene === 5 && !letterComplete) { openLetter(); return; }
    if (scene === 6 && !wishMade) { makeWish(); return; }
    if (scene === 6 && !candlesOut) { blowCandles(); return; }
    if (scene === 6 && !wishComplete) return;
    actionLock.current = true;
    setJourneyStep(scene === 7 ? 0 : scene + 1);
    if (scene === 7) {
      try { window.localStorage.setItem("birthday-cuteness-score", "0"); } catch { /* Start over in memory if storage is blocked. */ }
    }
    chime(true);
    transitionTo(router, nextPaths[scene], reducedMotion);
  };

  const allDoorsExplored = exploredDoors.length === doors.length;
  const canContinue = scene === 4 ? selectedDoor !== null
      : scene === 5 ? letterComplete
      : scene === 6 ? wishComplete
          : true;
  const actionLabel = scene === 3 ? "Discover What’s Behind the Doors"
    : scene === 4 ? selectedDoor !== null ? "Continue to Your Letter" : "Open a Door! ✨"
      : scene === 5 ? "Continue to Your Special Moment"
        : scene === 6 ? "Continue to the Grand Finale ✨"
          : "Experience Again";

  return <main ref={sceneRoot} className={`story-page story-scene-${scene}${scene === 7 ? ` ${finaleStyles.finaleStoryPage}` : ""}`}>
    <div className="story-canvas"><StoryWorld scene={scene} opened={letterOpen} wishMade={wishMade} candlesOut={candlesOut} wishComplete={wishComplete} finaleStage={finaleStage} finaleCycle={finaleCycle} pageVisible={pageVisible} selectedDoor={selectedDoor} exploredDoors={exploredDoors} hoveredDoor={hoveredDoor} /></div>
    <div className="story-vignette" aria-hidden="true" />
    <div className="story-progress" aria-label={`Page ${scene + 1} of 8`}>{scene === 4 && <Home size={15} aria-hidden="true" />}<span>{scene === 4 ? "5" : String(scene + 1).padStart(2, "0")}</span><i />08</div>
    <button className="story-sound" type="button" onClick={() => setSoundOn((current) => !current)} aria-label={soundOn ? "Mute birthday scene sounds" : "Enable birthday scene sounds"}>
      {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </button>

    {scene === 7 && <FinaleExperience
      reducedMotion={reducedMotion}
      onCelebrate={replayFinale}
      onReplay={restartAdventure}
      onPandaReact={() => { playAnimation("wave", true); setExpression("happy"); }}
    />}

    {scene !== 7 ? <header className="story-heading">
      <div className="story-kicker">{meta.kicker}</div>
      <h1>{meta.title}</h1>
      <p>{meta.subtitle}</p>
    </header> : null}

    {scene === 3 && <section className="compliment-cards" aria-label="A few lovely reminders">
      {compliments.map((item, index) => <button
        key={item.title}
        className={`compliment-card compliment-card-${index + 1}${revealedCompliments.includes(index) ? " compliment-glow" : ""}`}
        type="button" aria-pressed={revealedCompliments.includes(index)} onClick={() => chooseCompliment(index)}
      ><span>{item.icon}</span><b>{item.title}</b><small>{item.text}</small></button>)}
      <div className="compliment-ribbon"><Heart size={15} fill="currentColor" /> You deserve all these compliments! <Heart size={15} fill="currentColor" /></div>
    </section>}

    {scene === 4 && <section className="door-choices" aria-label="Choose a secret door">
      {doors.map((door, index) => {
        const isExplored = exploredDoors.includes(index);
        return <button key={door.title} data-door-index={index} className={`door-choice door-choice-${index + 1}${selectedDoor === index ? " door-selected" : ""}${isExplored ? " door-explored" : ""}`} type="button" aria-pressed={selectedDoor === index} aria-label={`${door.title}${isExplored ? ", opened" : ", open door"}`} onMouseEnter={() => setHoveredDoor(index)} onMouseLeave={() => setHoveredDoor(null)} onFocus={() => setHoveredDoor(index)} onBlur={() => setHoveredDoor(null)} onClick={() => chooseDoor(index)}>
          <span className="door-choice-label"><span>{door.title}</span>{isExplored && <Check size={13} />}</span><span className="door-open-hint">{isExplored ? "Secret discovered" : "Open this door"}</span>
        </button>;
      })}
    </section>}
    {scene === 4 && selectedDoor !== null && <div className={`door-reveal door-reveal-${selectedDoor}`} role="status">
      {(() => { const RevealIcon = doors[selectedDoor].icon; return <RevealIcon size={21} fill={selectedDoor === 0 ? "currentColor" : "none"} />; })()}
      <span><strong>{allDoorsExplored ? "All three secrets are yours!" : doors[selectedDoor].revealTitle}</strong><small>{doors[selectedDoor].reveal}</small></span>
    </div>}

    {scene === 5 && <>
      <aside className={`letter-panel${letterOpen ? " letter-open" : ""}`} aria-live="polite">
        {!letterOpen ? <><span className="letter-love">Made with lots of love ♡</span><Heart className="letter-card-heart" size={18} fill="currentColor" /></> : <>
          <h2>{birthdayLetter.heading}</h2>
          <h3>{birthdayLetter.greeting}</h3>
          {birthdayLetter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <span>{birthdayLetter.signoff}</span>
        </>}
      </aside>
    </>}

    {scene === 6 && <div className={`wish-note${wishComplete ? " wish-complete" : ""}`} aria-live="polite">
      {wishComplete ? "Your wish has been sent to the stars! 💗" : candlesOut ? "Your wish is on its way to the stars…" : blowingWish ? "A breath of magic is blowing out the candles…" : wishPreparing ? "Keep your wish close while the candles glow." : wishMade ? "Your wish is safe in your heart. When you’re ready, blow out the candles." : "Close your eyes and hold a little wish in your heart."}
    </div>}

    {scene !== 7 && <div className="story-action-wrap">
    {scene === 5 && !letterOpen ? <button className="story-action" type="button" onClick={openLetter}><Heart size={16} fill="currentColor" /> Open the Letter <ArrowRight size={16} /></button>
      : scene === 5 && !letterComplete ? <button className="story-action" type="button" disabled><Sparkles size={16} /> Unfolding your letter…</button>
      : scene === 6 && !wishMade ? <button className="story-action" type="button" onClick={makeWish}><Sparkles size={16} /> Make a Wish! <Sparkles size={16} /></button>
      : scene === 6 && wishMade && wishPreparing ? <button className="story-action" type="button" disabled><Sparkles size={16} /> Hold Your Wish…</button>
        : scene === 6 && wishMade && !blowingWish && !candlesOut ? <button className="story-action" type="button" onClick={blowCandles}><Heart size={16} fill="currentColor" /> Blow Out the Candles</button>
          : scene === 6 && blowingWish ? <button className="story-action" type="button" disabled><Sparkles size={16} /> Blowing the Candles…</button>
            : scene === 6 && candlesOut && !wishComplete ? <button className="story-action" type="button" disabled><Sparkles size={16} /> Sending Your Wish…</button>
          : <button className={`story-action${scene === 4 ? " door-main-action" : ""}`} type="button" onClick={advance} disabled={!canContinue && scene !== 4}>
            <>{actionLabel} <ArrowRight size={16} /></>
          </button>}
      {scene === 3 && revealedCompliments.length < compliments.length && <small className="story-hint">Tap each card to collect a little kindness</small>}
      {scene === 4 && selectedDoor === null && <small className="story-hint">Choose a door to discover what’s waiting</small>}
      {scene === 5 && !letterOpen && <small className="story-hint">A little message is waiting just for you</small>}
    </div>}
    {scene !== 7 && <div className="story-footer" aria-hidden="true">A little more birthday magic is waiting</div>}
  </main>;
}
