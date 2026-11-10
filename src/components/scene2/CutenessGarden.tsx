"use client";

import { Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import { PointLight, Shape, ShapeGeometry } from "three";

function Flower({ color, scale = 1 }: { color: string; scale?: number }) {
  const petals = useMemo(() => Array.from({ length: 6 }, (_, index) => (index * Math.PI) / 3), []);
  return <group scale={scale}>
    <mesh position={[0, -0.22, -0.04]} scale={[0.045, 0.3, 0.045]}><cylinderGeometry args={[0.8, 1, 1, 8]} /><meshStandardMaterial color="#6f9d72" roughness={0.8} /></mesh>
    <mesh position={[-0.11, -0.22, 0]} rotation={[0, 0, 0.42]} scale={[0.18, 0.08, 0.035]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#8fb77d" roughness={0.8} /></mesh>
    <mesh position={[0.1, -0.34, 0]} rotation={[0, 0, -0.5]} scale={[0.16, 0.07, 0.03]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#789f72" roughness={0.8} /></mesh>
    {petals.map((angle) => <mesh key={angle} position={[Math.cos(angle) * 0.115, Math.sin(angle) * 0.115, 0.04]} rotation={[0, 0, angle]} scale={[0.115, 0.075, 0.065]}>
      <sphereGeometry args={[1, 16, 12]} /><meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.28} emissive={color} emissiveIntensity={0.08} />
    </mesh>)}
    <mesh position={[0, 0, 0.11]}><sphereGeometry args={[0.07, 16, 12]} /><meshPhysicalMaterial color="#ffe39c" roughness={0.28} metalness={0.12} emissive="#ffca62" emissiveIntensity={0.22} /></mesh>
  </group>;
}

function FlowerCluster({ position, scale, phase, reducedMotion }: { position: [number, number, number]; scale: number; phase: number; reducedMotion: boolean }) {
  return <Float speed={reducedMotion ? 0 : 0.18 + phase * 0.025} floatIntensity={reducedMotion ? 0 : 0.025} rotationIntensity={reducedMotion ? 0 : 0.014}>
    <group position={position} scale={scale}>
      <mesh position={[0, -0.12, -0.12]} scale={[0.56, 0.26, 0.2]}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color="#548367" roughness={0.95} /></mesh>
      {Array.from({ length: 5 }, (_, index) => <group key={index} position={[(index - 2) * 0.24, (index % 2) * 0.12, index % 3 === 0 ? 0.04 : 0]} rotation={[0, 0, (index - 2) * 0.07]}>
        <Flower scale={0.58 + (index % 3) * 0.1} color={["#ff84bd", "#ffd1e5", "#d599f2", "#f49abf", "#ffe2a0"][((index + phase) % 5)]} />
      </group>)}
    </group>
  </Float>;
}

function Tower({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.32, 0.39, 1.45, 12]} /><meshPhysicalMaterial color="#ffe8f2" roughness={0.48} clearcoat={0.25} /></mesh>
    <mesh position={[0, 1.55, 0]} castShadow><coneGeometry args={[0.53, 0.82, 8]} /><meshPhysicalMaterial color="#e889bd" roughness={0.34} metalness={0.06} clearcoat={0.38} /></mesh>
    <mesh position={[0, 1.99, 0]}><sphereGeometry args={[0.075, 12, 10]} /><meshStandardMaterial color="#ffe5a3" metalness={0.55} roughness={0.26} emissive="#ffcb79" emissiveIntensity={0.35} /></mesh>
    {[-0.23, 0.23].map((x) => <mesh key={x} position={[x, 0.74, 0.34]}><boxGeometry args={[0.085, 0.26, 0.035]} /><meshBasicMaterial color="#ffd680" toneMapped={false} /></mesh>)}
    <mesh position={[0, 1.05, 0.35]}><boxGeometry args={[0.11, 0.17, 0.04]} /><meshBasicMaterial color="#ffe5ae" toneMapped={false} /></mesh>
  </group>;
}

function Castle({ portrait }: { portrait: boolean }) {
  return <group position={portrait ? [-1.55, 1.05, -4.1] : [-5.45, 0.45, -4.6]} scale={portrait ? 0.46 : 0.9}>
    <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[2.4, 1.45, 0.52]} /><meshPhysicalMaterial color="#ffdbe9" roughness={0.52} clearcoat={0.25} /></mesh>
    <mesh position={[0, 1.45, 0.03]}><coneGeometry args={[1.25, 0.62, 4]} /><meshPhysicalMaterial color="#ec92c2" roughness={0.38} /></mesh>
    <Tower position={[-0.95, 0.48, 0.08]} scale={0.88} /><Tower position={[0.94, 0.55, 0.08]} scale={0.95} />
    <Tower position={[0, 1.08, -0.12]} scale={0.68} />
    <mesh position={[0, 0.23, 0.31]}><RoundedBox args={[0.34, 0.52, 0.06]} radius={0.16} smoothness={3}><meshStandardMaterial color="#bf6fa1" /></RoundedBox></mesh>
    {[-0.45, 0.45].map((x) => <mesh key={x} position={[x, 0.92, 0.29]}><meshPhysicalMaterial color="#ffe4a9" emissive="#ffbf6a" emissiveIntensity={0.75} /><boxGeometry args={[0.12, 0.18, 0.04]} /></mesh>)}
  </group>;
}

