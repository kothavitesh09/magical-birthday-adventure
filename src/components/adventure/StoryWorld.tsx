"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera as DreiPerspectiveCamera, RoundedBox, Sparkles } from "@react-three/drei";
import { CanvasTexture, ExtrudeGeometry, Group, MathUtils, MeshBasicMaterial, PointLight, Shape, ShapeGeometry, SRGBColorSpace } from "three";
import { PandaController } from "@/components/panda/PandaController";
import { useBirthdayStore } from "@/store/birthdayStore";
import { MagicalAtmosphere } from "@/components/environment/MagicalAtmosphere";

export type StoryScene = 3 | 4 | 5 | 6 | 7;

function HeartShape({ color = "#ff91bd", size = 1 }: { color?: string; size?: number }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.35);
    shape.bezierCurveTo(-0.8, 0.05, -0.52, 0.72, 0, 0.42);
    shape.bezierCurveTo(0.52, 0.72, 0.8, 0.05, 0, -0.35);
    return new ShapeGeometry(shape, 24);
  }, []);
  return <mesh geometry={geometry} scale={size}>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.26} roughness={0.34} />
  </mesh>;
}

function StarShape({ color = "#ffe3a0" }: { color?: string }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 0.36 : 0.16;
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    return new ShapeGeometry(shape, 16);
  }, []);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} /></mesh>;
}

function makeArchedDoorGeometry(width: number, height: number, depth: number) {
  const shape = new Shape();
  const bottom = -height / 2;
  const shoulder = height * 0.18;
  const top = height / 2;
  shape.moveTo(-width / 2, bottom);
  shape.lineTo(-width / 2, shoulder);
  shape.quadraticCurveTo(-width / 2, top, 0, top);
  shape.quadraticCurveTo(width / 2, top, width / 2, shoulder);
  shape.lineTo(width / 2, bottom);
  shape.closePath();
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 24 });
}

function Flower({ color, scale = 1 }: { color: string; scale?: number }) {
  return <group scale={scale}>
    {Array.from({ length: 5 }, (_, i) => {
      const angle = i * Math.PI * 0.4;
      return <mesh key={i} position={[Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0]} rotation={[0, 0, angle]} scale={[0.13, 0.075, 0.055]}>
        <sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={color} roughness={0.56} />
      </mesh>;
    })}
    <mesh position={[0, 0, 0.06]} scale={0.055}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color="#ffe2a0" emissive="#ffc66b" emissiveIntensity={0.4} /></mesh>
  </group>;
}

function ComplimentGardenBorder({ portrait }: { portrait: boolean }) {
  const blossoms = ["#ef6ca5", "#ff9bc4", "#ffd1df", "#d987cb", "#ffe1a0"];
  return <group>
    {[-1, 1].map((side) => <group key={side} position={[side * (portrait ? 1.9 : 5.95), 0.4, -0.35]} scale={portrait ? [0.62, 1, 0.7] : 1}>
      <mesh position={[-side * 0.16, 0.6, -0.1]} rotation={[0, 0, side * 0.15]}><cylinderGeometry args={[0.025, 0.04, 3.4, 8]} /><meshStandardMaterial color="#54745c" roughness={0.9} /></mesh>
      {Array.from({ length: 13 }, (_, i) => {
        const y = -0.95 + i * 0.24;
        const x = Math.sin(i * 1.6) * 0.25;
        const size = 0.7 + (i % 3) * 0.14;
        return <group key={i} position={[x, y, 0.03]}>
          <Flower color={blossoms[i % blossoms.length]} scale={size} />
          <mesh position={[side * (i % 2 ? -0.25 : 0.23), (i % 3 - 1) * 0.08, -0.09]} rotation={[0.1, 0, side * (i % 2 ? 0.55 : -0.55)]} scale={[0.22, 0.09, 0.045]}>
            <sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={i % 2 ? "#5d8065" : "#76936e"} roughness={0.92} />
          </mesh>
        </group>;
      })}
    </group>)}
  </group>;
}

function CastleAndGarden({ scene, reducedMotion }: { scene: StoryScene; reducedMotion: boolean }) {
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const palettes: Record<StoryScene, [string, string, string]> = {
      3: ["#4a2864", "#a859a0", "#efa0c3"],
      4: ["#11143c", "#38245f", "#a966a5"],
      5: ["#4b285f", "#ae5b91", "#f1a3ba"],
      6: ["#302052", "#79509a", "#df8bb7"],
      7: ["#29194f", "#633980", "#d17aa8"],
    };
    const palette = palettes[scene];
    const gradient = ctx.createLinearGradient(0, 0, 0, 640);
    gradient.addColorStop(0, palette[0]); gradient.addColorStop(0.48, palette[1]); gradient.addColorStop(1, palette[2]);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 640);
    [[180, 250, 210, "#ff95c4"], [520, 180, 250, "#c78bff"], [860, 310, 220, "#ffa7d1"]].forEach(([x, y, radius, tint]) => {
      const glow = ctx.createRadialGradient(Number(x), Number(y), 0, Number(x), Number(y), Number(radius));
      glow.addColorStop(0, `${tint}48`); glow.addColorStop(1, `${tint}00`);
      ctx.fillStyle = glow; ctx.fillRect(Number(x) - Number(radius), Number(y) - Number(radius), Number(radius) * 2, Number(radius) * 2);
    });
    // A softly lit fairytale skyline gives every scene depth without flattening
    // its own focal objects into a single background illustration.
    const skyline = ctx.createLinearGradient(0, 270, 0, 540);
    skyline.addColorStop(0, "#37225230"); skyline.addColorStop(1, "#28183f9c");
    ctx.fillStyle = skyline;
    ctx.beginPath(); ctx.moveTo(0, 490);
    for (let x = 0; x <= 1024; x += 64) {
      const base = 455 + Math.sin(x * 0.018) * 22;
      ctx.lineTo(x, base);
      if (x % 128 === 0) {
        const towerW = 27 + (x % 3) * 8;
        const towerH = 90 + (x % 5) * 24;
        ctx.lineTo(x, base - towerH + 20); ctx.lineTo(x + towerW / 2, base - towerH);
        ctx.lineTo(x + towerW, base - towerH + 20); ctx.lineTo(x + towerW, base);
      }
    }
    ctx.lineTo(1024, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
    // Small warm windows establish scale and read as distant inhabited towers.
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 137 + 43) % 1000 + 12;
      const y = 375 + (i * 53) % 135;
      ctx.fillStyle = i % 4 === 0 ? "#ffe4a970" : "#ffd3ec55";
      ctx.beginPath(); ctx.roundRect(x, y, 3 + i % 3, 8 + i % 4, 3); ctx.fill();
    }
    // A few distant blossom clusters echo the garden framing in the references.
    for (const side of [0, 1]) {
      for (let i = 0; i < 28; i += 1) {
        const x = side === 0 ? (i * 23) % 220 : 804 + (i * 23) % 220;
        const y = 470 + (i * 37) % 155;
        ctx.fillStyle = ["#f79ac6aa", "#ffd5e4aa", "#ffe6a888", "#d895d0aa"][i % 4];
        ctx.beginPath(); ctx.arc(x, y, 3 + i % 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (let i = 0; i < 125; i += 1) {
      const x = (i * 193 + 61) % 1024; const y = (i * 137 + 31) % 640;
      ctx.beginPath(); ctx.arc(x, y, i % 11 === 0 ? 2 : 0.75, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? "#fff0c9aa" : "#ffe6f580"; ctx.fill();
    }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, [scene]);
  return <>
    <mesh position={[0, 0, -4.8]}><planeGeometry args={[32, 24]} /><meshBasicMaterial map={canvasTexture ?? undefined} color={canvasTexture ? "white" : "#80517f"} toneMapped={false} /></mesh>
    <mesh position={[0, -1.38, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[28, 22]} /><meshStandardMaterial color={scene === 4 ? "#aa75bb" : scene === 7 ? "#b56f9f" : "#bd7ba9"} roughness={0.86} /></mesh>
    {[-5.2, 5.2].map((x) => <group key={x} position={[x, -0.25, -3.8]}>
      <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.38, 0.5, 2.1, 12]} /><meshPhysicalMaterial color={scene === 4 ? "#a97bc1" : "#b16d9e"} roughness={0.82} transparent opacity={0.74} /></mesh>
      {scene !== 4 && <mesh position={[0, 2.22, 0]}><coneGeometry args={[0.68, 1.25, 8]} /><meshPhysicalMaterial color="#aa6a9d" roughness={0.82} transparent opacity={0.78} /></mesh>}
      <mesh position={[0, 1.05, 0.42]}><boxGeometry args={[0.12, 0.42, 0.08]} /><meshBasicMaterial color="#ffe2aa" /></mesh>
      <pointLight position={[0, 1.2, 1]} color="#ffbbd6" intensity={0.65} distance={3.4} />
    </group>)}
    {(scene === 3 ? [-4.8, -4.15, -3.5, 3.5, 4.15, 4.8] : scene === 4 ? [-5.2, -4.7, 4.7, 5.2] : [-3.6, -2.8, 2.8, 3.6]).map((x, i) => <Float key={`${x}-${i}`} speed={reducedMotion ? 0 : 0.22 + (i % 3) * 0.035} floatIntensity={reducedMotion ? 0 : 0.025} rotationIntensity={reducedMotion ? 0 : 0.012}><group position={[x, -1.12 + (scene === 3 ? (i % 3) * 0.27 : (i % 2) * 0.08), 0.08]}>
      {scene === 3 && Array.from({ length: 4 }, (_, j) => <mesh key={`leaf-${j}`} position={[(j % 2 ? 1 : -1) * (0.16 + (j % 3) * 0.08), (j - 1.5) * 0.13, -0.14]} rotation={[0.2, 0, (j % 2 ? 1 : -1) * 0.42]} scale={[0.22, 0.08, 0.055]}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color={j % 2 ? "#58745f" : "#78906c"} roughness={0.9} /></mesh>)}
      {Array.from({ length: scene === 3 ? 7 : 5 }, (_, j) => <group key={j} position={[(j - (scene === 3 ? 3 : 2)) * 0.25, (j % 2) * 0.12, (j % 3) * 0.025]}><Flower color={["#f783b4", "#ffc0d8", "#ffe7b1", "#dd8ed0"][j % 4]} scale={0.8 + (j % 2) * 0.18} /></group>)}
    </group></Float>)}
    {[-4.1, 4.1].map((x) => <group key={x} position={[x, 0.95, -1.2]}>
      <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.22, 0.34, 0.2]} /><meshPhysicalMaterial color="#ffe0ae" transparent opacity={0.7} roughness={0.24} /></mesh>
      <mesh position={[0, 0.69, 0]}><coneGeometry args={[0.19, 0.15, 4]} /><meshStandardMaterial color="#d19465" metalness={0.45} roughness={0.35} /></mesh>
      <pointLight position={[0, 0.45, 0.2]} color="#ffd58f" intensity={1.25} distance={3} />
    </group>)}
  </>;
}

