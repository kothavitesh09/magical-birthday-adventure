"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimationControls } from "@/components/ui/AnimationControls";
import { CameraControls } from "@/components/ui/CameraControls";
import { useBirthdayStore } from "@/store/birthdayStore";

const PandaCanvas = dynamic(() => import("@/components/panda/PandaCanvas"), {
  ssr: false,
  loading: () => <div className="canvas-loading"><span>✦</span><p>Waking up the little panda…</p></div>,
});

export default function Playground() {
  const setReducedMotion = useBirthdayStore((state) => state.setReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const change = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [setReducedMotion]);

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Birthday Adventure home"><span className="brand-mark">♡</span><span>Birthday <i>Adventure</i></span></a>
        <div className="top-note"><span className="tiny-sparkle">✦</span> A little world made just for you <span className="tiny-heart">♡</span></div>
        <div className="chapter-pill"><span className="live-dot" /> PANDA PLAYGROUND</div>
      </header>

      <section className="intro" id="home">
        <div className="eyebrow"><span>✧</span> YOUR VERY OWN LITTLE MAGIC <span>✧</span></div>
        <h1>Meet your <em>little</em> birthday buddy</h1>
        <p>A little friend to meet, play with and make birthday wishes beside.</p>
      </section>

      <section className="experience" aria-label="Interactive panda playground">
        <div className="scene-frame">
          <div className="scene-topline"><span className="scene-label"><span className="scene-star">✦</span> THE PANDA GARDEN</span><span className="scene-badge"><i className="live-dot" /> &nbsp;A LITTLE MAGIC IS HAPPENING</span></div>
          <PandaCanvas />
          <CameraControls />
          <div className="scene-caption"><span className="caption-flower">✿</span><span>Tap a feeling below to play</span><span className="caption-flower">✿</span></div>
          <div className="scene-corner corner-left">✧</div><div className="scene-corner corner-right">✧</div>
        </div>

        <aside className="control-card">
          <div className="control-heading"><div><span className="section-kicker">PANDA MOOD</span><h2>What should we do?</h2></div><span className="mood-heart">♡</span></div>
          <p className="control-copy">Choose a moment, then try a different face. Drag the garden to turn your panda.</p>
          <AnimationControls />
          <div className="control-foot"><span className="foot-sparkle">✧</span><span>Every mood has a little magic in it</span><span className="foot-sparkle">✧</span></div>
        </aside>
      </section>

      <footer className="footer-note"><span>Made with</span><span className="footer-heart">♥</span><span>for your special day</span><span className="footer-divider">·</span><span className="footer-stars">✦ ✧ ✦</span></footer>
    </main>
  );
}
