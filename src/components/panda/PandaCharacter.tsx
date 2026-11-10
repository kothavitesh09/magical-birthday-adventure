"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CapsuleGeometry, CatmullRomCurve3, DataTexture, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, RGBAFormat, Shape, SphereGeometry, SRGBColorSpace, TubeGeometry, Vector3 } from "three";
import type { PandaAnimation, PandaExpression } from "@/types/panda";
import { poseForAnimation } from "@/components/panda/PandaAnimations";
import { transientDurations, useBirthdayStore } from "@/store/birthdayStore";
import { FurCoat } from "@/components/panda/FurCoat";

const WHITE = "#fff6ed";
const INK = "#21191a";

function plushGeometry(rx: number, ry: number, rz: number, cheeks = false) {
  const geometry = new SphereGeometry(1, 96, 64);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i); const y = position.getY(i); const z = position.getZ(i);
    const cheek = cheeks ? 1 + 0.055 * Math.exp(-((Math.abs(x) - 0.53) ** 2 / 0.035 + (y + 0.14) ** 2 / 0.06)) : 1;
    const crown = cheeks ? 1 - 0.035 * Math.max(0, y) : 1;
    position.setXYZ(i, x * rx * cheek * crown, y * ry, z * rz * cheek);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function expressionFor(animation: PandaAnimation, selected: PandaExpression): PandaExpression {
  if (selected !== "neutral") return selected;
  if (animation === "surprise" || animation === "gift_pop") return "surprised";
  if (animation === "sleep") return "sleepy";
  if (animation === "shy") return "shy";
  if (animation === "blush") return "blushing";
  if (["happy", "happy_walk", "celebrate", "clap", "raise_paws", "hop"].includes(animation)) return "happy";
  if (["look_left", "look_right", "look_up", "look_cake", "head_tilt"].includes(animation)) return "curious";
  return "neutral";
}

function PandaPaw({ mirrored = false }: { mirrored?: boolean }) {
  const thumbSide = mirrored ? -1 : 1;
  return <>
    <mesh position={[0, -0.015, 0.015]} scale={[0.16, 0.145, 0.12]} castShadow>
      <sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={INK} roughness={0.95} />
    </mesh>
    {[-0.085, 0, 0.085].map((x, index) => <mesh key={x} position={[x, -0.11 - (index === 1 ? 0.012 : 0), 0.045]} scale={[0.06, index === 1 ? 0.085 : 0.073, 0.095]} castShadow>
      <sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={INK} roughness={0.95} />
    </mesh>)}
    <mesh position={[thumbSide * 0.125, 0.035, 0.04]} rotation={[0, 0, thumbSide * -0.48]} scale={[0.075, 0.052, 0.085]} castShadow>
      <sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={INK} roughness={0.95} />
    </mesh>
    <mesh position={[0, -0.012, 0.128]} scale={[0.052, 0.04, 0.012]}>
      <sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color="#8a625c" roughness={0.9} />
    </mesh>
    <FurCoat center={[0, -0.015, 0.005]} radii={[0.18, 0.16, 0.13]} count={100} excludeFace color={INK} />
  </>;
}