function ComplimentHearts() {
  return <>
    {[
      [-2.9, 1.5, 0.2, "#ff9bc6", 0.38], [-1.6, 2.15, -0.2, "#ffd496", 0.24],
      [1.55, 1.8, 0.1, "#ff9bc6", 0.3], [2.85, 1.15, 0.15, "#ffd496", 0.25],
      [-2.6, -0.05, 0.4, "#ffb1d1", 0.21], [2.55, -0.15, 0.35, "#ffa2c9", 0.24],
    ].map(([x, y, z, color, scale], i) => <Float key={i} speed={0.45 + i * 0.08} floatIntensity={0.15} rotationIntensity={0.08}>
      <group position={[Number(x), Number(y), Number(z)]}><HeartShape color={String(color)} size={Number(scale)} /></group>
    </Float>)}
  </>;
}

function DoorCrown() {
  return <group position={[0, 1.63, 0.3]} scale={0.64}>
    <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.52, 0.57, 0.14, 10]} /><meshStandardMaterial color="#e9ad48" metalness={0.7} roughness={0.27} /></mesh>
    {[-0.42, -0.21, 0, 0.21, 0.42].map((x, index) => <group key={x} position={[x, 0.07 + (index % 2) * 0.13, 0]}>
      <mesh><coneGeometry args={[0.12, 0.23, 5]} /><meshStandardMaterial color="#ffd36c" metalness={0.66} roughness={0.24} emissive="#ffbd50" emissiveIntensity={0.22} /></mesh>
      <mesh position={[0, 0.13, 0]} scale={0.05}><sphereGeometry args={[1, 14, 10]} /><meshBasicMaterial color="#fff0bb" /></mesh>
    </group>)}
    <mesh position={[0, 0.015, 0.08]} scale={[0.14, 0.16, 0.04]}><sphereGeometry args={[1, 18, 14]} /><meshPhysicalMaterial color="#fa67a9" roughness={0.2} metalness={0.22} clearcoat={1} emissive="#f754a1" emissiveIntensity={0.3} /></mesh>
  </group>;
}

function SecretDoor({ x, color, icon, index, scale = 1, opened, selected, hovered }: { x: number; color: string; icon: "heart" | "star" | "gift"; index: number; scale?: number; opened: boolean; selected: boolean; hovered: boolean }) {
  const rig = useRef<Group>(null);
  const leaf = useRef<Group>(null);
  const surroundGeometry = useMemo(() => makeArchedDoorGeometry(1.94, 2.82, 0.34), []);
  const portalGeometry = useMemo(() => makeArchedDoorGeometry(1.62, 2.54, 0.12), []);
  const leafGeometry = useMemo(() => makeArchedDoorGeometry(1.42, 2.62, 0.18), []);
  const insetGeometry = useMemo(() => makeArchedDoorGeometry(1.18, 2.35, 0.045), []);
  const accent = icon === "heart" ? "#ff83b7" : icon === "star" ? "#c9a0ff" : "#ffd078";
  useFrame((_, delta) => {
    if (rig.current) {
      rig.current.scale.setScalar(MathUtils.damp(rig.current.scale.x, scale * (hovered || selected ? 1.035 : 1), 7, delta));
      rig.current.position.y = MathUtils.damp(rig.current.position.y, 0.38 + (hovered ? 0.045 : 0), 6, delta);
    }
    if (leaf.current) {
      const openAngle = index === 2 ? 1.14 : -1.14;
      leaf.current.rotation.y = MathUtils.damp(leaf.current.rotation.y, opened ? openAngle : 0, 5, delta);
    }
  });

  return <group ref={rig} position={[x, 0.38, -0.7]} scale={scale}>
    {/* Carved stone surround and the glowing space behind the leaf. */}
    <mesh geometry={surroundGeometry} position={[0, 0, 0]} castShadow receiveShadow><meshPhysicalMaterial color={index === 1 ? "#c4a6d3" : "#dfb5c9"} roughness={0.66} clearcoat={0.22} /></mesh>
    <mesh geometry={portalGeometry} position={[0, 0, 0.2]}><meshPhysicalMaterial color={index === 1 ? "#604478" : "#80536e"} roughness={0.5} emissive={accent} emissiveIntensity={opened ? 0.65 : hovered || selected ? 0.3 : 0.12} /></mesh>
    {opened && <group position={[0, 0, 0.31]}><Sparkles count={18} scale={[1.2, 2.1, 0.3]} size={2.2} speed={0.35} color={accent} opacity={0.95} /></group>}
    <mesh position={[-0.84, 0, 0.28]}><boxGeometry args={[0.12, 2.63, 0.14]} /><meshStandardMaterial color="#f6dca9" metalness={0.34} roughness={0.42} /></mesh>
    <mesh position={[0.84, 0, 0.28]}><boxGeometry args={[0.12, 2.63, 0.14]} /><meshStandardMaterial color="#f6dca9" metalness={0.34} roughness={0.42} /></mesh>
    <mesh position={[0, 0.55, 0.28]}><torusGeometry args={[0.83, 0.062, 12, 64, Math.PI]} /><meshStandardMaterial color="#ffe2a5" metalness={0.42} roughness={0.32} emissive="#ffc977" emissiveIntensity={hovered || selected ? 0.48 : 0.19} /></mesh>
    <mesh position={[0, -1.33, 0.28]}><boxGeometry args={[1.8, 0.14, 0.26]} /><meshStandardMaterial color="#e7c6cd" metalness={0.22} roughness={0.52} /></mesh>
    {/* The decorated leaf swings on a side hinge when this secret is opened. */}
    <group ref={leaf} position={[-0.73, 0, 0.34]}>
      <mesh geometry={leafGeometry} position={[0.73, 0, 0]} castShadow receiveShadow><meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.48} metalness={0.08} emissive={accent} emissiveIntensity={hovered || selected ? 0.11 : 0.025} /></mesh>
      <mesh geometry={insetGeometry} position={[0.73, -0.02, 0.11]}><meshPhysicalMaterial color={index === 0 ? "#ed77ad" : index === 1 ? "#9a74d0" : "#69a9e0"} roughness={0.42} clearcoat={0.48} metalness={0.08} emissive={accent} emissiveIntensity={hovered || selected ? 0.09 : 0.025} /></mesh>
      <mesh position={[0.73, 0.76, 0.17]}><torusGeometry args={[0.57, 0.035, 10, 48, Math.PI]} /><meshStandardMaterial color="#ffe2a5" metalness={0.5} roughness={0.3} emissive="#ffc977" emissiveIntensity={hovered || selected ? 0.5 : 0.16} /></mesh>
      {[-0.5, 0.5].map((rail) => <mesh key={rail} position={[0.73 + rail, -0.16, 0.19]}><boxGeometry args={[0.035, 1.35, 0.045]} /><meshStandardMaterial color="#f9dba3" metalness={0.36} roughness={0.42} /></mesh>)}
      <mesh position={[0.73, -0.8, 0.19]}><boxGeometry args={[0.98, 0.035, 0.045]} /><meshStandardMaterial color="#f9dba3" metalness={0.36} roughness={0.42} /></mesh>
      {icon === "heart" && <group position={[0.73, 0.05, 0.22]}><HeartShape color="#ffe7ac" size={0.55} /></group>}
      {icon === "star" && <group position={[0.73, 0.05, 0.22]}><StarShape /></group>}
      {icon === "gift" && <group position={[0.73, 0.05, 0.22]}>
        <RoundedBox args={[0.54, 0.48, 0.08]} radius={0.05} smoothness={4}><meshStandardMaterial color="#ffe4a5" emissive="#ffc65e" emissiveIntensity={0.12} /></RoundedBox>
        <mesh position={[0, 0, 0.06]}><boxGeometry args={[0.08, 0.53, 0.04]} /><meshStandardMaterial color="#c76d96" /></mesh>
        <mesh position={[0, 0.27, 0.04]}><torusGeometry args={[0.16, 0.035, 8, 24, Math.PI]} /><meshStandardMaterial color="#ffe4a5" /></mesh>
      </group>}
      {[-0.46, 0.46].map((ornamentX) => <group key={ornamentX} position={[0.73 + ornamentX, -0.76, 0.25]} scale={0.17}><StarShape color="#ffe2a0" /></group>)}
      {[-0.46, 0.46].map((ornamentX) => <group key={ornamentX} position={[0.73 + ornamentX, 0.48, 0.25]} scale={0.12}><HeartShape color="#ffe9ad" size={1} /></group>)}
      <mesh position={[1.19, -0.08, 0.22]}><sphereGeometry args={[0.075, 20, 14]} /><meshStandardMaterial color="#ffe8ac" metalness={0.52} roughness={0.28} /></mesh>
      <mesh position={[0.2, 0.15, 0.22]}><sphereGeometry args={[0.055, 16, 12]} /><meshStandardMaterial color="#ffe6a3" metalness={0.55} /></mesh>
    </group>
    <DoorCrown />
    {[-1, 1].map((side) => <group key={side} position={[side * 0.99, -0.45, 0.3]}>
      <mesh position={[0, 0.64, 0]} rotation={[0, 0, side * -0.08]}><cylinderGeometry args={[0.018, 0.026, 2, 7]} /><meshStandardMaterial color="#55714f" roughness={0.88} /></mesh>
      {Array.from({ length: 5 }, (_, i) => <group key={i} position={[Math.sin(i * 1.7) * 0.08, i * 0.39, 0.03]} scale={0.48 + (i % 2) * 0.1}><Flower color={["#f57cae", "#ffd0df", "#ffd077", "#cf8edf"][i % 4]} /></group>)}
    </group>)}
    <mesh position={[0, 1.46, 0.22]}><sphereGeometry args={[0.105, 20, 16]} /><meshStandardMaterial color="#ffe1a1" emissive="#ffc45e" emissiveIntensity={0.5} metalness={0.35} /></mesh>
    <pointLight position={[0, 0.1, 0.75]} color={accent} intensity={opened ? 1.55 : hovered || selected ? 1.2 : 0.65} distance={3.2} />
  </group>;
}

