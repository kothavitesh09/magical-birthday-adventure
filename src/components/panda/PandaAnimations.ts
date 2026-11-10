import type { PandaAnimation } from "@/types/panda";

export type PandaPose = {
  rootY: number; rootX: number; rootYaw: number; bodyLean: number; bodySway: number;
  headTilt: number; headYaw: number; headPitch: number; shoulderL: number; shoulderR: number;
  pawL: number; pawR: number; elbowL: number; elbowR: number; legL: number; legR: number;
  footL: number; footR: number; gazeX: number; gazeY: number; lids: number; mouth: number;
  blush: number; pawTogether: number; prop: number;
};

const neutral = (): PandaPose => ({
  rootY: 0, rootX: 0, rootYaw: 0, bodyLean: 0, bodySway: 0, headTilt: 0, headYaw: 0,
  headPitch: 0, shoulderL: 0, shoulderR: 0, pawL: 0, pawR: 0, elbowL: 0, elbowR: 0,
  legL: 0, legR: 0, footL: 0, footR: 0, gazeX: 0, gazeY: 0, lids: 0, mouth: 0,
  blush: 0, pawTogether: 0, prop: 0,
});

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function poseForAnimation(animation: PandaAnimation, time: number, progress: number): PandaPose {
  const p = neutral();
  const beat = Math.sin(time * 5.4);
  const gait = time * (animation === "run" ? 12 : 6.2);
  const swing = Math.sin(gait);
  const lift = Math.max(0, Math.cos(gait));

  // Quiet secondary motion stays underneath the selected action.
  p.rootY = Math.sin(time * 1.45) * 0.018;
  p.bodySway = Math.sin(time * 0.82) * 0.018;
  p.headTilt = Math.sin(time * 0.64) * 0.012;
  p.pawL = Math.sin(time * 1.35) * 0.025;
  p.pawR = Math.sin(time * 1.08 + 0.7) * 0.02;

  switch (animation) {
    case "idle":
      p.rootY = -0.07; p.legL = -0.55; p.legR = -0.55;
      // Keep the paws apart in a relaxed, slightly asymmetric cuddle pose.
      p.shoulderL = 0.7; p.shoulderR = -0.7;
      p.elbowL = 0; p.elbowR = 0; p.pawTogether = 0;
      break;
    case "look_left": p.headYaw = 0.42; p.gazeX = -0.75; break;
    case "look_right": p.headYaw = -0.42; p.gazeX = 0.75; break;
    case "look_up": p.headPitch = 0.26; p.gazeY = 0.7; p.headTilt -= 0.06; break;
    case "head_tilt": p.headTilt += 0.27; p.gazeX = 0.12; break;
    case "sway": p.bodySway += Math.sin(time * 1.65) * 0.14; p.headTilt += Math.sin(time * 1.65 + 0.3) * 0.05; break;
    case "wave": p.shoulderL = -2.12; p.elbowL = -0.72; p.pawL = -0.5 + Math.sin(time * 9) * 0.35; p.headTilt -= 0.06; break;
    case "happy": p.rootY += Math.abs(beat) * 0.11; p.shoulderL = -0.2; p.shoulderR = 0.2; p.lids = 0.35; p.mouth = 1; p.blush = 0.5; break;
    case "blush": p.headTilt += 0.12; p.gazeY = -0.38; p.gazeX = 0.2; p.blush = 1; p.shoulderL = 0.25; p.shoulderR = -0.25; break;
    case "surprise": p.headPitch = -0.12; p.shoulderL = -2.15; p.shoulderR = 2.15; p.lids = -0.15; p.mouth = -0.8; p.rootY += 0.06 * (1 - progress); break;
    case "shy": p.headTilt += 0.2; p.gazeY = -0.35; p.blush = 1; p.shoulderL = 1.95; p.shoulderR = -1.95; p.elbowL = 0.52; p.elbowR = -0.52; p.pawTogether = 0.65; break;
    case "heart_holding": case "hold_heart": p.shoulderL = 1.15; p.shoulderR = -1.15; p.elbowL = 0.75; p.elbowR = -0.75; p.pawTogether = 0.9; p.prop = 1; p.blush = 0.5; break;
    case "clap": p.shoulderL = 1.1; p.shoulderR = -1.1; p.elbowL = 0.72; p.elbowR = -0.72; p.pawTogether = (Math.sin(time * 13) + 1) * 0.5; p.rootY += Math.abs(beat) * 0.05; break;
    case "sleep": p.rootY = -0.16; p.bodyLean = 0.035; p.legL = -0.52; p.legR = -0.52; p.headTilt += 0.32; p.headPitch += 0.12; p.lids = 0.92; p.mouth = 0.15; p.shoulderL = 1.12; p.shoulderR = -1.12; p.elbowL = 0.34; p.elbowR = -0.34; p.pawTogether = 0.34; break;
    case "walk": case "happy_walk": case "run":
      p.legL = swing * (animation === "run" ? 0.72 : 0.5);
      p.legR = -swing * (animation === "run" ? 0.72 : 0.5);
      p.footL = lift * (animation === "run" ? 0.26 : 0.15);
      p.footR = Math.max(0, -Math.cos(gait)) * (animation === "run" ? 0.26 : 0.15);
      p.shoulderL = -swing * 0.42; p.shoulderR = swing * 0.42;
      p.elbowL = 0.18; p.elbowR = 0.18;
      p.rootY += animation === "run" ? Math.abs(beat) * 0.13 : lift * 0.035;
      p.rootX = animation === "run" ? Math.sin(time * 1.3) * 0.25 : Math.sin(time * 0.9) * 0.18;
      p.bodyLean = animation === "run" ? -0.16 : 0.02;
      p.mouth = animation === "happy_walk" ? 0.8 : 0;
      if (animation === "happy_walk") { p.lids = 0.28; p.blush = 0.4; }
      break;
    case "jump": case "hop": {
      const anticipation = 1 - smoothstep(0.08, 0.24, progress);
      const landing = smoothstep(0.82, 1, progress);
      const arc = Math.sin(Math.PI * smoothstep(0.14, 0.9, progress));
      p.rootY += -0.12 * anticipation + (animation === "hop" ? 0.32 : 0.48) * arc - 0.08 * Math.sin(landing * Math.PI);
      p.shoulderL = -2.0; p.shoulderR = 2.0; p.elbowL = -0.4; p.elbowR = 0.4;
      p.legL = -0.3 * arc; p.legR = -0.3 * arc; p.bodyLean = -0.04 * anticipation;
      p.lids = 0.2; p.mouth = 0.7; break;
    }
    case "sit": p.rootY = -0.2; p.legL = -0.7; p.legR = 0.7; p.footL = 0.05; p.footR = 0.05; p.shoulderL = 0.3; p.shoulderR = -0.3; break;
    case "stand": p.rootY = -0.2 * (1 - smoothstep(0.08, 0.9, progress)); p.legL = -0.7 * (1 - progress); p.legR = 0.7 * (1 - progress); break;
    case "celebrate": p.rootY += Math.abs(beat) * 0.16; p.shoulderL = -2.25 + Math.sin(time * 8) * 0.12; p.shoulderR = 2.25 - Math.sin(time * 8) * 0.12; p.pawL = Math.sin(time * 8) * 0.18; p.pawR = -Math.sin(time * 8) * 0.18; p.mouth = 1; p.lids = 0.35; p.blush = 0.4; break;
    case "spin": p.rootYaw = Math.PI * 2 * smoothstep(0.03, 0.96, progress); p.bodySway += Math.sin(progress * Math.PI * 4) * 0.04; p.shoulderL = -0.55; p.shoulderR = 0.55; break;
    case "peek_door": p.rootX = 0.32 * Math.sin(Math.PI * smoothstep(0.08, 0.82, progress)); p.headYaw = -0.28; p.headTilt += 0.08; p.shoulderL = -0.25; p.gazeX = 0.18; break;
    case "present_envelope": p.shoulderL = 0.9; p.shoulderR = -0.9; p.elbowL = 0.52; p.elbowR = -0.52; p.pawTogether = 0.55; p.prop = smoothstep(0.12, 0.44, progress); p.headTilt += 0.04; break;
    case "hold_letter": p.shoulderL = 1.0; p.shoulderR = -1.0; p.elbowL = 0.55; p.elbowR = -0.55; p.pawTogether = 0.7; p.prop = 1; p.gazeY = 0.14; break;
    case "look_cake": p.headPitch = 0.16; p.gazeY = 0.54; p.gazeX = 0.18; p.mouth = 0.5; break;
    case "make_wish": p.headPitch = 0.18; p.gazeY = -0.2; p.lids = smoothstep(0.32, 0.58, progress) * (1 - smoothstep(0.82, 0.96, progress)); p.shoulderL = 0.8; p.shoulderR = -0.8; p.elbowL = 0.55; p.elbowR = -0.55; p.pawTogether = 0.9; break;
    case "join_paws": p.shoulderL = 1.12; p.shoulderR = -1.12; p.elbowL = 0.9; p.elbowR = -0.9; p.pawTogether = 1; p.headTilt += 0.05; p.headPitch = 0.12; p.gazeX = 0.12; p.gazeY = 0.2; break;
    case "blow_candles": p.headPitch = 0.25; p.gazeY = 0.25; p.mouth = -0.4; p.shoulderL = 0.24; p.shoulderR = -0.24; break;
    case "gift_pop": p.rootY += 0.5 * (1 - smoothstep(0.48, 0.9, progress)); p.shoulderL = -1.1; p.shoulderR = 1.1; p.mouth = 0.8; p.lids = -0.1; break;
    case "raise_paws": p.shoulderL = -2.25; p.shoulderR = 2.25; p.elbowL = -0.45; p.elbowR = 0.45; p.mouth = 0.8; p.lids = 0.2; break;
    case "step_out": {
      const emerge = smoothstep(0.08, 0.72, progress);
      p.rootX = -0.5 * (1 - emerge) + 0.2 * smoothstep(0.72, 1, progress);
      p.rootY = -0.08 * (1 - emerge) + Math.sin(progress * Math.PI * 3) * 0.025;
      p.legL = Math.sin(progress * Math.PI * 4) * 0.32 * (1 - smoothstep(0.55, 0.92, progress));
      p.legR = -p.legL; p.shoulderL = -0.65; p.shoulderR = 0.45;
      p.pawL = Math.sin(progress * Math.PI * 5) * 0.18; p.headYaw = -0.16 * (1 - emerge); break;
    }
    case "look_meter": p.headYaw = -0.34; p.gazeX = -0.9; p.gazeY = 0.1; p.headTilt = -0.04; break;
    case "present_doors": p.shoulderL = -1.38; p.shoulderR = 1.38; p.elbowL = -0.24; p.elbowR = 0.24; p.pawL = 0.12; p.pawR = -0.12; p.headTilt = -0.08; p.mouth = 0.45; break;
    case "look_door_left": p.rootYaw = 0.12; p.headYaw = 0.42; p.gazeX = -0.8; p.headTilt = 0.05; break;
    case "look_door_right": p.rootYaw = -0.12; p.headYaw = -0.42; p.gazeX = 0.8; p.headTilt = -0.05; break;
    case "cover_cheeks": p.shoulderL = 1.72; p.shoulderR = -1.72; p.elbowL = 0.52; p.elbowR = -0.52; p.pawL = 0.12; p.pawR = -0.12; p.blush = 1; p.gazeY = -0.18; p.headTilt = 0.12; break;
    case "cover_eyes": p.shoulderL = 1.95; p.shoulderR = -1.95; p.elbowL = 0.26; p.elbowR = -0.26; p.lids = 0.9; p.headTilt = 0.08; break;
    case "hide_box": p.rootY = -0.46 + 0.035 * Math.sin(time * 3); p.headPitch = -0.14; p.shoulderL = 1.8; p.shoulderR = -1.8; p.elbowL = 0.55; p.elbowR = -0.55; p.lids = 0.25; break;
    case "birthday_finale": p.rootY += Math.abs(Math.sin(time * 7.5)) * 0.17; p.rootX = Math.sin(time * 2.1) * 0.14; p.bodySway = Math.sin(time * 4.2) * 0.13; p.shoulderL = -2.15 + Math.sin(time * 8) * 0.16; p.shoulderR = 2.15 - Math.sin(time * 8) * 0.16; p.legL = Math.sin(time * 4) * 0.27; p.legR = -p.legL; p.pawL = Math.sin(time * 8) * 0.22; p.pawR = -p.pawL; p.mouth = 1; p.lids = 0.35; p.blush = 0.5; break;
    case "paw_heart": p.shoulderL = 1.45; p.elbowL = 0.65; p.pawL = 0.32; p.shoulderR = -0.18; p.headTilt = -0.08; p.blush = 0.45; p.mouth = 0.6; break;
    case "point": p.shoulderR = 1.72; p.elbowR = 0.26; p.pawR = -0.32; p.headYaw = -0.18; p.gazeX = 0.65; break;
  }
  return p;
}
