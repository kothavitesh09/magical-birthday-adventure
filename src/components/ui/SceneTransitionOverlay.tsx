"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useReducedMotionPreference } from "@/hooks/motion";

export default function SceneTransitionOverlay() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotionPreference();
  const overlay = useRef<HTMLDivElement>(null);
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!overlay.current) return;
    gsap.killTweensOf(overlay.current);
    // The overlay starts hidden on the first load. Only fade it out after a
    // real route transition; animating in on mount can cover the first scene
    // while the 3D canvas is still starting up.
    if (previousPathname.current === null) {
      previousPathname.current = pathname;
      gsap.set(overlay.current, { opacity: 0, pointerEvents: "none" });
      return;
    }
    previousPathname.current = pathname;
    gsap.to(overlay.current, {
      opacity: 0,
      duration: reducedMotion ? 0 : 0.62,
      ease: "power2.out",
      onComplete: () => { if (overlay.current) overlay.current.style.pointerEvents = "none"; },
    });
  }, [pathname, reducedMotion]);

  return <div ref={overlay} className="scene-transition" aria-hidden="true" />;
}