function MysteryCastle({ portrait }: { portrait: boolean }) {
  const scale = portrait ? 0.48 : 0.96;
  return <group position={portrait ? [-2.2, -0.74, -3.3] : [-4.65, -1.14, -3.45]} scale={scale}>
    <mesh position={[0, 1.05, 0]} castShadow receiveShadow><boxGeometry args={[3.1, 2.05, 0.62]} /><meshPhysicalMaterial color="#d9a9d7" roughness={0.72} clearcoat={0.18} /></mesh>
    <mesh position={[0, 0.63, 0.34]}><boxGeometry args={[0.86, 1.18, 0.06]} /><meshBasicMaterial color="#ffbd73" toneMapped={false} /></mesh>
    <mesh position={[0, 0.58, 0.39]}><torusGeometry args={[0.43, 0.07, 12, 42, Math.PI]} /><meshStandardMaterial color="#ffd58a" metalness={0.38} roughness={0.3} emissive="#ffbd67" emissiveIntensity={0.45} /></mesh>
    {[-1.12, -0.38, 0.4, 1.12].map((x, index) => {
      const h = [2.5, 3.25, 3.55, 2.55][index];
      const w = index === 1 || index === 2 ? 0.62 : 0.52;
      return <group key={x} position={[x, 0.9, index === 1 || index === 2 ? -0.1 : 0.08]}>
        <mesh position={[0, h / 2, 0]} castShadow><cylinderGeometry args={[w * 0.42, w * 0.53, h, 14]} /><meshPhysicalMaterial color={index % 2 ? "#f2c7e5" : "#e8b4dd"} roughness={0.67} /></mesh>
        <mesh position={[0, h + 0.24, 0]} castShadow><coneGeometry args={[w * 0.84, 0.78, 10]} /><meshPhysicalMaterial color={index % 2 ? "#9167cf" : "#bd78d0"} roughness={0.4} clearcoat={0.42} /></mesh>
        {[0.62, 1.22, 1.82].filter((y) => y < h - 0.15).map((y) => <group key={y} position={[0, y, w * 0.43]}>
          <mesh><boxGeometry args={[0.18, 0.34, 0.045]} /><meshBasicMaterial color="#ffe4a6" toneMapped={false} /></mesh>
          <mesh position={[0, 0, 0.035]}><boxGeometry args={[0.1, 0.24, 0.025]} /><meshBasicMaterial color="#fff1c5" toneMapped={false} /></mesh>
        </group>)}
        <mesh position={[0, h + 0.67, 0]} scale={0.07}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#ffe4a7" toneMapped={false} /></mesh>
      </group>;
    })}
    <mesh position={[0, -0.08, 0.42]}><boxGeometry args={[1.28, 0.16, 0.12]} /><meshStandardMaterial color="#f5d1d6" /></mesh>
    <pointLight position={[0, 1.55, 1.1]} color="#ffbf77" intensity={2.7} distance={8} decay={2} />
  </group>;
}

function MysteryClouds({ reducedMotion }: { reducedMotion: boolean }) {
  const clouds: [number, number, number, number][] = [[-5.7, 2.8, -3.1, 1.05], [4.9, 2.75, -3.3, 1.1], [5.6, 1.95, -3.2, 0.72]];
  return <>{clouds.map(([x, y, z, scale], index) => <Float key={index} speed={reducedMotion ? 0 : 0.16 + index * 0.035} floatIntensity={reducedMotion ? 0 : 0.035} rotationIntensity={0}>
    <group position={[x, y, z]} scale={scale}>
      {[-0.45, 0, 0.46].map((offset, i) => <mesh key={offset} position={[offset, i === 1 ? 0.12 : 0, 0]} scale={[0.65, 0.36 + (i === 1 ? 0.12 : 0), 0.24]}><sphereGeometry args={[1, 24, 18]} /><meshBasicMaterial color={index % 2 ? "#db8fe0" : "#bb85e5"} transparent opacity={0.18} depthWrite={false} /></mesh>)}
    </group>
  </Float>)}</>;
}

function MysteryGardenTrees({ portrait }: { portrait: boolean }) {
  const sides: [-1 | 1, number, number][] = portrait ? [[-1, -2.05, 0.5], [1, 2.05, 0.5]] : [[-1, -6.15, 1], [1, 6.15, 1]];
  return <>{sides.map(([side, x, scale]) => <group key={side} position={[x, -0.7, -0.55]} scale={scale}>
    <mesh position={[0, 1.65, 0]} rotation={[0, 0, side * -0.11]} castShadow><cylinderGeometry args={[0.13, 0.23, 3.4, 12]} /><meshStandardMaterial color="#65435f" roughness={0.88} /></mesh>
    {[-0.52, 0.1, 0.67].map((branch, i) => <group key={branch} position={[side * branch, 2.45 + (i % 2) * 0.32, 0]}>
      <mesh rotation={[0, 0, side * 0.42]}><cylinderGeometry args={[0.055, 0.09, 1.15, 8]} /><meshStandardMaterial color="#704a64" roughness={0.86} /></mesh>
      {Array.from({ length: 6 }, (_, j) => <group key={j} position={[(j % 3 - 1) * 0.3, Math.floor(j / 3) * 0.22, 0.05]} scale={0.72 + (j % 2) * 0.18}><Flower color={["#f075ad", "#ffbad5", "#ffd784", "#cf83dc"][j % 4]} /></group>)}
    </group>)}
  </group>)}</>;
}

function MysteryCobblestones() {
  return <group>
    {Array.from({ length: 35 }, (_, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      return <mesh key={index} position={[(col - 2) * 1.05 + (row % 2) * 0.42, -1.275 + (row % 2) * 0.014, 1.35 + row * 0.66]} rotation={[-Math.PI / 2, 0, (col % 2 ? 0.06 : -0.04)]} receiveShadow>
        <cylinderGeometry args={[0.57, 0.6, 0.075, 6]} /><meshPhysicalMaterial color={["#9b6ca1", "#bd82ad", "#d493b6", "#8a6599"][index % 4]} roughness={0.84} clearcoat={0.08} />
      </mesh>;
    })}
  </group>;
}

