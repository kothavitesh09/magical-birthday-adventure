"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera as DreiPerspectiveCamera, Sparkles } from "@react-three/drei";
import { CatmullRomCurve3, Shape, TubeGeometry, Vector3 } from "three";
import { PandaController } from "@/components/panda/PandaController";
import { MagicalAtmosphere } from "@/components/environment/MagicalAtmosphere";

function Blossom({ color = "#ff9fc5", scale = 1 }: { color?: string; scale?: number }) {
  return <group scale={scale}>
    {Array.from({ length: 5 }, (_, index) => {
      const angle = index * (Math.PI * 2 / 5);
      return <mesh key={index} position={[Math.cos(angle) * 0.105, Math.sin(angle) * 0.105, 0]} rotation={[0, 0, angle]} scale={[0.095, 0.055, 0.035]}>
        <sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color={color} roughness={0.63} emissive={color} emissiveIntensity={0.08} />
      </mesh>;
    })}
    <mesh position={[0, 0, 0.035]} scale={0.042}><sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color="#ffe3a0" roughness={0.48} emissive="#ffcf6c" emissiveIntensity={0.22} /></mesh>
  </group>;
}

function BlossomBranch({ side = -1 }: { side?: -1 | 1 }) {
  const curve = useMemo(() => {
    const points: [number, number, number][] = side < 0
      ? [[-3.5, -0.85, -0.08], [-3.08, -0.12, -0.12], [-2.94, 0.78, -0.18], [-2.46, 1.72, -0.22], [-1.75, 2.28, -0.26], [-0.76, 2.44, -0.28]]
      : [[3.26, 1.15, -0.18], [2.85, 1.9, -0.2], [2.12, 2.43, -0.24], [1.18, 2.64, -0.26], [0.3, 2.42, -0.2]];
    return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
  }, [side]);
  const geometry = useMemo(() => new TubeGeometry(curve, 48, 0.035, 7, false), [curve]);
  const blooms: [number, number, number][] = side < 0
    ? [[-3.18, 0.15, 0.02], [-2.95, 0.84, 0], [-2.56, 1.53, 0], [-2.17, 2.03, 0], [-1.45, 2.37, 0], [-0.8, 2.4, 0], [-3.45, -0.45, 0], [-2.78, 0.35, 0], [-2.28, 1.22, 0], [-1.8, 1.87, 0]]
    : [[2.88, 1.7, 0], [2.37, 2.19, 0], [1.75, 2.49, 0], [1.06, 2.54, 0], [0.48, 2.35, 0], [2.12, 1.99, 0]];
  return <group>
    <mesh geometry={geometry}><meshStandardMaterial color="#4c6e54" roughness={0.88} /></mesh>
    {blooms.map(([x, y, z], i) => <group key={`${x}-${i}`} position={[x, y, z]} rotation={[0, 0, i * 0.28]}><Blossom color={i % 3 === 0 ? "#ffd1df" : i % 2 === 0 ? "#f68eb7" : "#ffc0d7"} scale={i % 3 === 0 ? 0.86 : 1.05} /></group>)}
  </group>;
}

function Lantern({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[0.28, 0.39, 0.22]} /><meshPhysicalMaterial color="#ffd8ae" transparent opacity={0.52} roughness={0.25} transmission={0.12} />
    </mesh>
    {[-0.17, 0.17].map((x) => <mesh key={x} position={[x, 0.42, 0]}><boxGeometry args={[0.035, 0.47, 0.27]} /><meshStandardMaterial color="#bd7659" metalness={0.55} roughness={0.36} /></mesh>)}
    <mesh position={[0, 0.64, 0]}><coneGeometry args={[0.22, 0.16, 4]} /><meshStandardMaterial color="#d99967" metalness={0.46} roughness={0.38} /></mesh>
    <mesh position={[0, 0.19, 0]}><boxGeometry args={[0.38, 0.08, 0.3]} /><meshStandardMaterial color="#bd7659" metalness={0.5} roughness={0.38} /></mesh>
    <mesh position={[0, 0.43, 0]}><sphereGeometry args={[0.11, 20, 16]} /><meshBasicMaterial color="#ffd999" /></mesh>
    <pointLight position={[0, 0.4, 0.25]} color="#ffd087" intensity={2.3} distance={3.8} decay={2} />
  </group>;
}

