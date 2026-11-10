"use client";

import { Float } from "@react-three/drei";
import { Shape, ShapeGeometry } from "three";
import { useMemo } from "react";

function Flower({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  const petals = useMemo(() => Array.from({ length: 6 }, (_, i) => i * Math.PI / 3), []);
  return <group position={position} scale={scale}>
    {petals.map((angle) => <mesh key={angle} position={[Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0]} rotation={[0, 0, angle]}>
      <sphereGeometry args={[0.13, 16, 12]} /><meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.12} />
    </mesh>)}
    <mesh><sphereGeometry args={[0.085, 16, 12]} /><meshStandardMaterial color="#ffe49b" emissive="#ffca66" emissiveIntensity={0.35} /></mesh>
  </group>;
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    {[[0, 0, 0], [0.34, 0.11, 0], [-0.34, 0.05, 0], [0.02, 0.22, -0.04]].map(([x, y, z], index) => <mesh key={index} position={[x, y, z]}>
      <sphereGeometry args={[index === 3 ? 0.28 : 0.32, 18, 14]} /><meshStandardMaterial color="#fff3fb" roughness={0.92} transparent opacity={0.62} />
    </mesh>)}
  </group>;
}

function Heart({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.22); shape.bezierCurveTo(-0.58, 0.12, -0.38, 0.58, 0, 0.29); shape.bezierCurveTo(0.38, 0.58, 0.58, 0.12, 0, -0.22);
    return new ShapeGeometry(shape);
  }, []);
  return <Float speed={0.65} floatIntensity={0.15} rotationIntensity={0.06}><mesh geometry={geometry} position={position} scale={scale}>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.8} side={2} />
  </mesh></Float>;
}

export function PlaygroundEnvironment() {
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.84, 0]} receiveShadow>
      <circleGeometry args={[9, 64]} /><meshStandardMaterial color="#e9b7d8" roughness={0.86} />
    </mesh>
    <mesh position={[0, 0.5, -4.5]} scale={[9, 5, 1]}>
      <planeGeometry args={[1, 1]} /><meshBasicMaterial color="#a888ce" transparent opacity={0.38} />
    </mesh>
    <Cloud position={[-3.8, 1.65, -2.7]} scale={1.6} /><Cloud position={[3.8, 2.3, -3.2]} scale={1.85} />
    <Cloud position={[-2.8, -0.25, -2.9]} scale={0.95} /><Cloud position={[3, 0, -2.5]} scale={1.05} />
    <Flower position={[-3.65, -0.64, 0.2]} scale={1.2} color="#ff8fb9" />
    <Flower position={[-3.15, -0.71, 0.3]} scale={0.72} color="#ffe3f1" />
    <Flower position={[-4.15, -0.75, 0.1]} scale={0.68} color="#f5a8cf" />
    <Flower position={[3.62, -0.64, 0.1]} scale={1.15} color="#ff94c2" />
    <Flower position={[3.12, -0.73, 0.18]} scale={0.76} color="#fff0f6" />
    <Flower position={[4.1, -0.75, -0.05]} scale={0.72} color="#f8c8dc" />
    <Heart position={[-2.72, 1.2, 0.4]} scale={0.4} color="#ffc1dc" />
    <Heart position={[2.9, 0.55, 0.35]} scale={0.32} color="#f7a8d0" />
    <Heart position={[2.48, 2.1, -0.3]} scale={0.24} color="#fff0be" />
  </>;
}
