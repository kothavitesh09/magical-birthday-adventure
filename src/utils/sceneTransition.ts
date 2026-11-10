import gsap from "gsap";

export function transitionTo(router: { push: (href: string) => void }, path: string, reducedMotion: boolean) {
  const overlay = document.querySelector<HTMLElement>(".scene-transition");
  if (reducedMotion || !overlay) {
    router.push(path);
    return;
  }

  overlay.style.pointerEvents = "auto";
  gsap.killTweensOf(overlay);
  gsap.to(overlay, {
    opacity: 0.72,
    duration: 0.28,
    ease: "power2.in",
    onComplete: () => router.push(path),
  });
}