function GardenBed({ side, mobile = false }: { side: -1 | 1; mobile?: boolean }) {
  const offsets = mobile
    ? side < 0 ? [-2.05, -1.8, -1.55, -2.2] : [1.55, 1.82, 2.1, 1.68]
    : side < 0 ? [-3.8, -3.3, -2.82, -3.55, -2.95, -4.1, -3.2, -3.76] : [2.1, 2.55, 3.05, 3.55, 2.35, 3.2, 3.75, 2.72];
  return <group>
    {offsets.map((x, i) => <group key={`${x}-${i}`} position={[x, -0.85 + (i % 3) * 0.045, 0.15 + (i % 2) * 0.14]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.2]}>
      <mesh position={[0, 0.17, 0]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.3]} scale={[0.075, 0.23 + (i % 3) * 0.03, 0.045]}>
        <capsuleGeometry args={[0.5, 0.5, 4, 8]} /><meshStandardMaterial color="#587e60" roughness={0.88} />
      </mesh>
      <Blossom color={i % 3 === 0 ? "#fff0d7" : i % 2 === 0 ? "#f68fb8" : "#ffc0d8"} scale={0.52 + (i % 3) * 0.1} />
    </group>)}
  </group>;
}

function DistantCastle({ mobile }: { mobile: boolean }) {
  const towers = [
    { x: -1.22, z: 0.03, width: 0.54, height: 2.05, roof: 0.42 },
    { x: -0.55, z: -0.1, width: 0.66, height: 3.0, roof: 0.57 },
    { x: 0.35, z: -0.22, width: 0.78, height: 3.65, roof: 0.68 },
    { x: 1.2, z: 0, width: 0.56, height: 2.25, roof: 0.45 },
  ];
  return <group position={[mobile ? -2.55 : -4.25, mobile ? -1.2 : -1.06, -4.7]} scale={mobile ? 0.62 : 0.96}>
    <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[2.9, 1.55, 0.5]} /><meshPhysicalMaterial color="#f0bedf" roughness={0.73} /></mesh>
    <mesh position={[0, 0.25, 0.3]}><boxGeometry args={[1.05, 1.1, 0.04]} /><meshBasicMaterial color="#ffce91" /></mesh>
    <mesh position={[0, 0.22, 0.34]}><torusGeometry args={[0.52, 0.065, 10, 32, Math.PI]} /><meshStandardMaterial color="#ffdfab" metalness={0.3} roughness={0.38} emissive="#ffca77" emissiveIntensity={0.35} /></mesh>
    {towers.map(({ x, z, width, height, roof }, index) => <group key={x} position={[x, 0.68, z]}>
      <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[width * 0.45, width * 0.56, height, 12]} /><meshPhysicalMaterial color={index % 2 ? "#f7c8e4" : "#eeb8dd"} roughness={0.7} /></mesh>
      <mesh position={[0, height + roof * 0.42, 0]} castShadow><coneGeometry args={[width * 0.76, roof * 1.45, 12]} /><meshPhysicalMaterial color={index % 2 ? "#925bc0" : "#b372cc"} roughness={0.52} clearcoat={0.2} /></mesh>
      <mesh position={[0, height + roof * 1.13, 0]}><sphereGeometry args={[0.045, 14, 10]} /><meshStandardMaterial color="#ffd878" emissive="#ffbe4b" emissiveIntensity={0.7} /></mesh>
      {[0.44, 0.94, 1.4].filter((y) => y < height - 0.16).map((y) => <group key={y} position={[0, y, width * 0.49]}>
        <mesh><boxGeometry args={[0.16, 0.28, 0.035]} /><meshBasicMaterial color="#ffde9e" /></mesh>
        <mesh position={[0, 0, 0.015]}><boxGeometry args={[0.105, 0.22, 0.02]} /><meshBasicMaterial color="#fff1bd" /></mesh>
        <pointLight position={[0, 0, 0.22]} color="#ffc879" intensity={0.35} distance={1.3} />
      </group>)}
    </group>)}
    <mesh position={[0, 1.62, 0.24]}><boxGeometry args={[1.35, 0.16, 0.58]} /><meshPhysicalMaterial color="#f2bddb" roughness={0.66} /></mesh>
    <pointLight position={[0, 1.2, 1.2]} color="#ffcb91" intensity={2.2} distance={7} />
  </group>;
}