function Cloud({ position, scale = 1, tint = "#fff9ff" }: { position: [number, number, number]; scale?: number; tint?: string }) {
  return <group position={position} scale={scale}>
    {[[0, 0, 0], [0.37, 0.06, 0], [-0.33, 0.03, 0], [0.05, 0.18, -0.03]].map(([x, y, z], index) => <mesh key={index} position={[x, y, z]} scale={index === 3 ? [0.85, 0.85, 0.74] : [1, 0.78, 0.8]}>
      <sphereGeometry args={[0.38, 18, 14]} /><meshBasicMaterial color={tint} transparent opacity={0.48} depthWrite={false} />
    </mesh>)}
  </group>;
}

function Balloon({ position, color, scale, speed }: { position: [number, number, number]; color: string; scale: number; speed: number }) {
  const string = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0); shape.bezierCurveTo(0.09, -0.22, -0.08, -0.3, 0.03, -0.52);
    return new ShapeGeometry(shape, 12);
  }, []);
  return <Float speed={speed} floatIntensity={0.18} rotationIntensity={0.035}>
    <group position={position} scale={scale}>
      <mesh scale={[0.48, 0.62, 0.42]} castShadow><sphereGeometry args={[0.5, 22, 18]} /><meshPhysicalMaterial color={color} roughness={0.18} metalness={0.04} clearcoat={0.95} clearcoatRoughness={0.1} emissive={color} emissiveIntensity={0.06} /></mesh>
      <mesh position={[0, -0.67, 0]} rotation={[0, 0, 0.18]}><primitive object={string} attach="geometry" /><meshBasicMaterial color="#fff2fa" transparent opacity={0.72} /></mesh>
    </group>
  </Float>;
}

function Lantern({ position, reducedMotion }: { position: [number, number, number]; reducedMotion: boolean }) {
  const glow = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current && !reducedMotion) glow.current.intensity = 1.25 + Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.12;
  });
  return <group position={position}>
    <mesh position={[0, 0.82, 0]} castShadow><cylinderGeometry args={[0.045, 0.065, 1.62, 10]} /><meshStandardMaterial color="#b57b65" metalness={0.48} roughness={0.38} /></mesh>
    <mesh position={[0, 1.75, 0]} castShadow><cylinderGeometry args={[0.28, 0.24, 0.42, 8]} /><meshPhysicalMaterial color="#ffdda4" transparent opacity={0.62} roughness={0.18} clearcoat={0.6} /></mesh>
    <mesh position={[0, 2.02, 0]}><coneGeometry args={[0.34, 0.18, 8]} /><meshStandardMaterial color="#d69a60" metalness={0.45} roughness={0.3} /></mesh>
    <mesh position={[0, 2.24, 0]}><torusGeometry args={[0.1, 0.025, 8, 20]} /><meshStandardMaterial color="#d69a60" metalness={0.55} roughness={0.28} /></mesh>
    <mesh position={[0, 1.75, 0.24]}><boxGeometry args={[0.04, 0.31, 0.03]} /><meshBasicMaterial color="#fff0b2" toneMapped={false} /></mesh>
    <pointLight ref={glow} position={[0, 1.72, 0.12]} color="#ffcf82" intensity={1.25} distance={3.4} />
  </group>;
}