function MysteryPalace() {
  return <>
    {[-5.35, 5.35].map((x) => <group key={x} position={[x, 0.08, -2.15]}>
      <mesh position={[0, 0.05, 0]} castShadow><cylinderGeometry args={[0.25, 0.36, 3.1, 24]} /><meshPhysicalMaterial color="#c7a6c9" roughness={0.68} clearcoat={0.22} /></mesh>
      <mesh position={[0, -1.52, 0]}><cylinderGeometry args={[0.46, 0.48, 0.18, 24]} /><meshStandardMaterial color="#f1d7d9" roughness={0.68} /></mesh>
      <mesh position={[0, 1.58, 0]}><cylinderGeometry args={[0.4, 0.4, 0.18, 24]} /><meshStandardMaterial color="#ecd3d7" roughness={0.62} /></mesh>
      <mesh position={[0, 1.78, 0]}><boxGeometry args={[0.95, 0.16, 0.58]} /><meshPhysicalMaterial color="#e1b5cb" roughness={0.6} clearcoat={0.2} /></mesh>
      <mesh position={[0, 1.89, 0]}><coneGeometry args={[0.32, 0.26, 8]} /><meshStandardMaterial color="#f2d4a3" metalness={0.3} roughness={0.36} /></mesh>
      <mesh position={[0, 0.15, 0.265]}><boxGeometry args={[0.055, 2.52, 0.04]} /><meshStandardMaterial color="#f1d6d9" roughness={0.62} /></mesh>
      <pointLight position={[0, 0.9, 0.45]} color="#f5a8cf" intensity={0.65} distance={4} />
    </group>)}
    {[[-5.25, 1.15, "#ffb6d5"], [5.25, 1.15, "#ffd18d"]].map(([x, y, tint]) => <group key={String(x)} position={[Number(x), Number(y), -1.55]}>
      <mesh><cylinderGeometry args={[0.18, 0.2, 0.48, 16]} /><meshPhysicalMaterial color="#ffe4bc" transparent opacity={0.58} roughness={0.22} emissive={String(tint)} emissiveIntensity={0.6} /></mesh>
      <mesh position={[0, 0.29, 0]}><coneGeometry args={[0.23, 0.14, 5]} /><meshStandardMaterial color="#d9a975" metalness={0.48} roughness={0.34} /></mesh>
      <mesh position={[0, -0.29, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.12, 5]} /><meshStandardMaterial color="#d9a975" metalness={0.48} roughness={0.34} /></mesh>
      <pointLight color={String(tint)} intensity={1.15} distance={3.8} />
    </group>)}
    <RoundedBox args={[10.4, 0.18, 1.35]} radius={0.06} smoothness={3} position={[0, -1.29, -0.5]} receiveShadow castShadow>
      <meshPhysicalMaterial color="#e7c8d8" roughness={0.68} clearcoat={0.18} />
    </RoundedBox>
    <RoundedBox args={[10.9, 0.14, 0.68]} radius={0.05} smoothness={3} position={[0, -1.34, 0.06]} receiveShadow castShadow>
      <meshPhysicalMaterial color="#d9b9d0" roughness={0.72} />
    </RoundedBox>
    <RoundedBox args={[11.4, 0.12, 0.55]} radius={0.05} smoothness={3} position={[0, -1.4, 0.52]} receiveShadow castShadow>
      <meshPhysicalMaterial color="#c8a4c3" roughness={0.74} />
    </RoundedBox>
    {[-5.7, 5.7].map((x, side) => <group key={x} position={[x, -1.05, -0.2]}>
      {Array.from({ length: 4 }, (_, i) => <group key={i} position={[-side * 0.12, i * 0.48, 0]}><Flower color={["#ed76ac", "#ffb1ce", "#ffdba1", "#d987ca"][i]} scale={0.92} /></group>)}
    </group>)}
  </>;
}

function WishFestivalEnvironment({ portrait, wishComplete, reducedMotion }: { portrait: boolean; wishComplete: boolean; reducedMotion: boolean }) {
  const count = portrait ? 9 : 17;
  const garlandWidth = portrait ? 4.7 : 9.6;
  const flowerSide = portrait ? 1.85 : 5.05;
  const flagColors = ["#ff89ba", "#d8a3ed", "#ffe3a2", "#ffc1d8", "#bca0ef"];
  return <>
    <MysteryCastle portrait={portrait} />
    <MysteryGardenTrees portrait={portrait} />
    <MysteryCobblestones />
    <group position={[0, 2.55, -1.8]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.013, 0.013, garlandWidth, 8]} /><meshStandardMaterial color="#dca66a" metalness={0.45} roughness={0.45} /></mesh>
      {Array.from({ length: count }, (_, index) => {
        const progress = index / (count - 1);
        const x = (progress - 0.5) * garlandWidth;
        const sag = Math.sin(progress * Math.PI) * 0.28;
        return <group key={index} position={[x, -sag, 0.03]}>
          <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.14, 0.25, 3]} /><meshPhysicalMaterial color={flagColors[index % flagColors.length]} roughness={0.42} clearcoat={0.38} /></mesh>
          <mesh position={[0, 0.035, 0.04]} scale={0.047}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color={index % 2 ? "#fff1c4" : "#fff4fa"} toneMapped={false} /></mesh>
          {index % 4 === 0 && <pointLight position={[0, 0.04, 0.07]} color={index % 2 ? "#ffd68e" : "#ff9dce"} intensity={0.4} distance={2.2} />}
        </group>;
      })}
    </group>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * flowerSide, -1.12, 1.1]} scale={[1.35, 0.48, 0.58]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#54705e" roughness={0.92} /></mesh>
      {Array.from({ length: portrait ? 5 : 8 }, (_, index) => {
        const spread = portrait ? 0.2 : 0.25;
        const x = side * (flowerSide - index * spread);
        const y = -1.02 + Math.sin(index * 1.3) * 0.16;
        return <group key={index} position={[x, y, 1.52 + (index % 2) * 0.05]} scale={(portrait ? 0.48 : 0.78) + (index % 3) * 0.08}>
          <Flower color={["#ff8dbd", "#ffd5e4", "#d895df", "#ffe3a2"][index % 4]} />
        </group>;
      })}
    </group>)}
    {[-4.1, 4.1].map((x, index) => <group key={x} position={[x, 2.05, -1.05]}>
      <Sparkles count={wishComplete ? 24 : 8} scale={wishComplete ? 0.85 : 0.5} size={wishComplete ? 3 : 1.8} speed={reducedMotion ? 0 : wishComplete ? 0.9 : 0.22} opacity={wishComplete ? 0.9 : 0.4} color={["#ffb0d4", "#ffe5a2"][index]} />
      {wishComplete && <pointLight color={["#ff9ecb", "#ffd17d"][index]} intensity={1.5} distance={4} />}
    </group>)}
  </>;
}

