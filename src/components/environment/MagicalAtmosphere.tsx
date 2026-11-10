"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Shape, ShapeGeometry } from "three";

const clouds = [
  { x: -4.35, y: 2.1, z: -2.8, scale: 1.12 },
  { x: 4.4, y: 2.35, z: -2.6, scale: 1.28 },
  { x: -2.9, y: -0.02, z: -2.2, scale: 0.78 },
  { x: 3.1, y: 0.12, z: -2.4, scale: 0.86 },
] as const;

function CloudBank({ tint, reducedMotion }: { tint: string; reducedMotion: boolean }) {
  return <group>
    {clouds.map(({ x, y, z, scale }, index) => <Float key={index} speed={reducedMotion ? 0 : 0.12 + index * 0.025} floatIntensity={reducedMotion ? 0 : 0.055} rotationIntensity={reducedMotion ? 0 : 0.008}>
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[-0.3, 0, 0]} scale={[1.1, 0.48, 0.24]}><sphereGeometry args={[0.68, 20, 14]} /><meshBasicMaterial color={tint} transparent opacity={0.09} depthWrite={false} /></mesh>
        <mesh position={[0.28, 0.08, -0.04]} scale={[0.82, 0.56, 0.22]}><sphereGeometry args={[0.68, 20, 14]} /><meshBasicMaterial color="#fff8fb" transparent opacity={0.075} depthWrite={false} /></mesh>
        <mesh position={[0.72, -0.02, -0.05]} scale={[0.9, 0.4, 0.2]}><sphereGeometry args={[0.62, 20, 14]} /><meshBasicMaterial color={tint} transparent opacity={0.065} depthWrite={false} /></mesh>
      </group>
    </Float>)}
  </group>;
}

function FloatingKeepsakes({ reducedMotion, portrait }: { reducedMotion: boolean; portrait: boolean }) {
  const heart = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.22);
    shape.bezierCurveTo(-0.58, 0.12, -0.38, 0.58, 0, 0.29);
    shape.bezierCurveTo(0.38, 0.58, 0.58, 0.12, 0, -0.22);
    return new ShapeGeometry(shape, 20);
  }, []);
  return <>
    {[
      { position: [portrait ? -2.2 : -3.25, 1.28, -1.05] as [number, number, number], size: portrait ? 0.17 : 0.22, color: "#ffc1dc", speed: 0.23 },
      { position: [portrait ? 2.15 : 3.35, 0.5, -0.95] as [number, number, number], size: portrait ? 0.12 : 0.17, color: "#ffe0a8", speed: 0.18 },
    ].map((item, index) => <Float key={index} speed={reducedMotion ? 0 : item.speed} floatIntensity={reducedMotion ? 0 : 0.13} rotationIntensity={reducedMotion ? 0 : 0.035}>
      <mesh geometry={heart} position={item.position} scale={item.size}>
        <meshBasicMaterial color={item.color} transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </Float>)}
  </>;
}

/** Distant, low contrast layers add fairytale depth without competing with each scene's focal objects. */
export function MagicalAtmosphere({ tint, reducedMotion, portrait }: { tint: string; reducedMotion: boolean; portrait: boolean }) {
  const drift = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!drift.current || reducedMotion) return;
    const time = clock.elapsedTime;
    drift.current.position.x = Math.sin(time * 0.095) * (portrait ? 0.025 : 0.055);
    drift.current.position.y = Math.cos(time * 0.075) * 0.018;
  });
  return <group ref={drift}>
    <CloudBank tint={tint} reducedMotion={reducedMotion} />
    <FloatingKeepsakes reducedMotion={reducedMotion} portrait={portrait} />
  </group>;
}