function FenceSection({ x, length = 3.3 }: { x: number; length?: number }) {
  const posts = Math.max(5, Math.round(length * 3));
  return <group position={[x, -0.84, -1.48]}>
    <mesh position={[0, 0.22, 0]} castShadow><boxGeometry args={[length, 0.08, 0.08]} /><meshPhysicalMaterial color="#fff4fb" roughness={0.4} clearcoat={0.32} /></mesh>
    <mesh position={[0, -0.1, 0]}><boxGeometry args={[length, 0.075, 0.08]} /><meshStandardMaterial color="#f8d9ea" roughness={0.48} /></mesh>
    {Array.from({ length: posts }, (_, index) => <group key={index} position={[-length / 2 + (length * index) / (posts - 1), 0.02, 0]}>
      <mesh position={[0, 0.13, 0]} castShadow><boxGeometry args={[0.065, 0.43, 0.075]} /><meshStandardMaterial color="#fff8fc" roughness={0.4} /></mesh>
      <mesh position={[0, 0.37, 0]}><coneGeometry args={[0.075, 0.11, 4]} /><meshStandardMaterial color="#ffe2a6" metalness={0.25} roughness={0.35} /></mesh>
    </group>)}
  </group>;
}

function Signboard({ portrait }: { portrait: boolean }) {
  const heart = useMemo(() => {
    const shape = new Shape(); shape.moveTo(0, -0.18); shape.bezierCurveTo(-0.4, 0.1, -0.3, 0.42, 0, 0.22); shape.bezierCurveTo(0.3, 0.42, 0.4, 0.1, 0, -0.18); return new ShapeGeometry(shape, 16);
  }, []);
  return <group position={portrait ? [1.75, -0.56, -0.5] : [5.12, -0.56, -0.15]} scale={portrait ? 0.46 : 0.78} rotation={[0, -0.12, 0]}>
    <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.045, 0.065, 1.5, 8]} /><meshStandardMaterial color="#9b674f" roughness={0.7} /></mesh>
    <mesh position={[0.08, 1.1, 0.12]} castShadow><RoundedBox args={[1.3, 0.46, 0.13]} radius={0.08} smoothness={3}><meshPhysicalMaterial color="#eebc91" roughness={0.56} /></RoundedBox></mesh>
    <mesh position={[0.1, 1.1, 0.2]}><primitive object={heart} attach="geometry" /><meshPhysicalMaterial color="#e85c8f" roughness={0.28} clearcoat={0.7} /></mesh>
  </group>;
}