function envelopeTriangle(points: [number, number][]) {
  const shape = new Shape();
  points.forEach(([x, y], index) => index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
  shape.closePath();
  return new ShapeGeometry(shape);
}

function Envelope({ opened, portrait }: { opened: boolean; portrait: boolean }) {
  const topFlap = useRef<Group>(null);
  const letter = useRef<Group>(null);
  const seal = useRef<Group>(null);
  const leftFlapGeometry = useMemo(() => envelopeTriangle([[-1.2, -0.82], [0, 0], [-1.2, 0.82]]), []);
  const rightFlapGeometry = useMemo(() => envelopeTriangle([[1.2, -0.82], [0, 0], [1.2, 0.82]]), []);
  const bottomFlapGeometry = useMemo(() => envelopeTriangle([[-1.2, -0.82], [1.2, -0.82], [0, 0.06]]), []);
  const topFlapGeometry = useMemo(() => envelopeTriangle([[-1.2, 0], [1.2, 0], [0, -0.9]]), []);
  useFrame((_, delta) => {
    if (topFlap.current) topFlap.current.rotation.x = MathUtils.damp(topFlap.current.rotation.x, opened ? Math.PI * 0.82 : 0, 4.2, delta);
    if (letter.current) {
      letter.current.position.y = MathUtils.damp(letter.current.position.y, opened ? 0.12 : -0.3, 3.3, delta);
      letter.current.position.z = MathUtils.damp(letter.current.position.z, opened ? 0.28 : -0.03, 3.3, delta);
      letter.current.scale.y = MathUtils.damp(letter.current.scale.y, opened ? 1 : 0.045, 3.6, delta);
    }
    if (seal.current) seal.current.scale.setScalar(MathUtils.damp(seal.current.scale.x, opened ? 0.04 : 1, 5.5, delta));
  });

  return <group position={[0.08, -0.12, 0.72]} rotation={[0, 0, -0.045]} scale={portrait ? 0.9 : 1.15}>
    {/* The cream paper sits behind the folds, with a raised border and soft paper grain. */}
    <RoundedBox args={[2.55, 1.72, 0.2]} radius={0.1} smoothness={8} castShadow receiveShadow>
      <meshPhysicalMaterial color="#fff0e9" roughness={0.58} clearcoat={0.26} />
    </RoundedBox>
    <RoundedBox args={[2.39, 1.56, 0.07]} radius={0.065} smoothness={6} position={[0, 0, 0.12]}>
      <meshPhysicalMaterial color="#f9c6d7" roughness={0.52} clearcoat={0.22} />
    </RoundedBox>
    {/* The letter begins tucked behind the envelope and eases upward when opened. */}
    <group ref={letter} position={[0, -0.3, -0.03]} scale={[1, 0.045, 1]}>
      <RoundedBox args={[2.04, 1.65, 0.08]} radius={0.075} smoothness={6} position={[0, 0.4, 0]} castShadow>
        <meshPhysicalMaterial color="#fffaf1" roughness={0.78} />
      </RoundedBox>
      <mesh position={[0, 0.98, 0.052]}><planeGeometry args={[1.4, 0.025]} /><meshBasicMaterial color="#efbdd0" /></mesh>
      <mesh position={[0, 0.84, 0.052]}><planeGeometry args={[1.1, 0.018]} /><meshBasicMaterial color="#e8c7d1" /></mesh>
      <mesh position={[0, 0.7, 0.052]}><planeGeometry args={[1.25, 0.018]} /><meshBasicMaterial color="#e8c7d1" /></mesh>
      <group position={[0, 0.18, 0.06]}><HeartShape color="#e989ae" size={0.18} /></group>
    </group>
    {/* Folded side and lower flaps add the layered-paper construction. */}
    <mesh geometry={leftFlapGeometry} position={[0, 0, 0.18]}><meshStandardMaterial color="#f3a9c5" roughness={0.48} side={2} /></mesh>
    <mesh geometry={rightFlapGeometry} position={[0, 0, 0.185]}><meshStandardMaterial color="#f6b6cc" roughness={0.47} side={2} /></mesh>
    <mesh geometry={bottomFlapGeometry} position={[0, 0, 0.2]}><meshStandardMaterial color="#f7c0d3" roughness={0.44} side={2} /></mesh>
    {/* The top flap pivots from its fold line instead of rotating around its centre. */}
    <group ref={topFlap} position={[0, 0.82, 0.22]}>
      <mesh geometry={topFlapGeometry} castShadow><meshPhysicalMaterial color="#ed91b4" roughness={0.42} clearcoat={0.38} side={2} /></mesh>
      <mesh position={[0, -0.4, 0.018]}><HeartShape color="#ffbad0" size={0.15} /></mesh>
    </group>
    <group ref={seal} position={[0, 0.01, 0.27]}>
      <mesh><circleGeometry args={[0.28, 40]} /><meshPhysicalMaterial color="#cf4778" roughness={0.32} clearcoat={0.72} emissive="#f05b93" emissiveIntensity={opened ? 0.75 : 0.12} /></mesh>
      <mesh position={[0, 0, 0.045]}><HeartShape color="#ff9fbe" size={0.38} /></mesh>
      <mesh position={[0, 0, 0.08]}><HeartShape color="#d84c82" size={0.27} /></mesh>
      <mesh position={[0, 0, 0.1]}><HeartShape color="#f987ad" size={0.18} /></mesh>
    </group>
    <group position={[-0.91, 0.5, 0.23]} scale={0.4}><Flower color="#f28db5" /></group>
    <group position={[-0.93, -0.48, 0.23]} scale={0.42}><Flower color="#e97ead" /></group>
    <group position={[0.93, -0.48, 0.23]} scale={0.42}><Flower color="#e97ead" /></group>
    {opened && <><Sparkles count={24} scale={[2.7, 2.4, 0.35]} size={2.5} speed={0.55} color="#ffe5a6" opacity={0.9} /><pointLight position={[0, 0.85, 0.4]} color="#ffd8a0" intensity={1.4} distance={4} /></>}
  </group>;
}

function CakeTier({ radius, height, y, color }: { radius: number; height: number; y: number; color: string }) {
  const top = y + height / 2;
  return <group>
    <mesh position={[0, y, 0]} castShadow receiveShadow><cylinderGeometry args={[radius * 0.96, radius, height, 64]} /><meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.35} /></mesh>
    <mesh position={[0, top - 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 0.9, 0.075, 12, 64]} /><meshPhysicalMaterial color="#fff0ec" roughness={0.28} clearcoat={0.4} /></mesh>
    <mesh position={[0, y - height * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 0.985, 0.055, 10, 64]} /><meshPhysicalMaterial color="#fff4ed" roughness={0.3} clearcoat={0.34} /></mesh>
    {Array.from({ length: 16 }, (_, i) => {
      const angle = i * Math.PI * 2 / 16;
      const x = Math.cos(angle) * radius * 0.92;
      const z = Math.sin(angle) * radius * 0.92;
      return <group key={i} position={[x, top - 0.13, z]}>
        <mesh scale={[0.075, 0.17, 0.075]}><sphereGeometry args={[1, 18, 14]} /><meshPhysicalMaterial color="#fff0ec" roughness={0.3} /></mesh>
        <mesh position={[0, -0.14, 0]} scale={0.055}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={["#ffbed4", "#fff0a9", "#f9f3ff"][i % 3]} roughness={0.28} /></mesh>
      </group>;
    })}
    {Array.from({ length: 12 }, (_, i) => {
      const angle = i * Math.PI * 2 / 12;
      return <mesh key={`pearl-${i}`} position={[Math.cos(angle) * radius * 0.82, y, Math.sin(angle) * radius * 0.82]} scale={0.065}>
        <sphereGeometry args={[1, 18, 14]} /><meshPhysicalMaterial color={["#fff2b7", "#f07da9", "#fffaf1"][i % 3]} roughness={0.24} clearcoat={0.4} />
      </mesh>;
    })}
  </group>;
}

function CandleFlame({ index, extinguished, smokeActive }: { index: number; extinguished: boolean; smokeActive: boolean }) {
  const flame = useRef<Group>(null);
  const glow = useRef<PointLight>(null);
  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime * 12 + index * 1.7;
    const flicker = 1 + Math.sin(time) * 0.09 + Math.sin(time * 0.57) * 0.06;
    if (flame.current) {
      const target = extinguished ? 0.001 : flicker;
      flame.current.scale.x = MathUtils.damp(flame.current.scale.x, target, extinguished ? 6 : 18, delta);
      flame.current.scale.y = MathUtils.damp(flame.current.scale.y, extinguished ? 0.001 : flicker, extinguished ? 6 : 18, delta);
      flame.current.rotation.z = Math.sin(time * 0.45) * 0.08;
    }
    if (glow.current) glow.current.intensity = MathUtils.damp(glow.current.intensity, extinguished ? 0 : 0.24 + flicker * 0.12, 4.5, delta);
  });

  // Seat the flame directly on the candle wick (the candle top is +0.19).
  return <group position={[0, 0.19, 0]}>
    <group ref={flame}>
      <mesh position={[0, 0.1, 0]}><coneGeometry args={[0.062, 0.2, 14]} /><meshBasicMaterial color="#ff9d50" /></mesh>
      <mesh position={[0, 0.075, 0.026]}><coneGeometry args={[0.034, 0.13, 12]} /><meshBasicMaterial color="#fff2ad" /></mesh>
    </group>
    <pointLight ref={glow} position={[0, 0.12, 0.08]} color="#ffc36f" intensity={0.34} distance={1.8} />
    {smokeActive && <SmokeWisp index={index} />}
  </group>;
}

function SmokeWisp({ index }: { index: number }) {
  const wisp = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * 0.72 + index * 0.19) % 1;
    if (wisp.current) {
      wisp.current.position.y = 0.18 + phase * 0.56;
      wisp.current.position.x = Math.sin(phase * Math.PI * 2 + index) * 0.045;
      wisp.current.scale.setScalar(0.05 + phase * 0.12);
    }
    if (material.current) material.current.opacity = Math.sin(phase * Math.PI) * 0.42;
  });
  return <group ref={wisp}><mesh><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial ref={material} color="#fff8f5" transparent depthWrite={false} /></mesh></group>;
}

function Cake({ candlesOut, smokeActive, portrait, compactPhone, finale = false }: { candlesOut: boolean; smokeActive: boolean; portrait: boolean; compactPhone: boolean; finale?: boolean }) {
  const candleXs = [-0.56, -0.38, -0.19, 0, 0.19, 0.38, 0.56];
  const position: [number, number, number] = finale
    ? compactPhone ? [0.75, -1.32, 0.42] : portrait ? [0.92, -1.3, 0.22] : [2.9, -1.3, 0.16]
    : compactPhone ? [0.59, -0.84, 0.1] : portrait ? [0.3, -0.84, 0.1] : [1.35, -1.12, 0.1];
  const scale = finale ? compactPhone ? 0.38 : portrait ? 0.48 : 0.68 : compactPhone ? 0.52 : portrait ? 0.65 : 1.28;
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.06, 0]} castShadow><cylinderGeometry args={[1.58, 1.62, 0.12, 64]} /><meshPhysicalMaterial color="#f7dce4" roughness={0.3} clearcoat={0.35} /></mesh>
    <CakeTier radius={1.42} height={0.76} y={0.47} color="#ffc4d7" />
    <CakeTier radius={0.94} height={0.68} y={1.16} color="#ffe0e6" />
    {Array.from({ length: 8 }, (_, i) => {
      const angle = i * Math.PI * 2 / 8;
      return <group key={`cake-flower-${i}`} position={[Math.cos(angle) * 0.83, 0.98, Math.sin(angle) * 0.83]} scale={0.36}><Flower color={i % 2 ? "#f07ca7" : "#ffabc9"} /></group>;
    })}
    {candleXs.map((x, i) => <group key={`candle-${i}`} position={[x, 1.53, (i % 2) * 0.1]}>
      <mesh castShadow><cylinderGeometry args={[0.034, 0.04, 0.38, 18]} /><meshPhysicalMaterial color={i % 2 ? "#e985ad" : "#fff0b2"} roughness={0.32} /></mesh>
      <mesh position={[0, 0.19, 0]}><cylinderGeometry args={[0.008, 0.008, 0.045, 8]} /><meshStandardMaterial color="#68434b" /></mesh>
      <CandleFlame index={i} extinguished={candlesOut} smokeActive={smokeActive} />
    </group>)}
  </group>;
}

function BirthdayBalloon({ position, color, scale = 1, index }: { position: [number, number, number]; color: string; scale?: number; index: number }) {
  return <Float speed={0.38 + index * 0.08} floatIntensity={0.18} rotationIntensity={0.12}>
    <group position={position} scale={scale}>
      <mesh scale={[0.37, 0.48, 0.3]} castShadow><sphereGeometry args={[1, 40, 28]} /><meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.78} metalness={0.03} /></mesh>
      <mesh position={[-0.12, 0.17, 0.22]} scale={[0.07, 0.12, 0.025]} rotation={[0, 0, -0.35]}><sphereGeometry args={[1, 20, 16]} /><meshBasicMaterial color="#fff5fa" transparent opacity={0.42} /></mesh>
      <mesh position={[0, -0.52, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.075, 0.15, 8]} /><meshStandardMaterial color={color} roughness={0.32} /></mesh>
      <mesh position={[0.035, -1.07, -0.02]} rotation={[0, 0, -0.05]}><cylinderGeometry args={[0.004, 0.007, 0.98, 6]} /><meshStandardMaterial color="#f6d5dd" roughness={0.55} /></mesh>
    </group>
  </Float>;
}