function WelcomeBalloons({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const balloons = mobile ? [
    { x: -1.62, y: 2.75, z: -0.7, color: "#f39ad1", scale: 0.38 },
    { x: -1.34, y: 2.1, z: -1.4, color: "#d6a5f5", scale: 0.26 },
    { x: 1.72, y: 2.64, z: -0.55, color: "#ffc1a4", scale: 0.39 },
    { x: 1.45, y: 1.96, z: -0.35, color: "#ee85cf", scale: 0.42 },
  ] : [
    { x: -4.1, y: 2.45, z: -0.7, color: "#f39ad1", scale: 0.47 },
    { x: -2.7, y: 1.7, z: -1.4, color: "#d6a5f5", scale: 0.3 },
    { x: 3.35, y: 2.18, z: -0.55, color: "#ffc1a4", scale: 0.45 },
    { x: 4.15, y: 1.54, z: -0.35, color: "#ee85cf", scale: 0.54 },
    { x: 4.82, y: 2.04, z: -0.9, color: "#b990ee", scale: 0.43 },
  ];
  return <group>{balloons.map((balloon, index) => <Float key={index} speed={reducedMotion ? 0 : 0.24 + index * 0.04} floatIntensity={reducedMotion ? 0 : 0.12} rotationIntensity={reducedMotion ? 0 : 0.06}>
    <group position={[balloon.x, balloon.y, balloon.z]} scale={balloon.scale}>
      <mesh scale={[0.72, 1, 0.58]} castShadow><sphereGeometry args={[0.48, 32, 24]} /><meshPhysicalMaterial color={balloon.color} roughness={0.24} metalness={0.08} clearcoat={0.72} clearcoatRoughness={0.16} /></mesh>
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.075, 0.15, 12]} /><meshStandardMaterial color={balloon.color} roughness={0.4} /></mesh>
      <mesh position={[0.018, -0.98, -0.03]}><cylinderGeometry args={[0.003, 0.004, 0.88, 5]} /><meshStandardMaterial color="#ffe6f4" roughness={0.6} /></mesh>
      <mesh position={[-0.12, 0.18, 0.24]} scale={[0.11, 0.17, 0.035]} rotation={[0, 0, -0.3]}><sphereGeometry args={[1, 20, 16]} /><meshBasicMaterial color="#fff6fb" transparent opacity={0.4} /></mesh>
    </group>
  </Float>)}</group>;
}

function WelcomePath() {
  const stones = Array.from({ length: 13 }, (_, index) => ({ z: 1.2 + index * 0.48, x: Math.sin(index * 0.3) * (0.14 + index * 0.055), scale: 1 - index * 0.035 }));
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 1.8]} receiveShadow><circleGeometry args={[14, 72]} /><meshStandardMaterial color="#554273" roughness={0.91} /></mesh>
    <mesh position={[0, -0.95, 0.7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10.8, 13]} /><meshStandardMaterial color="#9a75a6" roughness={0.85} /></mesh>
    {stones.map((stone, index) => <mesh key={index} position={[stone.x, -0.88 + index * 0.006, stone.z]} scale={[stone.scale, 1, stone.scale * 0.76]} receiveShadow>
      <cylinderGeometry args={[0.48, 0.52, 0.075, 6]} /><meshPhysicalMaterial color={index % 2 ? "#e7b4d0" : "#f4cde0"} roughness={0.74} clearcoat={0.1} />
    </mesh>)}
    {[-1, 1].map((side) => <group key={side} position={[side * 2.75, -0.9, -0.35]}>
      <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.12, 0.5, 0.13]} /><meshStandardMaterial color="#ba805d" roughness={0.78} /></mesh>
      <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.62, 0.12, 0.24]} /><meshPhysicalMaterial color="#ffd48e" emissive="#ffbd67" emissiveIntensity={0.2} roughness={0.38} /></mesh>
      <mesh position={[0, 0.33, 0]}><coneGeometry args={[0.3, 0.16, 4]} /><meshStandardMaterial color="#8d5e82" roughness={0.6} /></mesh>
      <pointLight position={[0, 0.5, 0.3]} color="#ffc77b" intensity={0.8} distance={3} />
    </group>)}
  </group>;
}

function WelcomeSignpost({ mobile }: { mobile: boolean }) {
  return <group position={[mobile ? 2.05 : 3.55, mobile ? -1.2 : -0.98, 0.08]} scale={mobile ? 0.64 : 1} rotation={[0, -0.12, 0]}>
    <mesh position={[0, 0.86, 0]} castShadow><cylinderGeometry args={[0.07, 0.1, 1.95, 12]} /><meshStandardMaterial color="#87563c" roughness={0.82} /></mesh>
    {[{ y: 1.48, side: 1 }, { y: 0.93, side: -1 }, { y: 0.38, side: 1 }].map(({ y, side }, index) => <group key={index} position={[side * 0.15, y, 0.1]}>
      <mesh rotation={[0, 0, side === 1 ? 0 : Math.PI]} castShadow><shapeGeometry args={[(() => { const shape = new Shape(); shape.moveTo(-0.62, -0.18); shape.lineTo(0.38, -0.18); shape.lineTo(0.62, 0); shape.lineTo(0.38, 0.18); shape.lineTo(-0.62, 0.18); shape.closePath(); return shape; })()]} /><meshPhysicalMaterial color={index === 1 ? "#e8ad76" : "#f0c18b"} roughness={0.67} /></mesh>
      <mesh position={[0, 0, 0.025]}><boxGeometry args={[0.94, 0.012, 0.018]} /><meshStandardMaterial color="#b47b52" roughness={0.8} /></mesh>
      <mesh position={[side * 0.42, 0, 0.045]}><sphereGeometry args={[0.035, 12, 10]} /><meshStandardMaterial color="#ffdc9d" metalness={0.35} roughness={0.35} /></mesh>
    </group>)}
  </group>;
}

