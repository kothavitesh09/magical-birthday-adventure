"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBirthdayStore } from "@/store/birthdayStore";
import { usePageVisible, useReducedMotionPreference } from "@/hooks/motion";
import { transitionTo } from "@/utils/sceneTransition";
import { BIRTHDAY_GIRL_NAME } from "@/data/birthdayGirl";

const CutenessWorld = dynamic(() => import("@/components/scene2/CutenessWorld"), {
  ssr: false,
  loading: () => <div className="meter-loading"><span>✦</span><p>Warming up the cuteness scanner…</p></div>,
});

function chime(context: AudioContext, final = false) {
  const now = context.currentTime;
  [660, 880, ...(final ? [1108] : [])].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.055, now + index * 0.09 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.42);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.09);
    oscillator.stop(now + index * 0.09 + 0.44);
  });
}

export default function CutenessMeter() {
  const reducedMotion = useReducedMotionPreference();
  const pageVisible = usePageVisible();
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [complete, setComplete] = useState(false);
  const [celebrationDone, setCelebrationDone] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const lock = useRef(false);
  const scanTimer = useRef<number | null>(null);
  const celebrationTimeline = useRef<gsap.core.Timeline | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const setExpression = useBirthdayStore((state) => state.setExpression);
  const setJourneyStep = useBirthdayStore((state) => state.setJourneyStep);
  const setReducedMotion = useBirthdayStore((state) => state.setReducedMotion);

  useEffect(() => setReducedMotion(reducedMotion), [reducedMotion, setReducedMotion]);

  useEffect(() => {
    setJourneyStep(2);
    try {
      // Every visit begins with a fresh scan. Persisted scores are only useful
      // within a completed scan and must never skip the user's button click.
      window.localStorage.setItem("birthday-cuteness-score", "0");
    } catch { /* The in-memory meter still starts at zero if storage is blocked. */ }
    playAnimation("look_meter", true);
    setExpression("curious");
    return () => {
      if (scanTimer.current !== null) window.cancelAnimationFrame(scanTimer.current);
      celebrationTimeline.current?.kill();
      void audio.current?.close();
      audio.current = null;
    };
  }, [playAnimation, setExpression, setJourneyStep]);

  const sound = useCallback((final: boolean) => {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext;
      audio.current ??= new AudioContextClass();
      if (audio.current.state === "suspended") void audio.current.resume();
      chime(audio.current, final);
    } catch { /* Audio is an enhancement; the meter remains usable without it. */ }
  }, [soundOn]);

  const recordReading = useCallback((next: number) => {
    setValue(next);
    try { window.localStorage.setItem("birthday-cuteness-score", String(next)); } catch { /* The current scan still completes. */ }
    sound(next === 120);
    if (next === 20) { playAnimation("happy", true); setExpression("happy"); }
    else if (next === 40) { playAnimation("head_tilt", true); setExpression("curious"); }
    else if (next === 60) { playAnimation("happy", true); setExpression("happy"); }
    else if (next === 80) { playAnimation("hop", true); setExpression("excited"); }
    else if (next === 100) { playAnimation("blush", true); setExpression("blushing"); }
    else if (next === 120) {
      setComplete(true);
      setJourneyStep(3);
      if (reducedMotion) {
        setCelebrationDone(true);
        playAnimation("celebrate", true);
        setExpression("excited");
        return;
      }
      setExpression("surprised");
      playAnimation("surprise", true);
      celebrationTimeline.current?.kill();
      celebrationTimeline.current = gsap.timeline({ onComplete: () => setCelebrationDone(true) })
        .call(() => { playAnimation("hop", true); setExpression("excited"); }, [], 0.42)
        .call(() => playAnimation("clap", true), [], 1.35)
        .call(() => playAnimation("celebrate", true), [], 2.25)
        .call(() => undefined, [], 5.7);
    }
  }, [playAnimation, reducedMotion, setExpression, setJourneyStep, sound]);

  const startScan = useCallback(() => {
    if (lock.current || scanning || complete) return;
    lock.current = true;
    setScanning(true);
    setCelebrationDone(false);
    celebrationTimeline.current?.kill();
    celebrationTimeline.current = null;
    playAnimation("happy", true);
    setExpression("excited");

    if (reducedMotion) {
      recordReading(120);
      lock.current = false;
      setScanning(false);
      return;
    }

    const from = value;
    const startedAt = performance.now();
    const duration = 3300;
    let nextMilestone = Math.floor(from / 20) * 20 + 20;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 2.6);
      const current = from + (120 - from) * eased;
      setValue(current);
      while (nextMilestone <= current && nextMilestone <= 120) {
        recordReading(nextMilestone);
        nextMilestone += 20;
      }
      if (progress < 1) {
        scanTimer.current = window.requestAnimationFrame(animate);
      } else {
        setValue(120);
        scanTimer.current = null;
        lock.current = false;
        setScanning(false);
      }
    };
    scanTimer.current = window.requestAnimationFrame(animate);
  }, [complete, playAnimation, recordReading, reducedMotion, scanning, setExpression, value]);

  const continueAdventure = () => {
    setJourneyStep(3);
    playAnimation("paw_heart", true);
    setExpression("affectionate");
    transitionTo(router, "/compliments", reducedMotion);
  };

  const resetScan = () => {
    if (scanTimer.current !== null) window.cancelAnimationFrame(scanTimer.current);
    celebrationTimeline.current?.kill();
    celebrationTimeline.current = null;
    lock.current = false;
    setScanning(false);
    scanTimer.current = null;
    setValue(0);
    setComplete(false);
    setCelebrationDone(false);
    try { window.localStorage.setItem("birthday-cuteness-score", "0"); } catch { /* Keep the in-memory reset. */ }
    setJourneyStep(2);
    setExpression("curious");
    playAnimation("look_meter", true);
  };

  return <main className={`cuteness-page${complete ? " is-complete" : ""}`}>
    <div className="meter-canvas"><CutenessWorld value={value} reducedMotion={reducedMotion} pageVisible={pageVisible} /></div>
    <div className="meter-vignette" aria-hidden="true" />
    <div className="meter-progress"><span>03</span><i />08</div>
    <button className="meter-sound" type="button" onClick={() => setSoundOn((on) => !on)} aria-label={soundOn ? "Mute meter sounds" : "Enable meter sounds"} title={soundOn ? "Mute sounds" : "Enable sounds"}>
      {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </button>

    <header className="meter-heading">
      <div className="meter-plaque">
        <span className="plaque-crown" aria-hidden="true">♛</span>
        <span className="plaque-heart plaque-heart-left" aria-hidden="true">♥</span>
        <h1><span>{BIRTHDAY_GIRL_NAME}&apos;s</span><span>Cuteness Meter</span></h1>
        <span className="plaque-heart plaque-heart-right" aria-hidden="true">♥</span>
      </div>
      <div className="meter-ribbon">Let&apos;s see just how cute you are! 😍</div>
    </header>

    <div className="meter-readout" aria-live="polite" aria-atomic="true">
      <strong key={Math.floor(value / 10)} className={reducedMotion ? "" : "meter-score-pop"}>{Math.round(value)}<small>%</small></strong>
    </div>

    {complete && <aside className="meter-warning is-overloaded" aria-live="polite" aria-atomic="true">
        <TriangleAlert className="warning-spark" size={18} aria-hidden="true" />
        <div><b>⚠️ CUTENESS OVERLOAD! ⚠️</b><small>WARNING: Cuteness levels have exceeded the maximum limit!</small><strong>{BIRTHDAY_GIRL_NAME.toUpperCase()} IS TOO CUTE TO HANDLE! 🐼💗</strong><small>Even the Baby Panda can&apos;t handle this much cuteness! ✨</small></div>
        <Heart className="warning-spark" size={18} fill="currentColor" aria-hidden="true" />
    </aside>}

    <div className="meter-controls">
      {!complete ? <button type="button" className="meter-action" onClick={startScan} disabled={scanning}>{scanning ? "Measuring Abhinaya’s Cuteness…" : "Measure My Cuteness! 💗"} <Heart size={19} fill="currentColor" /></button>
        : <button type="button" className="meter-action continue-action" onClick={continueAdventure} disabled={!celebrationDone}>{celebrationDone ? <>Continue <ArrowRight size={18} /></> : <>Celebrating… <Heart size={15} fill="currentColor" /></>}</button>}
      {complete && celebrationDone && <button className="meter-reset" type="button" onClick={resetScan}>Try the scan again</button>}
    </div>
  </main>;
}