export function PandaCharacter({ animation, reducedMotion = false }: { animation?: PandaAnimation; reducedMotion?: boolean }) {
  const storeAnimation = useBirthdayStore((state) => state.animation);
  const expression = useBirthdayStore((state) => state.expression);
  const transitionId = useBirthdayStore((state) => state.transitionId);
  const paused = useBirthdayStore((state) => state.paused);
  const mood = animation ?? storeAnimation;
  const face = expressionFor(mood, expression);

  const root = useRef<Group>(null); const body = useRef<Group>(null); const head = useRef<Group>(null);
  const earL = useRef<Group>(null); const earR = useRef<Group>(null);
  const shoulderL = useRef<Group>(null); const shoulderR = useRef<Group>(null);
  const elbowL = useRef<Group>(null); const elbowR = useRef<Group>(null);
  const pawL = useRef<Group>(null); const pawR = useRef<Group>(null);
  const legL = useRef<Group>(null); const legR = useRef<Group>(null);
  const footL = useRef<Group>(null); const footR = useRef<Group>(null);
  const eyeL = useRef<Group>(null); const eyeR = useRef<Group>(null);
  const lidL = useRef<Group>(null); const lidR = useRef<Group>(null);
  const blushL = useRef<Mesh>(null); const blushR = useRef<Mesh>(null);
  const smile = useRef<Group>(null); const openMouth = useRef<Mesh>(null);
  const envelope = useRef<Group>(null); const heartProp = useRef<Group>(null);
  const giftBox = useRef<Group>(null);
  const startedId = useRef(-1); const actionStart = useRef(0); const nextBlink = useRef(3.1);
  const blinkAmount = useRef(0); const blinkDirection = useRef(0); const eyeHeight = useRef(1);
  const animationClock = useRef(0); const idleUntil = useRef(0); const nextIdleMoment = useRef(8); const idleTilt = useRef(0); const idleGaze = useRef(0);

  const headShape = useMemo(() => plushGeometry(0.86, 0.79, 0.71, true), []);
  const bodyShape = useMemo(() => plushGeometry(0.68, 0.59, 0.53), []);
  const earShape = useMemo(() => new SphereGeometry(1, 40, 32), []);
  const eyelidShape = useMemo(() => new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48), []);
  const capsule = useMemo(() => new CapsuleGeometry(0.145, 0.28, 8, 24), []);
  const footShape = useMemo(() => new SphereGeometry(1, 40, 28), []);
  const smileShape = useMemo(() => {
    const curve = new CatmullRomCurve3([new Vector3(-0.145, 0.01, 0), new Vector3(-0.08, -0.065, 0), new Vector3(0, -0.078, 0), new Vector3(0.08, -0.065, 0), new Vector3(0.145, 0.01, 0)]);
    return new TubeGeometry(curve, 24, 0.012, 8, false);
  }, []);
  const smileMaterial = useMemo(() => new MeshStandardMaterial({ color: "#53303a", roughness: 0.72 }), []);
  const eyeMaterial = useMemo(() => new MeshPhysicalMaterial({ color: "#111116", roughness: 0.065, clearcoat: 1, clearcoatRoughness: 0.02, metalness: 0.02 }), []);
  const irisMaterial = useMemo(() => new MeshPhysicalMaterial({ color: "#292a30", roughness: 0.12, clearcoat: 1 }), []);
  const fiberMaterial = useMemo(() => new MeshStandardMaterial({ color: WHITE, roughness: 0.97 }), []);
  const darkFiberMaterial = useMemo(() => new MeshStandardMaterial({ color: INK, roughness: 0.96 }), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: WHITE, roughness: 0.94, bumpScale: 0.016 }), []);
  const innerEarMaterial = useMemo(() => new MeshStandardMaterial({ color: "#d98d9f", roughness: 0.9 }), []);
  const blushTexture = useMemo(() => {
    const size = 96;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot((x - (size - 1) / 2) / (size / 2), (y - (size - 1) / 2) / (size / 2));
      const alpha = Math.max(0, 1 - distance) ** 2 * 210;
      const offset = (y * size + x) * 4;
      data[offset] = 255; data[offset + 1] = 105; data[offset + 2] = 148; data[offset + 3] = alpha;
    }
    const texture = new DataTexture(data, size, size, RGBAFormat);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!root.current || !body.current || !head.current || !shoulderL.current || !shoulderR.current) return;
    const dt = Math.min(delta, 0.035);
    if (!paused) animationClock.current += dt;
    const now = animationClock.current;
    if (startedId.current !== transitionId) { startedId.current = transitionId; actionStart.current = now; }
    const duration = (transientDurations[mood] ?? 3200) / 1000;
    const progress = transientDurations[mood] ? Math.min(1, (now - actionStart.current) / duration) : 0;
    const pose = poseForAnimation(mood, reducedMotion ? 0 : now, progress);
    if (!reducedMotion && mood === "idle") {
      if (now > nextIdleMoment.current) {
        const choice = Math.random();
        idleTilt.current = choice < 0.45 ? (Math.random() - 0.5) * 0.3 : 0;
        idleGaze.current = choice > 0.4 ? (Math.random() - 0.5) * 0.45 : 0;
        idleUntil.current = now + 1.1 + Math.random() * 1.5;
        nextIdleMoment.current = now + 6 + Math.random() * 9;
      }
      const settle = idleUntil.current > now ? 1 : 0;
      pose.headTilt += idleTilt.current * settle;
      pose.headYaw += idleGaze.current * settle * 0.6;
      pose.gazeX += idleGaze.current * settle;
      pose.gazeY += Math.sin(now * 0.37) * 0.08;
      pose.bodySway += Math.sin(now * 0.47 + 1.2) * 0.012;
    }
    if (face === "excited") { pose.rootY += Math.abs(Math.sin(now * 5.8)) * 0.12; pose.shoulderL = -1.75; pose.shoulderR = 1.75; pose.mouth = 1; }
    if (face === "shy" || face === "blushing") { pose.shoulderL = 1.72; pose.shoulderR = -1.72; pose.elbowL = 0.52; pose.elbowR = -0.52; pose.pawTogether = 0.65; pose.gazeY -= 0.25; pose.blush = 1; }
    if (face === "sad") { pose.bodyLean = 0.07; pose.headPitch = -0.13; pose.gazeY = -0.45; pose.shoulderL = 0.18; pose.shoulderR = -0.18; }
    if (face === "proud") { pose.bodyLean = -0.055; pose.shoulderR = 2.05; pose.elbowR = -0.25; pose.headPitch = 0.08; pose.mouth = 0.55; }
    if (face === "affectionate") { pose.shoulderL = 1.45; pose.elbowL = 0.65; pose.pawL = 0.32; pose.headTilt = -0.08; pose.blush = 0.45; pose.mouth = 0.6; }
    if (face === "embarrassed") { pose.shoulderL = 1.72; pose.shoulderR = -1.72; pose.elbowL = 0.52; pose.elbowR = -0.52; pose.pawTogether = 0.65; pose.blush = 1; pose.gazeX = 0.35; pose.gazeY = -0.35; pose.headTilt = 0.12; }
    const blend = 1 - Math.exp(-dt * 6.8);

    root.current.position.x += (pose.rootX - root.current.position.x) * blend;
    root.current.position.y += ((-0.35 + pose.rootY) - root.current.position.y) * blend;
    root.current.rotation.y += (pose.rootYaw - root.current.rotation.y) * blend;
    body.current.rotation.z += ((pose.bodyLean + pose.bodySway) - body.current.rotation.z) * blend;
    head.current.rotation.z += (pose.headTilt - head.current.rotation.z) * blend;
    head.current.rotation.y += (pose.headYaw - head.current.rotation.y) * blend;
    head.current.rotation.x += (pose.headPitch - head.current.rotation.x) * blend;
    const earMotion = reducedMotion ? 0 : Math.sin(now * 1.2) * 0.018;
    if (earL.current) earL.current.rotation.z += (earMotion - earL.current.rotation.z) * blend;
    if (earR.current) earR.current.rotation.z += ((reducedMotion ? 0 : Math.sin(now * 1.2 + 0.55) * -0.018) - earR.current.rotation.z) * blend;
    shoulderL.current.rotation.z += (pose.shoulderL - shoulderL.current.rotation.z) * blend;
    shoulderR.current.rotation.z += (pose.shoulderR - shoulderR.current.rotation.z) * blend;
    if (elbowL.current) elbowL.current.rotation.z += (pose.elbowL - elbowL.current.rotation.z) * blend;
    if (elbowR.current) elbowR.current.rotation.z += (pose.elbowR - elbowR.current.rotation.z) * blend;
    const leftArmAngle = shoulderL.current.rotation.z + (elbowL.current?.rotation.z ?? 0);
    const rightArmAngle = shoulderR.current.rotation.z + (elbowR.current?.rotation.z ?? 0);
    const pawMeet = pose.pawTogether * 0.08;
    if (pawL.current) {
      pawL.current.rotation.z += (pose.pawL - pawL.current.rotation.z) * blend;
      pawL.current.position.x += ((-0.01 + Math.cos(leftArmAngle) * pawMeet) - pawL.current.position.x) * blend;
      pawL.current.position.y += ((-0.19 - Math.sin(leftArmAngle) * pawMeet) - pawL.current.position.y) * blend;
    }
    if (pawR.current) {
      pawR.current.rotation.z += (pose.pawR - pawR.current.rotation.z) * blend;
      pawR.current.position.x += ((0.01 - Math.cos(rightArmAngle) * pawMeet) - pawR.current.position.x) * blend;
      pawR.current.position.y += ((-0.19 + Math.sin(rightArmAngle) * pawMeet) - pawR.current.position.y) * blend;
    }
    if (legL.current) legL.current.rotation.x += (pose.legL - legL.current.rotation.x) * blend;
    if (legR.current) legR.current.rotation.x += (pose.legR - legR.current.rotation.x) * blend;
    if (footL.current) { footL.current.rotation.x += (pose.footL - footL.current.rotation.x) * blend; footL.current.position.y += ((-0.29 + pose.footL) - footL.current.position.y) * blend; }
    if (footR.current) { footR.current.rotation.x += (pose.footR - footR.current.rotation.x) * blend; footR.current.position.y += ((-0.29 + pose.footR) - footR.current.position.y) * blend; }

    if (!reducedMotion && now > nextBlink.current && blinkDirection.current === 0) {
      blinkDirection.current = 1;
      nextBlink.current = now + 0.13;
    }
    if (blinkDirection.current !== 0) {
      blinkAmount.current = Math.min(1, Math.max(0, blinkAmount.current + dt * 10 * blinkDirection.current));
      if (blinkAmount.current >= 1) blinkDirection.current = -1;
      if (blinkAmount.current <= 0 && blinkDirection.current === -1) {
        blinkDirection.current = 0;
        nextBlink.current = now + (Math.random() < 0.18 ? 0.24 : 2.4 + Math.random() * 3.6);
      }
    }
    const expressionLids = face === "sleepy" ? 0.82 : face === "happy" || face === "affectionate" ? 0.42 : face === "shy" || face === "sad" || face === "embarrassed" ? 0.22 : 0;
    const lids = Math.max(expressionLids, pose.lids, blinkAmount.current * 0.98);
    const eyeOpen = face === "surprised" || face === "excited" ? 1.18 : face === "curious" ? 1.07 : 1 - lids;
    eyeHeight.current += (eyeOpen - eyeHeight.current) * Math.min(1, dt * 23);
    const expressionGazeX = face === "curious" ? 0.12 : 0;
    const expressionGazeY = face === "curious" ? 0.1 : 0;
    [eyeL.current, eyeR.current].forEach((eye, i) => {
      if (eye) { eye.scale.y = Math.max(0.04, eyeHeight.current); eye.position.x = (i === 0 ? -1 : 1) * (0.315 + (pose.gazeX + expressionGazeX) * 0.035); eye.position.y = 0.26 + (pose.gazeY + expressionGazeY) * 0.035; }
    });
    [lidL.current, lidR.current].forEach((lid) => { if (lid) { lid.position.y += ((0.075 - lids * 0.11) - lid.position.y) * blend; lid.scale.y += ((0.055 + lids * 0.11) - lid.scale.y) * blend; } });

    const blush = Math.max(pose.blush, face === "shy" || face === "blushing" || face === "excited" || face === "embarrassed" ? 0.82 : face === "neutral" ? 0.28 : 0.16);
    [blushL.current, blushR.current].forEach((mesh) => { if (mesh) (mesh.material as MeshBasicMaterial).opacity += (blush * 0.72 - (mesh.material as MeshBasicMaterial).opacity) * blend; });
    if (smile.current) smile.current.scale.y += ((face === "sad" ? -0.72 : face === "happy" || face === "affectionate" || face === "proud" || pose.mouth > 0.55 ? 1.2 : 0.9) - smile.current.scale.y) * blend;
    if (openMouth.current) openMouth.current.scale.y += ((face === "surprised" || face === "excited" || pose.mouth < -0.5 ? 0.11 : 0.018) - openMouth.current.scale.y) * blend;
    if (envelope.current) envelope.current.scale.setScalar(pose.prop * (mood === "present_envelope" || mood === "hold_letter" ? 1 : 0));
    if (heartProp.current) heartProp.current.scale.setScalar(pose.prop * (mood === "heart_holding" || mood === "hold_heart" ? 1 : 0));
    if (giftBox.current) giftBox.current.scale.setScalar(mood === "hide_box" || mood === "gift_pop" ? 1 : 0);
    // Gentle breathing and a tiny landing squash are shared by the one-shot poses.
    const landingSquash = mood === "jump" && progress > 0.86 ? Math.sin(((progress - 0.86) / 0.14) * Math.PI) * 0.07 : 0;
    body.current.scale.y += ((1 + (reducedMotion ? 0 : Math.sin(now * 2.1) * 0.012) - landingSquash) - body.current.scale.y) * blend;
  });

  return <group ref={root} position={[0, -0.35, 0]}>
      <mesh position={[0, -0.49, -0.02]} scale={[0.77, 0.12, 0.5]} receiveShadow>
      <sphereGeometry args={[1, 48, 24]} /><meshBasicMaterial color="#462843" transparent opacity={0.2} />
    </mesh>

    <group ref={body}>
      <mesh position={[0, 0.4, 0]} geometry={bodyShape} material={material} castShadow receiveShadow />
      <FurCoat center={[0, 0.4, 0]} radii={[0.68, 0.59, 0.53]} count={2200} excludeFace color={WHITE} />
      <mesh position={[0, 0.38, 0.47]} scale={[0.43, 0.45, 0.075]}>
        <sphereGeometry args={[1, 40, 32]} /><meshStandardMaterial color="#fff0ed" roughness={0.96} />
      </mesh>
      <group position={[0, 0.28, -0.41]} rotation={[0.2, 0, 0]}><mesh scale={[0.14, 0.16, 0.18]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={INK} roughness={0.97} /></mesh></group>
    </group>

    <group position={[-0.29, 0.03, 0.02]} ref={legL}>
      <mesh geometry={capsule} material={darkFiberMaterial} rotation={[0, 0, -0.2]} position={[0, -0.14, 0]} castShadow />
      <group ref={footL} position={[-0.015, -0.29, 0.12]}>
        <mesh geometry={footShape} material={darkFiberMaterial} scale={[0.2, 0.21, 0.26]} castShadow />
        {[ -0.085, 0, 0.085 ].map((x) => <mesh key={x} position={[x, -0.01, 0.225]} scale={[0.044, 0.033, 0.022]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#8b7481" roughness={0.8} /></mesh>)}
      </group>
    </group>
    <group position={[0.29, 0.03, 0.02]} ref={legR}>
      <mesh geometry={capsule} material={darkFiberMaterial} rotation={[0, 0, 0.2]} position={[0, -0.14, 0]} castShadow />
      <group ref={footR} position={[0.015, -0.29, 0.12]}>
        <mesh geometry={footShape} material={darkFiberMaterial} scale={[0.2, 0.21, 0.26]} castShadow />
        {[ -0.085, 0, 0.085 ].map((x) => <mesh key={x} position={[x, -0.01, 0.225]} scale={[0.044, 0.033, 0.022]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#8b7481" roughness={0.8} /></mesh>)}
      </group>
    </group>

    {/* Keep the articulated arms in front of the belly so the paws remain visible. */}
    <group ref={shoulderL} position={[-0.45, 0.96, 0.48]}>
      <mesh geometry={capsule} material={darkFiberMaterial} position={[-0.04, -0.18, 0]} castShadow />
      <FurCoat center={[-0.04, -0.18, 0]} radii={[0.15, 0.25, 0.15]} count={240} color={INK} />
      <group ref={elbowL} position={[-0.08, -0.34, 0.02]}><mesh geometry={capsule} material={darkFiberMaterial} scale={[0.78, 0.75, 0.8]} position={[0, -0.08, 0]} castShadow />
        <FurCoat center={[0, -0.08, 0]} radii={[0.12, 0.18, 0.12]} count={180} color={INK} />
        <group ref={pawL} position={[-0.01, -0.19, 0.06]}>
          <PandaPaw />
        </group>
      </group>
    </group>
    <group ref={shoulderR} position={[0.45, 0.96, 0.48]}>
      <mesh geometry={capsule} material={darkFiberMaterial} position={[0.04, -0.18, 0]} castShadow />
      <FurCoat center={[0.04, -0.18, 0]} radii={[0.15, 0.25, 0.15]} count={240} color={INK} />
      <group ref={elbowR} position={[0.08, -0.34, 0.02]}><mesh geometry={capsule} material={darkFiberMaterial} scale={[0.78, 0.75, 0.8]} position={[0, -0.08, 0]} castShadow />
        <FurCoat center={[0, -0.08, 0]} radii={[0.12, 0.18, 0.12]} count={180} color={INK} />
        <group ref={pawR} position={[0.01, -0.19, 0.06]}>
          <PandaPaw mirrored />
        </group>
      </group>
    </group>

    <group ref={head} position={[0, 1.27, 0.025]} scale={[1.055, 1.035, 1.02]}>
      <group ref={earL} position={[-0.57, 0.52, -0.015]} rotation={[0, 0, -0.15]}>
        <mesh scale={[0.275, 0.3, 0.235]} geometry={earShape} material={darkFiberMaterial} castShadow />
        <mesh position={[0, 0, 0.173]} scale={[0.13, 0.16, 0.025]} geometry={earShape} material={innerEarMaterial} />
      </group>
      <group ref={earR} position={[0.57, 0.52, -0.015]} rotation={[0, 0, 0.15]}>
        <mesh scale={[0.275, 0.3, 0.235]} geometry={earShape} material={darkFiberMaterial} castShadow />
        <mesh position={[0, 0, 0.173]} scale={[0.13, 0.16, 0.025]} geometry={earShape} material={innerEarMaterial} />
      </group>
      <mesh geometry={headShape} material={material} castShadow receiveShadow />
      <FurCoat center={[0, 0, 0]} radii={[0.86, 0.79, 0.71]} count={2800} excludeFace color={WHITE} />
      <FurCoat center={[0, 0, 0]} radii={[0.86, 0.79, 0.71]} count={850} faceDetail frontOnly color={WHITE} />

      <mesh position={[-0.315, 0.25, 0.49]} rotation={[0, 0, -0.14]} scale={[0.32, 0.34, 0.085]} geometry={earShape} material={darkFiberMaterial} />
      <mesh position={[0.315, 0.25, 0.49]} rotation={[0, 0, 0.14]} scale={[0.32, 0.34, 0.085]} geometry={earShape} material={darkFiberMaterial} />
      <group ref={eyeL} position={[-0.315, 0.26, 0.565]}>
        <mesh scale={[0.15, 0.17, 0.05]}><sphereGeometry args={[1, 40, 32]} /><meshPhysicalMaterial color="#fffaf4" roughness={0.22} /></mesh>
        <mesh position={[0, 0, 0.035]} scale={[0.12, 0.135, 0.04]} material={irisMaterial}><sphereGeometry args={[1, 36, 28]} /></mesh>
        <mesh position={[0, -0.004, 0.066]} scale={[0.084, 0.096, 0.027]} material={eyeMaterial}><sphereGeometry args={[1, 36, 28]} /></mesh>
        <group ref={lidL} position={[0, 0.1, 0.076]} scale={[0.17, 0.069, 0.04]}><mesh geometry={eyelidShape} material={fiberMaterial} /></group>
        <mesh position={[-0.038, 0.05, 0.091]} scale={0.027}><sphereGeometry args={[1, 24, 20]} /><meshBasicMaterial color="#fffefb" /></mesh>
        <mesh position={[0.034, -0.043, 0.085]} scale={0.014}><sphereGeometry args={[1, 18, 14]} /><meshBasicMaterial color="#d8bfc0" /></mesh>
      </group>
      <group ref={eyeR} position={[0.315, 0.26, 0.565]}>
        <mesh scale={[0.15, 0.17, 0.05]}><sphereGeometry args={[1, 40, 32]} /><meshPhysicalMaterial color="#fffaf4" roughness={0.22} /></mesh>
        <mesh position={[0, 0, 0.035]} scale={[0.12, 0.135, 0.04]} material={irisMaterial}><sphereGeometry args={[1, 36, 28]} /></mesh>
        <mesh position={[0, -0.004, 0.066]} scale={[0.084, 0.096, 0.027]} material={eyeMaterial}><sphereGeometry args={[1, 36, 28]} /></mesh>
        <group ref={lidR} position={[0, 0.1, 0.076]} scale={[0.17, 0.069, 0.04]}><mesh geometry={eyelidShape} material={fiberMaterial} /></group>
        <mesh position={[-0.038, 0.05, 0.091]} scale={0.027}><sphereGeometry args={[1, 24, 20]} /><meshBasicMaterial color="#fffefb" /></mesh>
        <mesh position={[0.034, -0.043, 0.085]} scale={0.014}><sphereGeometry args={[1, 18, 14]} /><meshBasicMaterial color="#d8bfc0" /></mesh>
      </group>
      <mesh position={[-0.49, 0.57, 0.46]} rotation={[0, 0, 0.14]} scale={[0.17, 0.045, 0.035]} geometry={earShape} material={darkFiberMaterial} />
      <mesh position={[0.49, 0.57, 0.46]} rotation={[0, 0, -0.14]} scale={[0.17, 0.045, 0.035]} geometry={earShape} material={darkFiberMaterial} />
      <mesh position={[0, 0.055, 0.718]} scale={[0.112, 0.078, 0.064]}>
        <sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color="#201a22" roughness={0.16} clearcoat={1} clearcoatRoughness={0.04} />
      </mesh>
      <mesh position={[-0.043, 0.034, 0.773]} scale={[0.017, 0.024, 0.008]}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#100f12" /></mesh>
      <mesh position={[0.043, 0.034, 0.773]} scale={[0.017, 0.024, 0.008]}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#100f12" /></mesh>
      <mesh position={[-0.125, -0.14, 0.635]} scale={[0.145, 0.09, 0.055]} geometry={earShape} material={material} />
      <mesh position={[0.125, -0.14, 0.635]} scale={[0.145, 0.09, 0.055]} geometry={earShape} material={material} />
      <mesh ref={openMouth} position={[0, -0.205, 0.668]} scale={[0.075, 0.018, 0.035]}>
        <sphereGeometry args={[1, 24, 20]} /><meshStandardMaterial color="#4d2738" roughness={0.7} />
      </mesh>
      <group ref={smile} position={[0, -0.18, 0.69]} scale={[1, 0.9, 1]}><mesh geometry={smileShape} material={smileMaterial} /></group>
      <mesh ref={blushL} position={[-0.54, -0.005, 0.557]} scale={[0.25, 0.12, 1]}>
        <planeGeometry args={[1, 1]} /><meshBasicMaterial map={blushTexture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={blushR} position={[0.54, -0.005, 0.557]} scale={[0.25, 0.12, 1]}>
        <planeGeometry args={[1, 1]} /><meshBasicMaterial map={blushTexture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={envelope} position={[0, -0.5, 0.84]} scale={0}>
        <mesh scale={[0.34, 0.22, 0.045]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#f6b3ce" roughness={0.48} /></mesh>
        <mesh position={[0, -0.015, 0.047]} scale={[0.27, 0.24, 0.8]}><shapeGeometry args={[heartShape()]} /><meshStandardMaterial color="#c84f88" roughness={0.42} /></mesh>
      </group>
      <group ref={heartProp} position={[0, -0.42, 0.86]} scale={0}><mesh scale={0.24}><shapeGeometry args={[heartShape()]} /><meshPhysicalMaterial color="#ff8eb8" roughness={0.32} clearcoat={0.65} /></mesh></group>
    </group>
    <group ref={giftBox} position={[0, -0.05, 0.22]} scale={0}>
      <mesh position={[0, 0.2, 0]} castShadow><boxGeometry args={[0.92, 0.52, 0.72]} /><meshPhysicalMaterial color="#eb7eae" roughness={0.48} clearcoat={0.25} /></mesh>
      <mesh position={[0, 0.49, 0]} castShadow><boxGeometry args={[1, 0.1, 0.78]} /><meshPhysicalMaterial color="#ffafd0" roughness={0.38} clearcoat={0.35} /></mesh>
      <mesh position={[0, 0.3, 0.37]}><boxGeometry args={[0.12, 0.43, 0.025]} /><meshStandardMaterial color="#ffd78f" roughness={0.5} /></mesh>
      <mesh position={[0, 0.56, 0]} scale={[0.25, 0.12, 0.12]}><torusGeometry args={[0.72, 0.18, 12, 24, Math.PI]} /><meshStandardMaterial color="#ffd78f" roughness={0.42} /></mesh>
      <mesh position={[0, 0.56, 0]} rotation={[0, Math.PI, 0]} scale={[0.25, 0.12, 0.12]}><torusGeometry args={[0.72, 0.18, 12, 24, Math.PI]} /><meshStandardMaterial color="#ffd78f" roughness={0.42} /></mesh>
    </group>
  </group>;
}

function heartShape() {
  const shape = new Shape();
  shape.moveTo(0, -0.45); shape.bezierCurveTo(-0.95, 0.1, -0.62, 0.82, 0, 0.42); shape.bezierCurveTo(0.62, 0.82, 0.95, 0.1, 0, -0.45);
  return shape;
}
