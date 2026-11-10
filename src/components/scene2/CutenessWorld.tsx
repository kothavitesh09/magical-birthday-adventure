"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera as DreiPerspectiveCamera, Sparkles } from "@react-three/drei";
import { CanvasTexture, ExtrudeGeometry, Group, MeshPhysicalMaterial, Plane, PointLight, Shape, ShapeGeometry, SRGBColorSpace, Vector3 } from "three";
import { PandaController } from "@/components/panda/PandaController";
import { MagicalAtmosphere } from "@/components/environment/MagicalAtmosphere";
import { CutenessGarden } from "@/components/scene2/CutenessGarden";

function createHeartShape() {
  const heart = new Shape();
  heart.moveTo(0, -1.12);
  heart.bezierCurveTo(-0.35, -0.87, -1.48, -0.12, -1.48, 0.62);
  heart.bezierCurveTo(-1.48, 1.22, -0.71, 1.36, -0.19, 0.99);
  heart.bezierCurveTo(-0.08, 0.91, -0.035, 0.82, 0, 0.78);
  heart.bezierCurveTo(0.035, 0.82, 0.08, 0.91, 0.19, 0.99);
  heart.bezierCurveTo(0.71, 1.36, 1.48, 1.22, 1.48, 0.62);
  heart.bezierCurveTo(1.48, -0.12, 0.35, -0.87, 0, -1.12);
  heart.closePath();
  return heart;
}

const celebrationHeartPositions: [number, number, number][] = [
  [-1.62, 0.22, 0.2], [1.62, 0.36, 0.22], [-1.27, -0.58, 0.25],
  [1.28, -0.62, 0.23], [0.02, 1.05, 0.22],
];

function Crown() {
  return <group position={[0, 1.28, 0.12]} rotation={[0, 0, -0.04]}>
    <mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[0.43, 0.49, 0.16, 10]} /><meshPhysicalMaterial color="#f5bd5c" metalness={0.72} roughness={0.24} clearcoat={0.8} /></mesh>
    {[-0.34, -0.17, 0, 0.17, 0.34].map((x, index) => <group key={x} position={[x, 0.1, 0]}>
      <mesh position={[0, 0.12 + (index === 2 ? 0.12 : index % 2 ? 0.04 : 0), 0]} rotation={[0, 0, (index - 2) * -0.16]}><coneGeometry args={[0.11, 0.34 + (index === 2 ? 0.15 : 0), 5]} /><meshPhysicalMaterial color="#e9a944" metalness={0.68} roughness={0.22} clearcoat={0.7} /></mesh>
      <mesh position={[0, 0.3 + (index === 2 ? 0.12 : index % 2 ? 0.04 : 0), 0]}><sphereGeometry args={[0.055, 12, 10]} /><meshStandardMaterial color="#fff0a6" emissive="#ffd56b" emissiveIntensity={0.4} /></mesh>
    </group>)}
    <mesh position={[0, 0.015, 0.088]}><sphereGeometry args={[0.09, 16, 12]} /><meshPhysicalMaterial color="#ef56aa" roughness={0.18} clearcoat={1} /></mesh>
  </group>;
}