function GardenFloor({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const plants = Array.from({ length: mobile ? 20 : 40 }, (_, index) => {
    const side = index % 2 ? 1 : -1;
    const row = Math.floor(index / 2);
    return { x: side * (mobile ? 1.55 + (row % 3) * 0.2 : 2.8 + (row % 5) * 0.38), y: -0.82 + (row % 3) * 0.05, z: -1.85 + row * (mobile ? 0.32 : 0.4), size: (mobile ? 0.47 : 0.64) + (row % 3) * (mobile ? 0.12 : 0.18), color: ["#f384bb", "#ffc0db", "#c792ec", "#ffcfaa", "#fff0d4"][row % 5] };
  });
  return <group>{plants.map((plant, index) => <Float key={index} speed={reducedMotion ? 0 : 0.28 + (index % 4) * 0.035} floatIntensity={reducedMotion ? 0 : 0.012} rotationIntensity={reducedMotion ? 0 : 0.035}>
    <group position={[plant.x, plant.y, plant.z]} scale={plant.size} rotation={[0, 0, (index % 2 ? 1 : -1) * 0.16]}>
      <mesh position={[0, 0.22, 0]} scale={[0.08, 0.26, 0.06]}><capsuleGeometry args={[0.5, 0.5, 4, 8]} /><meshStandardMaterial color="#557b5a" roughness={0.9} /></mesh>
      <Blossom color={plant.color} scale={0.88} />
      <mesh position={[-0.12, 0.16, 0.01]} rotation={[0, 0, 0.65]} scale={[0.15, 0.065, 0.035]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#79a878" roughness={0.9} /></mesh>
      {index % 8 === 0 && <pointLight position={[0, 0.15, 0.12]} color={plant.color} intensity={0.18} distance={1.2} />}
    </group>
  </Float>)}</group>;
}

function WelcomeWorld({ reducedMotion }: { reducedMotion: boolean }) {
  const { size, setDpr } = useThree();
  const mobile = size.width < 900;
  useEffect(() => {
    setDpr(mobile ? 1 : size.width < 1200 ? 1.2 : 1.45);
  }, [mobile, setDpr, size.width]);
  return <>
    <DreiPerspectiveCamera makeDefault position={[mobile ? 0 : 0, 1.0, 12.2]} fov={mobile ? 43 : 37} />
    <ambientLight intensity={0.84} color="#ffe5f2" />
    <hemisphereLight intensity={0.72} color="#fff0f7" groundColor="#80608c" />
    <directionalLight position={[-4, 7, 5]} intensity={2.15} color="#fff0d5" castShadow shadow-mapSize-width={mobile ? 512 : 1024} shadow-mapSize-height={mobile ? 512 : 1024} />
    <pointLight position={[-2.2, 2.8, 2.5]} intensity={3.4} color="#ffb66f" distance={8} decay={2} />
    <pointLight position={[3.6, 1.6, 1.5]} intensity={1.7} color="#d7b5ff" distance={8} decay={2} />
    <DistantCastle mobile={mobile} />
    <WelcomePath />
    <GardenFloor reducedMotion={reducedMotion} mobile={mobile} />
    <group position={[-0.1, -0.24, 1.25]} scale={mobile ? 0.9 : 1.18}><PandaController /></group>
    <Float speed={reducedMotion ? 0 : 0.2} floatIntensity={reducedMotion ? 0 : 0.025} rotationIntensity={reducedMotion ? 0 : 0.012}><BlossomBranch side={-1} /></Float>
    <GardenBed side={-1} mobile={mobile} /><GardenBed side={1} mobile={mobile} />
    <Lantern position={[mobile ? -1.86 : -4.25, mobile ? -1.24 : -0.95, 0.3]} scale={mobile ? 0.62 : 0.9} />
    <WelcomeSignpost mobile={mobile} />
    <WelcomeBalloons reducedMotion={reducedMotion} mobile={mobile} />
    <MagicalAtmosphere tint="#ffbadc" reducedMotion={reducedMotion} portrait={mobile} />
    <Sparkles count={mobile ? 44 : 112} scale={[10, 5.5, 6]} size={2.2} speed={reducedMotion ? 0 : 0.17} opacity={0.72} color="#ffdb9a" />
  </>;
}

export default function WelcomeWorldCanvas({ reducedMotion, pageVisible }: { reducedMotion: boolean; pageVisible: boolean }) {
  return <Canvas frameloop={pageVisible ? "always" : "never"} shadows dpr={[1, 1.5]} camera={{ position: [0, 1.35, 10.5], fov: 35 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
    <WelcomeWorld reducedMotion={reducedMotion} />
  </Canvas>;
}
