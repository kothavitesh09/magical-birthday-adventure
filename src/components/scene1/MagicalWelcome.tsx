"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBirthdayStore } from "@/store/birthdayStore";
import { usePageVisible, useReducedMotionPreference } from "@/hooks/motion";
import { transitionTo } from "@/utils/sceneTransition";
import { BIRTHDAY_GIRL_NAME } from "@/data/birthdayGirl";

const WelcomeWorld = dynamic(() => import("@/components/scene1/WelcomeWorld"), {
  ssr: false,
  loading: () => <div className="welcome-loading" aria-label="Loading the magical garden"><span>✦</span></div>,
});

export default function MagicalWelcome() {
  const router = useRouter();
  const reducedMotion = useReducedMotionPreference();
  const pageVisible = usePageVisible();
  const [starting, setStarting] = useState(false);
  const [sparkleBurst, setSparkleBurst] = useState(false);
  const busy = useRef(false);
  const page = useRef<HTMLElement>(null);
  const setJourneyStep = useBirthdayStore((state) => state.setJourneyStep);
  const playAnimation = useBirthdayStore((state) => state.playAnimation);
  const setExpression = useBirthdayStore((state) => state.setExpression);
  const setReducedMotion = useBirthdayStore((state) => state.setReducedMotion);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(preference.matches);
    const updatePreference = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    preference.addEventListener("change", updatePreference);
    try {
      const savedStep = Number(window.localStorage.getItem("magical-birthday-step") ?? 0);
      if (Number.isFinite(savedStep) && savedStep > 0) setJourneyStep(savedStep);
    } catch { /* The welcome still works when browser storage is unavailable. */ }
    const welcomeTimer = window.setTimeout(() => {
      setExpression("happy");
      playAnimation("wave", true);
    }, preference.matches ? 0 : 500);
    return () => {
      preference.removeEventListener("change", updatePreference);
      window.clearTimeout(welcomeTimer);
    };
  }, [playAnimation, setExpression, setJourneyStep, setReducedMotion]);

  useEffect(() => {
    if (!page.current) return;
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".welcome-kicker, .welcome-copy h1, .welcome-heart, .welcome-copy p, .welcome-signs, .welcome-cta", { clearProps: "all" });
        return;
      }
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".welcome-kicker", { y: 14 }, { y: 0, duration: 0.75 }, 0.2)
        .fromTo(".welcome-copy h1", { y: 18 }, { y: 0, duration: 0.9 }, 0.34)
        .fromTo(".welcome-copy p", { y: 14 }, { y: 0, duration: 0.75 }, 0.62)
        .fromTo(".welcome-heart", { scale: 0.6 }, { scale: 1, duration: 0.48, ease: "back.out(1.7)" }, 0.88);
    }, page);
    return () => context.revert();
  }, [reducedMotion]);

  const handleContinue = useCallback(() => {
    if (busy.current || starting) return;
    busy.current = true;
    setStarting(true);
    setSparkleBurst(true);
    setExpression("excited");
    playAnimation("celebrate", true);
    setJourneyStep(2);
    window.setTimeout(() => transitionTo(router, "/cuteness", reducedMotion), reducedMotion ? 0 : 650);
  }, [playAnimation, reducedMotion, router, setExpression, setJourneyStep, starting]);

  return <main ref={page} className="welcome-page">
    <div className="welcome-sky" aria-hidden="true" />
    <div className="welcome-canvas"><WelcomeWorld reducedMotion={reducedMotion} pageVisible={pageVisible} /></div>
    <div className="welcome-vignette" aria-hidden="true" />
    <div className="welcome-step" aria-label="Page 2 of 8"><span>02</span><i />08</div>
    <div className="welcome-copy">
      <div className="welcome-kicker"><span className="welcome-crown">♛</span> WELCOME TO YOUR</div>
      <h1>Magical Birthday<br />Adventure!</h1>
      <div className="welcome-name-row"><span className="birthday-name">{BIRTHDAY_GIRL_NAME}</span><div className="welcome-heart" aria-hidden="true"><Heart size={35} fill="currentColor" /></div></div>
      <p>A little world of magic, surprises and happiness awaits you...</p>
    </div>
    <div className="welcome-signpost" aria-label="Birthday wishes">
      {["Dream Big", "Be Happy", "You’re Special"].map((message) => <div className="welcome-signs" key={message}><span>{message}</span><Heart size={16} fill="currentColor" /></div>)}
    </div>
    <button className={`welcome-cta${starting ? " is-starting" : ""}`} type="button" onClick={handleContinue} disabled={starting} aria-label="Start the birthday adventure">
        {starting ? "Let the magic begin" : "Start the Adventure"} <span className="welcome-cta-sparkle">✦</span>
      </button>
    {sparkleBurst && <div className="welcome-sparkle-burst" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>}
  </main>;
}