function HeartMeter({ value, portrait, reducedMotion }: { value: number; portrait: boolean; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const fillMaterial = useRef<MeshPhysicalMaterial>(null);
  const meterGlow = useRef<PointLight>(null);
  const heartPath = useMemo(() => createHeartShape(), []);
  const shell = useMemo(() => new ExtrudeGeometry(heartPath, { depth: 0.17, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.055, bevelThickness: 0.06, curveSegments: 36 }), [heartPath]);
  const interior = useMemo(() => new ShapeGeometry(heartPath, 36), [heartPath]);
  const fillTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const gradient = context.createLinearGradient(0, 0, 220, 512);
    gradient.addColorStop(0, "#cf7aff"); gradient.addColorStop(0.44, "#ee54d4"); gradient.addColorStop(1, "#ff55b1");
    context.fillStyle = gradient; context.fillRect(0, 0, 256, 512);
    const sheen = context.createRadialGradient(70, 95, 8, 90, 125, 190);
    sheen.addColorStop(0, "#ffffff8c"); sheen.addColorStop(1, "#fff0ff00");
    context.fillStyle = sheen; context.fillRect(0, 0, 256, 512);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, []);
  const clipPlane = useRef(new Plane(new Vector3(0, -1, 0), -2));
  const position: [number, number, number] = portrait ? [0.28, 0.08, 0.35] : [0.3, -0.16, 0.38];
  const scale = portrait ? 0.76 : 0.92;

  useEffect(() => {
    const material = fillMaterial.current;
    if (!material) return;
    material.clippingPlanes = [clipPlane.current];
    material.clipShadows = true;
    material.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const overflow = Math.max(0, Math.min(1, (value - 100) / 20));
    const pulse = reducedMotion ? 1 : 1 + Math.sin(time * (value >= 120 ? 3.4 : 1.7)) * (value >= 120 ? 0.013 : 0.006);
    if (group.current) group.current.scale.setScalar(scale * pulse);
    clipPlane.current.constant = position[1] + scale * pulse * (-0.95 + (2.16 * Math.max(0, Math.min(120, value))) / 120);
    if (fillMaterial.current) {
      fillMaterial.current.emissiveIntensity = 0.48 + overflow * (0.65 + (reducedMotion ? 0 : Math.sin(time * 4.1) * 0.18));
    }
    if (meterGlow.current) meterGlow.current.intensity = 1.8 + overflow * (2.2 + (reducedMotion ? 0 : Math.sin(time * 4.1) * 0.4));
  });

  return <group ref={group} position={position}>
    <Float speed={reducedMotion ? 0 : 0.22} floatIntensity={reducedMotion ? 0 : 0.035} rotationIntensity={reducedMotion ? 0 : 0.012}>
      <group>
        <mesh geometry={shell} position={[0, 0, -0.13]} scale={[1, 1, 1]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f6c56e" metalness={0.68} roughness={0.22} clearcoat={0.9} emissive="#f3a64e" emissiveIntensity={value >= 100 ? 0.2 : 0.045} />
        </mesh>
        <mesh geometry={interior} position={[0, 0, 0.055]} scale={[0.91, 0.89, 1]}>
          <meshPhysicalMaterial color="#7e3f9f" roughness={0.22} metalness={0.1} clearcoat={0.85} emissive="#8d39bf" emissiveIntensity={0.38} />
        </mesh>
        <mesh geometry={interior} position={[0, 0, 0.085]} scale={[0.855, 0.84, 1]}>
          <meshPhysicalMaterial ref={fillMaterial} map={fillTexture ?? undefined} color="#fff" roughness={0.2} metalness={0.06} clearcoat={1} emissive="#cc48e3" emissiveIntensity={0.48} />
        </mesh>
        <mesh geometry={interior} position={[0, 0, 0.1]} scale={[0.855, 0.84, 1]}>
          <meshBasicMaterial color="#fff4ff" transparent opacity={0.08} side={2} />
        </mesh>
        <mesh position={[0, -0.03, 0.14]} rotation={[0.13, 0, 0.3]} scale={[1.63, 0.57, 1]}>
          <torusGeometry args={[1, 0.014, 8, 96]} /><meshBasicMaterial color="#fff1ad" transparent opacity={0.82} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.05, 0.17]} rotation={[-0.12, 0, -0.38]} scale={[1.72, 0.63, 1]}>
          <torusGeometry args={[1, 0.009, 8, 96]} /><meshBasicMaterial color="#ffb1e5" transparent opacity={0.68} toneMapped={false} />
        </mesh>
        <Crown />
        <Float speed={reducedMotion ? 0 : 0.48} floatIntensity={reducedMotion ? 0 : 0.1} rotationIntensity={reducedMotion ? 0 : 0.06}>
          <mesh geometry={interior} position={[-1.15, 0.63, 0.23]} scale={0.12}><meshPhysicalMaterial color="#ff78c5" roughness={0.2} clearcoat={0.9} emissive="#ff52b7" emissiveIntensity={0.4} /></mesh>
        </Float>
        {value >= 120 && celebrationHeartPositions.map((position, index) => <Float key={index} speed={reducedMotion ? 0 : 0.42 + index * 0.06} floatIntensity={reducedMotion ? 0 : 0.18} rotationIntensity={reducedMotion ? 0 : 0.12}>
          <mesh geometry={interior} position={position} scale={0.085 + (index % 2) * 0.025}><meshPhysicalMaterial color={index % 2 ? "#ffe4a0" : "#ff8acb"} roughness={0.22} clearcoat={0.95} emissive={index % 2 ? "#ffc568" : "#fb63bd"} emissiveIntensity={0.62} /></mesh>
        </Float>)}
        <pointLight ref={meterGlow} position={[0, 0.05, 0.68]} color="#fb60dc" intensity={1.8} distance={6.6} />
      </group>
    </Float>
  </group>;
}