export const CutenessGarden = memo(function CutenessGarden({ portrait, reducedMotion }: { portrait: boolean; reducedMotion: boolean }) {
  return <>
    <color attach="background" args={["#d9b6f2"]} />
    <fog attach="fog" args={["#d7b5e9", 10, 25]} />
    <mesh position={[0, 0.35, -7]} scale={[15, 7.5, 1]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color="#dcbaf6" /></mesh>
    <Cloud position={portrait ? [-1.75, 2.72, -4.8] : [-6.1, 2.75, -4.7]} scale={1.35} tint="#fff7ff" />
    <Cloud position={portrait ? [1.6, 2.5, -4.9] : [5.9, 2.5, -4.5]} scale={1.5} tint="#ffe9f7" />
    <Castle portrait={portrait} />
    <group position={[portrait ? 2.3 : 4.4, -0.7, -3.8]}>
      {[-0.65, -0.05, 0.55, 1.05].map((x, index) => <mesh key={index} position={[x, 0.55 + (index % 2) * 0.15, 0]} scale={[0.82, 1 + (index % 2) * 0.12, 0.78]}><sphereGeometry args={[0.66, 16, 12]} /><meshStandardMaterial color={["#9ac58e", "#87b98d", "#b1cc91", "#82b489"][index]} roughness={0.94} /></mesh>)}
    </group>
    <group position={[portrait ? -2.3 : -4.45, -0.75, -3.65]}>
      {[-0.65, -0.05, 0.55, 1.05].map((x, index) => <mesh key={index} position={[x, 0.6 + (index % 2) * 0.14, 0]} scale={[0.82, 1 + (index % 2) * 0.1, 0.78]}><sphereGeometry args={[0.67, 16, 12]} /><meshStandardMaterial color={["#9bc28d", "#87b88c", "#b3cc93", "#82b58c"][index]} roughness={0.94} /></mesh>)}
    </group>
    <FenceSection x={portrait ? -2.3 : -4.15} length={portrait ? 1.45 : 3.1} />
    <FenceSection x={portrait ? 2.45 : 4.15} length={portrait ? 1.45 : 3.1} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, -0.35]} receiveShadow><planeGeometry args={[24, 16]} /><meshStandardMaterial color="#d98fb8" roughness={0.76} /></mesh>
    {Array.from({ length: 12 }, (_, index) => {
      const x = ((index % 4) - 1.5) * 0.77;
      const z = -0.08 + Math.floor(index / 4) * 0.75;
      return <RoundedBox key={index} args={[0.7, 0.035, 0.62]} radius={0.035} smoothness={2} position={[x, -1.31, z]} receiveShadow>
        <meshPhysicalMaterial color={index % 3 === 0 ? "#edb8d4" : "#e9b2ce"} roughness={0.72} clearcoat={0.12} />
      </RoundedBox>;
    })}
    <group position={[0, -1.06, 0.25]}>
      {[
        [-5.15, 0.55, 0.95, 0], [-4.45, 0.48, 0.68, 1], [-3.8, 0.45, 0.84, 2],
        [3.72, 0.42, 0.82, 3], [4.4, 0.55, 1.02, 4], [5.05, 0.42, 0.75, 1],
        [-2.5, 0.18, 0.45, 3], [2.55, 0.2, 0.48, 0],
      ].map(([x, y, scale, phase], index) => <FlowerCluster key={index} position={[portrait ? (index < 3 ? -1.75 : 1.75) : x, y, index < 6 ? 0.2 : 0.85]} scale={portrait ? scale * 0.54 : scale} phase={phase} reducedMotion={reducedMotion} />)}
    </group>
    <Lantern position={portrait ? [-1.75, -0.85, -0.35] : [-3.45, -0.86, -0.22]} reducedMotion={reducedMotion} />
    <Lantern position={portrait ? [1.8, -0.85, -0.42] : [4.5, -0.86, -0.18]} reducedMotion={reducedMotion} />
    <Signboard portrait={portrait} />
    <Balloon position={portrait ? [-1.55, 1.45, -1.7] : [-4.6, 1.72, -1.8]} color="#ee86bd" scale={portrait ? 0.75 : 1.08} speed={reducedMotion ? 0 : 0.42} />
    <Balloon position={portrait ? [1.68, 1.6, -1.85] : [5.05, 1.92, -1.8]} color="#bc91eb" scale={portrait ? 0.7 : 0.96} speed={reducedMotion ? 0 : 0.36} />
    {!portrait && <>
      <Balloon position={[-3.4, 0.84, -1.6]} color="#ffc2dc" scale={0.72} speed={reducedMotion ? 0 : 0.3} />
      <Balloon position={[4.25, 0.9, -1.6]} color="#f5a4cb" scale={0.72} speed={reducedMotion ? 0 : 0.34} />
    </>}
  </>;
});
