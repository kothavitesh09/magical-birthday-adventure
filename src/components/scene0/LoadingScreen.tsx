"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useBirthdayStore } from "@/store/birthdayStore";
import { transitionTo } from "@/utils/sceneTransition";

type LoadingWorldProps = { reducedMotion: boolean; onReady: () => void; onError: () => void };

export default function LoadingScreen() {
  const router = useRouter();
  const reducedMotion = useBirthdayStore((state) => state.reducedMotion);
  const setReducedMotion = useBirthdayStore((state) => state.setReducedMotion);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const setExpression = useBirthdayStore((state) => state.setExpression);
  const assetState = useProgress();
  const [welcomeCodeReady, setWelcomeCodeReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [World, setWorld] = useState<ComponentType<LoadingWorldProps> | null>(null);
  const didNavigate = useRef(false);
  const ready = welcomeCodeReady && fontsReady && webglReady && firstFrameReady && (!assetState.active || assetState.progress >= 100);
  const progress = useMemo(() => {
    const stages = (welcomeCodeReady ? 30 : 0) + (fontsReady ? 15 : 0) + (webglReady ? 15 : 0);
    const sceneReady = firstFrameReady ? 40 : assetState.total > 0 ? assetState.progress * 0.4 : 0;
    const raw = stages + sceneReady;
    return ready ? 100 : Math.min(99, Math.round(raw));
  }, [assetState.progress, assetState.total, firstFrameReady, fontsReady, ready, webglReady, welcomeCodeReady]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    setExpression("sleepy");
    playAnimation("sleep", true);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", onChange);
    const detectFrame = window.requestAnimationFrame(() => {
      try {
        const probe = document.createElement("canvas");
        const available = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
        setWebglAvailable(available);
        setWebglReady(true);
        if (!available) setFirstFrameReady(true);
      } catch {
        setWebglAvailable(false);
        setWebglReady(true);
        setFirstFrameReady(true);
      }
    });

    let active = true;
    void Promise.all([
      import("@/components/scene1/WelcomeWorld"),
      import("@/components/scene0/LoadingWorld"),
      document.fonts?.ready ?? Promise.resolve(),
    ]).then(([, worldModule]) => {
      if (!active) return;
      setWorld(() => worldModule.default);
      setWelcomeCodeReady(true);
      setFontsReady(true);
    }).catch(() => {
      if (active) {
        // Keep the loading screen recoverable if a prefetch fails; the route will retry its own import.
        setWebglAvailable(false);
        setWebglReady(true);
        setFirstFrameReady(true);
        setWelcomeCodeReady(true);
        setFontsReady(true);
      }
    });
    return () => { active = false; window.cancelAnimationFrame(detectFrame); media.removeEventListener("change", onChange); };
  }, [playAnimation, setExpression, setReducedMotion]);

  useEffect(() => {
    if (!ready || didNavigate.current) return;
    didNavigate.current = true;
    const timer = window.setTimeout(() => transitionTo(router, "/welcome", reducedMotion), reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [ready, reducedMotion, router]);

  useEffect(() => {
    if (webglAvailable !== true || !World || firstFrameReady) return;
    const timeout = window.setTimeout(() => {
      setWebglAvailable(false);
      setFirstFrameReady(true);
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [World, firstFrameReady, webglAvailable]);

  return <main className="loading-screen" aria-label="Magical birthday adventure loading">
    <div className="loading-night-sky" aria-hidden="true" />
    <div className="loading-outer-sparkles" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
    <section className="loading-composition" aria-label="Preparing a Little Magic">
      <div className="loading-label">1. Loading Screen</div>
      <div className={`loading-card${webglAvailable === false ? " loading-card-fallback" : ""}`}>
        <div className="loading-card-sky" aria-hidden="true" />
        {webglAvailable && World && <div className="loading-world"><World reducedMotion={reducedMotion} onReady={() => setFirstFrameReady(true)} onError={() => { setWebglAvailable(false); setWebglReady(true); setFirstFrameReady(true); }} /></div>}
        <div className="loading-card-vignette" aria-hidden="true" />
        {webglAvailable === false && <div className="loading-fallback-copy" role="status">Preparing your birthday magic…</div>}
        <div className="loading-copy">
          <p>Preparing a Little Magic...</p>
          <div className="loading-progress-row">
            <div className="loading-progress-track" role="progressbar" aria-label="Loading the birthday adventure" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span aria-live="polite">{progress}%</span>
          </div>
        </div>
      </div>
      <p className="loading-caption">A cute loading screen with the panda, preparing<br className="loading-caption-break" /> the magical birthday experience.</p>
    </section>
  </main>;
}