function CutenessWorldScene({ value, reducedMotion }: { value: number; reducedMotion: boolean }) {
  const { size, setDpr } = useThree();
  const portrait = size.width <= 900;
  useEffect(() => {
    setDpr(portrait ? 1 : size.width < 1200 ? 1.2 : 1.45);
  }, [portrait, setDpr, size.width]);
  return <>
    <DreiPerspectiveCamera makeDefault position={[0, portrait ? 0.25 : 0.1, 9]} fov={portrait ? 40 : 34} />
    <ambientLight intensity={1.08} color="#fff0f8" />
    <hemisphereLight intensity={0.92} color="#fff5ff" groundColor="#9a6e9e" />
    <directionalLight position={[-4, 7, 5]} intensity={2.1} color="#fff0dc" castShadow shadow-mapSize-width={portrait ? 512 : 1024} shadow-mapSize-height={portrait ? 512 : 1024} />
    <pointLight position={[-3.3, 2.2, 1]} intensity={1.2} color="#ffacd0" distance={8} />
    <pointLight position={[3.7, 1.6, -1]} intensity={1.05} color="#cbb1ff" distance={8} />
    <CutenessGarden portrait={portrait} reducedMotion={reducedMotion} />
    <group position={portrait ? [-1.04, -0.74, 0.2] : [-2.15, -0.48, 0.16]} scale={portrait ? 0.47 : 0.94}>
      <PandaController />
    </group>
    <HeartMeter value={value} portrait={portrait} reducedMotion={reducedMotion} />
    <MagicalAtmosphere tint="#f2a9d0" reducedMotion={reducedMotion} portrait={portrait} />
    <Sparkles count={reducedMotion ? 0 : portrait ? 26 : 72} scale={[10, 5.8, 4]} size={2.1} speed={reducedMotion ? 0 : 0.14} opacity={0.72} color="#fff0bc" />
    {value >= 120 && <Sparkles count={reducedMotion ? 0 : portrait ? 25 : 48} scale={[4, 4, 2]} size={3} speed={reducedMotion ? 0 : 0.65} opacity={0.95} color="#fff0a7" />}
  </>;
}

export default function CutenessWorld({ value, reducedMotion, pageVisible }: { value: number; reducedMotion: boolean; pageVisible: boolean }) {
  return <Canvas frameloop={pageVisible ? "always" : "never"} shadows dpr={[1, 1.5]} camera={{ position: [0, 0.1, 9], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance", localClippingEnabled: true }} fallback={<div className="meter-webgl-fallback"><span>🐼</span><p>The magical garden needs WebGL to show its heart.</p></div>}>
    <CutenessWorldScene value={value} reducedMotion={reducedMotion} />
  </Canvas>;
}