function BirthdayHeartBalloon({ position, color, scale = 1, index }: { position: [number, number, number]; color: string; scale?: number; index: number }) {
  return <Float speed={0.34 + index * 0.08} floatIntensity={0.16} rotationIntensity={0.06}>
    <group position={position} scale={scale}>
      <HeartShape color={color} size={0.52} />
      <mesh position={[0, -0.56, -0.015]}><coneGeometry args={[0.055, 0.11, 8]} /><meshStandardMaterial color={color} roughness={0.32} /></mesh>
      <mesh position={[0.015, -0.92, -0.025]}><cylinderGeometry args={[0.004, 0.006, 0.65, 6]} /><meshStandardMaterial color="#ffe8dc" roughness={0.54} /></mesh>
      <mesh position={[-0.12, 0.23, 0.04]} scale={[0.045, 0.09, 0.018]} rotation={[0, 0, -0.34]}><sphereGeometry args={[1, 18, 12]} /><meshBasicMaterial color="#fff7fb" transparent opacity={0.62} /></mesh>
    </group>
  </Float>;
}

function GiftBox({ position, color, scale = 1, birthdayDetails = false }: { position: [number, number, number]; color: string; scale?: number; birthdayDetails?: boolean }) {
  return <group position={position} scale={scale}>
    <RoundedBox args={[1.45, 1.05, 1.1]} radius={0.1} smoothness={5} castShadow receiveShadow><meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.46} /></RoundedBox>
    <mesh position={[0, 0, 0.56]}><boxGeometry args={[0.16, 1.08, 0.035]} /><meshStandardMaterial color="#ffe5a8" metalness={0.28} roughness={0.28} /></mesh>
    {birthdayDetails && <mesh position={[0, 0.05, 0.575]}><boxGeometry args={[1.42, 0.12, 0.04]} /><meshStandardMaterial color="#ffe5a8" metalness={0.22} roughness={0.32} /></mesh>}
    <mesh position={[0, -0.01, 0]}><boxGeometry args={[1.48, 0.15, 1.12]} /><meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.48} /></mesh>
    <mesh position={[0, 0.59, 0]}><boxGeometry args={[1.58, 0.13, 1.22]} /><meshStandardMaterial color="#f4a1c6" roughness={0.3} /></mesh>
    {birthdayDetails ? <>
      <mesh position={[-0.18, 0.79, 0]} rotation={[0, 0, -0.5]}><torusGeometry args={[0.2, 0.045, 10, 28]} /><meshStandardMaterial color="#ffe2a2" metalness={0.32} /></mesh>
      <mesh position={[0.18, 0.79, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.2, 0.045, 10, 28]} /><meshStandardMaterial color="#ffe2a2" metalness={0.32} /></mesh>
      <mesh position={[0, 0.81, 0.02]} scale={0.085}><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#fff0b4" metalness={0.25} roughness={0.3} /></mesh>
      <group position={[0, 0.08, 0.61]}><HeartShape color="#ffe8af" size={0.2} /></group>
    </> : <>
      <mesh position={[0, 0.79, 0]}><torusGeometry args={[0.21, 0.055, 10, 28]} /><meshStandardMaterial color="#ffe2a2" metalness={0.32} /></mesh>
      <mesh position={[0.28, 0.8, 0]} rotation={[0, 0, -0.4]}><torusGeometry args={[0.21, 0.05, 10, 28]} /><meshStandardMaterial color="#ffe2a2" metalness={0.32} /></mesh>
    </>}
  </group>;
}

function FinaleGift({ stage, portrait, reducedMotion }: { stage: "waiting" | "opening" | "celebrating" | "replaying"; portrait: boolean; reducedMotion: boolean }) {
  const lid = useRef<Group>(null);
  const bow = useRef<Group>(null);
  const glow = useRef<PointLight>(null);
  const open = stage === "opening" || stage === "celebrating";
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const amount = open ? 1 : 0;
    if (lid.current) {
      lid.current.rotation.x = reducedMotion ? (amount ? -1.2 : 0) : MathUtils.damp(lid.current.rotation.x, amount ? -1.2 : 0, amount ? 2.8 : 4.4, delta);
      lid.current.rotation.z = reducedMotion ? 0 : MathUtils.damp(lid.current.rotation.z, amount ? -0.08 : 0, 3.2, delta);
    }
    if (bow.current) bow.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 2.2) * (open ? 0.045 : 0.018);
    if (glow.current) glow.current.intensity = MathUtils.damp(glow.current.intensity, open ? 2.5 : 0.16, 2.6, delta);
  });
  return <group position={portrait ? [-0.45, -1.31, 0.48] : [-2.18, -1.31, 0.42]} scale={portrait ? 0.87 : 1.22}>
    <RoundedBox args={[2.72, 1.54, 1.82]} radius={0.13} smoothness={8} position={[0, 0.76, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#f184b7" roughness={0.3} clearcoat={0.58} clearcoatRoughness={0.24} />
    </RoundedBox>
    <mesh position={[0, 0.76, 0.925]}><boxGeometry args={[0.24, 1.5, 0.045]} /><meshPhysicalMaterial color="#ffe4a7" metalness={0.16} roughness={0.26} clearcoat={0.6} /></mesh>
    <mesh position={[0, 0.7, 0.95]}><boxGeometry args={[2.66, 0.18, 0.055]} /><meshPhysicalMaterial color="#ffe4a7" metalness={0.16} roughness={0.26} clearcoat={0.6} /></mesh>
    <group position={[-0.78, 0.78, 0.96]} scale={0.72}><Flower color="#ffd0e2" /></group>
    <group position={[0.78, 0.78, 0.96]} scale={0.72}><Flower color="#ffd0e2" /></group>
    <group ref={lid} position={[0, 1.52, -0.82]}>
      <group position={[0, 0, 0.82]}>
        <RoundedBox args={[2.92, 0.2, 2.02]} radius={0.1} smoothness={7} castShadow receiveShadow>
          <meshPhysicalMaterial color="#ff9bc7" roughness={0.27} clearcoat={0.72} />
        </RoundedBox>
        <mesh position={[0, 0.108, 0]}><boxGeometry args={[0.26, 0.035, 2]} /><meshStandardMaterial color="#ffe4a7" metalness={0.18} roughness={0.26} /></mesh>
        <mesh position={[0, 0.108, 0]}><boxGeometry args={[2.9, 0.035, 0.22]} /><meshStandardMaterial color="#ffe4a7" metalness={0.18} roughness={0.26} /></mesh>
        <group ref={bow} position={[0, 0.23, 0.15]}>
          <mesh position={[-0.24, 0.12, 0]} rotation={[0, 0, -0.5]} scale={[0.34, 0.2, 0.1]}><sphereGeometry args={[1, 28, 20]} /><meshPhysicalMaterial color="#f777b1" roughness={0.25} clearcoat={0.72} /></mesh>
          <mesh position={[0.24, 0.12, 0]} rotation={[0, 0, 0.5]} scale={[0.34, 0.2, 0.1]}><sphereGeometry args={[1, 28, 20]} /><meshPhysicalMaterial color="#f777b1" roughness={0.25} clearcoat={0.72} /></mesh>
          <mesh position={[0, 0.02, 0.08]} scale={[0.14, 0.13, 0.12]}><sphereGeometry args={[1, 24, 18]} /><meshPhysicalMaterial color="#ffe8ad" roughness={0.2} metalness={0.14} /></mesh>
          <mesh position={[0, -0.16, 0.04]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.13, 0.42, 5]} /><meshPhysicalMaterial color="#ffd6e8" roughness={0.28} clearcoat={0.5} /></mesh>
        </group>
      </group>
    </group>
    <group position={[0, 1.08, 0.96]}><HeartShape color="#ffe8af" size={0.3} /></group>
    <pointLight ref={glow} position={[0, 1.7, 0.2]} color="#ffd58f" intensity={0.16} distance={5} />
    {open && <Sparkles count={reducedMotion ? 16 : 42} scale={[3.4, 3, 2.5]} size={3} speed={reducedMotion ? 0 : 0.7} color="#ffe8ae" opacity={0.9} />}
  </group>;
}

function FinalePanda({ stage, cycle, portrait, reducedMotion }: { stage: "waiting" | "opening" | "celebrating" | "replaying"; cycle: number; portrait: boolean; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const startedAt = useRef(0);
  const token = useRef("");
  useFrame(({ clock }, delta) => {
    const key = `${stage}-${cycle}`;
    if (token.current !== key) { token.current = key; startedAt.current = clock.elapsedTime; }
    if (!group.current) return;
    const elapsed = clock.elapsedTime - startedAt.current;
    group.current.visible = stage !== "waiting" && stage !== "replaying";
    let targetY = -2.05;
    if (stage === "opening") {
      const rise = MathUtils.clamp(elapsed / 1.5, 0, 1);
      const eased = rise * rise * (3 - 2 * rise);
      const hop = !reducedMotion && elapsed > 0.72 && elapsed < 1.5 ? Math.sin(((elapsed - 0.72) / 0.78) * Math.PI) * 0.52 : 0;
      targetY = -2.05 + eased * 2.22 + hop;
    } else if (stage === "celebrating") {
      targetY = 0.17 + (reducedMotion ? 0 : Math.abs(Math.sin(elapsed * 4.2)) * 0.075);
    }
    group.current.position.y = reducedMotion ? targetY : MathUtils.damp(group.current.position.y, targetY, stage === "opening" ? 3.1 : 4.2, delta);
    group.current.rotation.z = reducedMotion ? 0 : MathUtils.damp(group.current.rotation.z, stage === "celebrating" ? Math.sin(elapsed * 3.1) * 0.06 : 0, 3, delta);
  });
  return <group ref={group} position={portrait ? [-0.42, -2.05, 1.72] : [-2.18, -2.05, 1.72]} scale={portrait ? 0.57 : 0.86}><PandaController /></group>;
}

function FinaleCastle({ portrait, celebrating }: { portrait: boolean; celebrating: boolean }) {
  const towers = portrait
    ? [{ x: -1.55, h: 1.9 }, { x: -0.82, h: 2.45 }, { x: 0, h: 2.85 }, { x: 0.82, h: 2.4 }, { x: 1.55, h: 1.9 }]
    : [{ x: -3.65, h: 2.5 }, { x: -2.15, h: 3.25 }, { x: 0, h: 3.8 }, { x: 2.15, h: 3.25 }, { x: 3.65, h: 2.5 }];
  return <group position={[0, -0.55, -4.35]} scale={portrait ? 0.72 : 1}>
    <mesh position={[0, 0.3, 0]}><boxGeometry args={[portrait ? 3.75 : 8.4, 1.8, 0.7]} /><meshStandardMaterial color="#9a73b8" roughness={0.72} /></mesh>
    <mesh position={[0, -0.57, 0.08]}><boxGeometry args={[portrait ? 4.6 : 9.1, 0.18, 1]} /><meshStandardMaterial color="#e6a8d2" emissive="#b75b9c" emissiveIntensity={celebrating ? 0.35 : 0.12} /></mesh>
    {towers.map(({ x, h }, i) => <group key={x} position={[x, 0.4 + h / 2, 0.05]}>
      <mesh castShadow><cylinderGeometry args={[0.35, 0.43, h, 12]} /><meshStandardMaterial color={i % 2 ? "#e6a7d5" : "#c798df"} roughness={0.48} /></mesh>
      <mesh position={[0, h / 2 + 0.16, 0]}><coneGeometry args={[0.49, 0.62, 8]} /><meshStandardMaterial color={i % 2 ? "#bd67bd" : "#956dc8"} roughness={0.36} metalness={0.08} /></mesh>
      <mesh position={[0, -0.06, 0.365]}><planeGeometry args={[0.15, Math.min(0.72, h * 0.44)]} /><meshBasicMaterial color="#ffe3a1" /></mesh>
      <mesh position={[0, -0.06, 0.38]}><planeGeometry args={[0.21, Math.min(0.78, h * 0.47)]} /><meshBasicMaterial color="#ffd17c" transparent opacity={celebrating ? 0.25 : 0.12} /></mesh>
      <mesh position={[0.33, h / 2 + 0.52, 0]}><boxGeometry args={[0.48, 0.28, 0.025]} /><meshStandardMaterial color={i % 2 ? "#ff91bd" : "#ffd784"} side={2} /></mesh>
      <pointLight position={[0, 0, 0.7]} color="#ffcf91" intensity={celebrating ? 1.4 : 0.55} distance={2.8} />
    </group>)}
    <pointLight position={[0, 1.35, 1.3]} color="#ffb2d8" intensity={celebrating ? 1.8 : 0.75} distance={9} />
  </group>;
}

function FinaleFireworks({ active, portrait, reducedMotion }: { active: boolean; portrait: boolean; reducedMotion: boolean }) {
  const bursts = useRef<Group[]>([]);
  useFrame(({ clock }) => {
    bursts.current.forEach((burst, index) => {
      if (!burst) return;
      burst.visible = active && !reducedMotion && ((clock.elapsedTime + index * 0.82) % 3.4) < 2.25;
      const phase = (clock.elapsedTime + index * 0.82) % 3.4;
      const scale = phase < 0.45 ? 0.25 + phase * 1.8 : Math.max(0.08, 1.05 - (phase - 0.45) * 0.52);
      burst.scale.setScalar(scale);
      burst.rotation.z = phase * 0.18;
    });
  });
  const positions: [number, number, number][] = portrait ? [[-1.8, 2.1, -1.2], [1.85, 2.35, -1.4], [0, 2.9, -2.1]] : [[-4.4, 2.35, -1.8], [4.35, 2.65, -1.7], [0.2, 3.1, -2.5]];
  const colors = ["#ff9bc9", "#c8a1ff", "#ffe29b"];
  return <>
    {positions.map((position, index) => <group key={index} ref={(node) => { if (node) bursts.current[index] = node; }} position={position}>
      <Sparkles count={reducedMotion ? 0 : portrait ? 17 : 28} scale={0.8} size={4} speed={0.55} color={colors[index]} opacity={0.95} />
      {Array.from({ length: 8 }, (_, ray) => <mesh key={ray} position={[Math.cos(ray * Math.PI / 4) * 0.45, Math.sin(ray * Math.PI / 4) * 0.45, 0]} scale={0.045}>
        <sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color={colors[index]} />
      </mesh>)}
      <pointLight color={colors[index]} intensity={2} distance={3} />
    </group>)}
  </>;
}

function ConfettiRain({ active, reducedMotion, portrait }: { active: boolean; reducedMotion: boolean; portrait: boolean }) {
  const pieces = useRef<Group[]>([]);
  const palette = ["#ff82b5", "#ffe2a0", "#c3a0ff", "#fff3f7", "#f5a8d1"];
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    pieces.current.forEach((piece, index) => {
      if (!piece) return;
      piece.visible = active;
      if (!active || reducedMotion) return;
      piece.position.y = 3.1 - ((time * (0.42 + (index % 4) * 0.08) + index * 0.43) % 5.4);
      piece.position.x = Number(piece.userData.baseX ?? 0) + Math.sin(time * 1.2 + index * 1.7) * 0.16;
      piece.rotation.x = time * (0.8 + index % 3) + index;
      piece.rotation.y = time * (1.1 + index % 2) + index * 0.5;
    });
  });
  return <group position={[0, 0, 1.65]}>
    {Array.from({ length: portrait ? 32 : 56 }, (_, index) => <group key={index} ref={(node) => { if (node) pieces.current[index] = node; }} userData={{ baseX: (index % 14 - 7) * 0.72 }} position={[(index % 14 - 7) * 0.72, 3 - (index % 9) * 0.52, 0]}>
      <mesh><boxGeometry args={[0.055 + (index % 3) * 0.018, 0.1 + (index % 4) * 0.025, 0.018]} /><meshBasicMaterial color={palette[index % palette.length]} /></mesh>
    </group>)}
  </group>;
}

function SceneObjects({ scene, opened, wishMade, candlesOut, wishComplete, finaleStage, reducedMotion, selectedDoor, portrait, compactPhone, exploredDoors, hoveredDoor }: { scene: StoryScene; opened: boolean; wishMade: boolean; candlesOut: boolean; wishComplete: boolean; finaleStage: "waiting" | "opening" | "celebrating" | "replaying"; reducedMotion: boolean; selectedDoor: number | null; portrait: boolean; compactPhone: boolean; exploredDoors: number[]; hoveredDoor: number | null }) {
  const balloons: { position: [number, number, number]; color: string; scale: number }[] = portrait
    ? scene === 4
      ? [
        { position: [-1.92, 2.72, -2.3], color: "#f08cb5", scale: 0.46 }, { position: [-1.82, 2.08, -2.4], color: "#ffd29a", scale: 0.35 },
        { position: [1.9, 2.62, -2.35], color: "#b78be0", scale: 0.46 }, { position: [1.82, 2.02, -2.5], color: "#ffadca", scale: 0.36 },
      ]
      : [
      { position: [-1.7, 1.55, -0.2], color: "#f08cb5", scale: 0.8 }, { position: [-1.85, 0.55, -0.4], color: "#ffd29a", scale: 0.64 },
      { position: [1.68, 1.5, -0.4], color: "#b78be0", scale: 0.8 }, { position: [1.85, 0.5, -0.5], color: "#ffadca", scale: 0.65 },
    ]
    : [
      { position: [-5.25, 1.8, -0.25], color: "#f08cb5", scale: 1.05 }, { position: [-4.35, 0.75, -0.45], color: "#ffd29a", scale: 0.82 },
      { position: [5.45, 2.15, -0.45], color: "#b78be0", scale: 1.04 }, { position: [5.45, 0.65, -0.5], color: "#ffadca", scale: 0.82 },
    ];
  return <>
    {(scene === 3 || scene === 5) && <ComplimentHearts />}
    {scene === 4 && <>
      <SecretDoor x={portrait ? -1.12 : -2.36} scale={portrait ? 0.62 : 1.08} color="#e77bad" icon="heart" index={0} opened={exploredDoors.includes(0)} selected={selectedDoor === 0} hovered={hoveredDoor === 0} />
      <SecretDoor x={0} scale={portrait ? 0.62 : 1.08} color="#9671ce" icon="heart" index={1} opened={exploredDoors.includes(1)} selected={selectedDoor === 1} hovered={hoveredDoor === 1} />
      <SecretDoor x={portrait ? 1.12 : 2.36} scale={portrait ? 0.62 : 1.08} color="#72ace0" icon="heart" index={2} opened={exploredDoors.includes(2)} selected={selectedDoor === 2} hovered={hoveredDoor === 2} />
    </>}
    {scene === 5 && <>
      <Envelope opened={opened} portrait={portrait} />
      <Float speed={0.5} floatIntensity={0.12}><group position={[0.1, 1.13, 0.2]}><HeartShape color="#ffd69a" size={0.2} /></group></Float>
    </>}
    {scene === 6 && <>
      <Cake candlesOut={candlesOut} smokeActive={candlesOut && !wishComplete} portrait={portrait} compactPhone={compactPhone} />
      {balloons.map((balloon, i) => <BirthdayBalloon key={`balloon-${i}`} index={i} {...balloon} />)}
      <BirthdayHeartBalloon position={portrait ? [-2.35, 2.18, -0.75] : [-4.05, 2.66, -0.8]} color="#f17db6" scale={portrait ? 0.75 : 1.08} index={0} />
      <BirthdayHeartBalloon position={portrait ? [2.32, 2.36, -0.85] : [4.25, 2.3, -0.9]} color="#b886e8" scale={portrait ? 0.65 : 0.92} index={1} />
      <GiftBox position={portrait ? [-1.65, -1.22, 0.35] : [-3.35, -1.2, 0.35]} color="#9c70c4" scale={portrait ? 0.38 : 0.72} birthdayDetails />
      <GiftBox position={portrait ? [1.65, -1.2, 0.2] : [4, -1.18, 0.2]} color="#f18bb6" scale={portrait ? 0.4 : 0.78} birthdayDetails />
      <ConfettiRain active={wishComplete} reducedMotion={reducedMotion} portrait={portrait} />
      {wishMade && <Sparkles count={wishComplete ? 42 : 18} scale={[5.6, 4.2, 3.2]} size={wishComplete ? 3 : 2} speed={0.28} opacity={0.72} color={wishComplete ? "#ffd5ec" : "#ffe6b1"} />}
    </>}
    {scene === 7 && <>
      <FinaleGift stage={finaleStage} portrait={portrait} reducedMotion={reducedMotion} />
      <Cake candlesOut={false} smokeActive={false} portrait={portrait} compactPhone={compactPhone} finale />
      <group position={[0, -1.48, 0.28]}>
        <mesh><cylinderGeometry args={[portrait ? 2.05 : 4.8, portrait ? 2.15 : 4.92, 0.22, 72]} /><meshPhysicalMaterial color="#d58ac0" roughness={0.32} clearcoat={0.6} /></mesh>
        <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[portrait ? 1.88 : 4.62, portrait ? 1.94 : 4.68, 0.08, 72]} /><meshStandardMaterial color="#ffe0a1" metalness={0.38} roughness={0.3} /></mesh>
      </group>
      <GiftBox position={portrait ? [-1.82, -1.18, 0.35] : [-5.05, -1.16, 0.35]} color="#9972ca" scale={portrait ? 0.32 : 0.72} />
      <GiftBox position={portrait ? [1.82, -1.18, 0.25] : [5.05, -1.17, 0.25]} color="#e69fc7" scale={portrait ? 0.34 : 0.74} />
      <Float speed={0.4} floatIntensity={0.12}><group position={portrait ? [-1.15, 2.45, 0.1] : [-3.45, 2.5, 0.1]}><StarShape /></group></Float>
      {balloons.map((balloon, index) => <BirthdayBalloon key={`finale-balloon-${index}`} index={index} {...balloon} />)}
      <ConfettiRain active={finaleStage === "celebrating"} reducedMotion={reducedMotion} portrait={portrait} />
      <FinaleFireworks active={finaleStage === "celebrating"} portrait={portrait} reducedMotion={reducedMotion} />
    </>}
  </>;
}

function World({ scene, opened, wishMade, candlesOut, wishComplete, finaleStage, finaleCycle, selectedDoor, exploredDoors, hoveredDoor }: { scene: StoryScene; opened: boolean; wishMade: boolean; candlesOut: boolean; wishComplete: boolean; finaleStage: "waiting" | "opening" | "celebrating" | "replaying"; finaleCycle: number; selectedDoor: number | null; exploredDoors: number[]; hoveredDoor: number | null }) {
  const { size, setDpr } = useThree();
  const reducedMotion = useBirthdayStore((state) => state.reducedMotion);
  const portrait = size.width < 900;
  const compactPhone = size.width < 430;
  useEffect(() => {
    setDpr(portrait ? 1 : size.width < 1200 ? 1.2 : 1.45);
  }, [portrait, setDpr, size.width]);
  const pandaPositions: Record<StoryScene, [number, number, number]> = {
    3: portrait ? [-0.12, -0.42, 0.5] : [-0.2, -0.68, 0.6],
    4: portrait ? [-1.58, -1.18, 1.55] : [-4.3, -1.06, 1.04],
    5: portrait ? [-1.08, -0.8, 0.6] : [-2.72, -0.3, 0.6],
    6: portrait ? (compactPhone ? [-0.82, -0.84, 1.05] : [-1.45, -0.84, 1]) : [-2.45, -0.3, 0.7],
    7: portrait ? [-0.6, -0.46, 0.65] : [-2.2, -0.15, 0.65],
  };
  const pandaScale: Record<StoryScene, number> = { 3: portrait ? 0.48 : 0.98, 4: portrait ? 0.48 : 0.72, 5: portrait ? 0.56 : 0.8, 6: portrait ? (compactPhone ? 0.58 : 0.62) : 0.72, 7: portrait ? 0.62 : 0.88 };
  return <>
    <DreiPerspectiveCamera makeDefault position={[0, 0.15, 9]} fov={portrait ? 52 : 41} />
    <color attach="background" args={["#50316f"]} />
    <ambientLight intensity={scene === 4 ? 0.95 : scene === 6 && wishMade && !wishComplete ? 1.02 : 1.25} color="#ffedf7" />
    <hemisphereLight intensity={scene === 4 ? 0.58 : scene === 6 && wishMade && !wishComplete ? 0.65 : 0.8} color="#fff0fa" groundColor="#805077" />
    <directionalLight position={[-4, 7, 5]} intensity={scene === 4 ? 1.65 : scene === 6 && wishMade && !wishComplete ? 1.65 : 2.15} color="#ffecd8" castShadow shadow-mapSize-width={portrait ? 512 : 1024} shadow-mapSize-height={portrait ? 512 : 1024} />
    <pointLight position={[-3.4, 1.8, 2]} intensity={scene === 6 && wishMade && !wishComplete ? 0.8 : 1.6} color="#ff9ecb" distance={7} />
    <pointLight position={[3.5, 1.7, 1]} intensity={scene === 6 && wishMade && !wishComplete ? 0.8 : 1.4} color="#c6a4ff" distance={7} />
    <CastleAndGarden scene={scene} reducedMotion={reducedMotion} />
    {scene === 7 && <FinaleCastle portrait={portrait} celebrating={finaleStage === "celebrating"} />}
    {scene === 4 && <>
      <MysteryClouds reducedMotion={reducedMotion} />
      <MysteryGardenTrees portrait={portrait} />
      <MysteryCastle portrait={portrait} />
      <MysteryPalace />
      <MysteryCobblestones />
    </>}
    {scene === 6 && <WishFestivalEnvironment portrait={portrait} wishComplete={wishComplete} reducedMotion={reducedMotion} />}
    {(scene === 3 || scene === 5 || scene === 7) && <ComplimentGardenBorder portrait={portrait} />}
    <SceneObjects scene={scene} opened={opened} wishMade={wishMade} candlesOut={candlesOut} wishComplete={wishComplete} finaleStage={finaleStage} reducedMotion={reducedMotion} selectedDoor={selectedDoor} portrait={portrait} compactPhone={compactPhone} exploredDoors={exploredDoors} hoveredDoor={hoveredDoor} />
    {scene === 7 ? <FinalePanda stage={finaleStage} cycle={finaleCycle} portrait={portrait} reducedMotion={reducedMotion} /> : <group position={pandaPositions[scene]} scale={pandaScale[scene]}><PandaController /></group>}
    <MagicalAtmosphere tint={scene === 4 ? "#d4a7ff" : scene === 6 ? "#ffc49e" : scene === 7 ? "#ffb4da" : "#ff9fc9"} reducedMotion={reducedMotion} portrait={portrait} />
    <Sparkles count={reducedMotion ? 18 : scene === 7 && finaleStage === "celebrating" ? portrait ? 80 : 135 : portrait ? 50 : 78} scale={[11, 6, 4]} size={scene === 7 && finaleStage === "celebrating" ? 2.7 : 2} speed={reducedMotion ? 0 : 0.14} opacity={0.68} color={scene === 6 && wishComplete ? "#ffd5ec" : scene === 7 && finaleStage === "celebrating" ? "#ffd5a3" : "#ffe7bd"} />
  </>;
}

export default function StoryWorld(props: { scene: StoryScene; opened: boolean; wishMade: boolean; candlesOut: boolean; wishComplete: boolean; finaleStage: "waiting" | "opening" | "celebrating" | "replaying"; finaleCycle: number; pageVisible: boolean; selectedDoor: number | null; exploredDoors: number[]; hoveredDoor: number | null }) {
  return <Canvas frameloop={props.pageVisible ? "always" : "never"} shadows dpr={[1, 1.5]} camera={{ position: [0, 0.15, 9], fov: 41 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
    <World {...props} />
  </Canvas>;
}
