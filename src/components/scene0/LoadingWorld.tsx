"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera as DreiPerspectiveCamera, Sparkles } from "@react-three/drei";
import { ExtrudeGeometry, Group, Shape } from "three";
import { PandaController } from "@/components/panda/PandaController";

function makeCloudShape() {
  const shape = new Shape();
  shape.moveTo(-1, -0.26);
  shape.bezierCurveTo(-1.45, -0.18, -1.35, 0.34, -0.92, 0.36);
  shape.bezierCurveTo(-0.82, 0.93, -0.08, 0.96, 0.15, 0.53);
  shape.bezierCurveTo(0.54, 0.89, 1.12, 0.65, 1.04, 0.24);
  shape.bezierCurveTo(1.57, 0.21, 1.54, -0.33, 1.04, -0.35);
  shape.lineTo(-1, -0.26);
  return shape;
}

function CloudBank({ foreground = false, reducedMotion = false }: { foreground?: boolean; reducedMotion?: boolean }) {
  const cloud = useMemo(() => makeCloudShape(), []);
  const puffPositions: readonly (readonly [number, number, number, number])[] = foreground
    ? [[-2.18, -1.72, 0.7, 0.86], [-1.15, -1.82, 0.65, 0.74], [0, -1.91, 0.82, 0.8], [1.23, -1.82, 0.72, 0.82], [2.18, -1.68, 0.86, 0.75]]
    : [[-2.55, -0.96, -1.05, 0.82], [-1.4, -1.16, -0.8, 0.88], [0, -1.28, -0.72, 0.93], [1.42, -1.15, -0.82, 0.9], [2.58, -0.9, -1.04, 0.82]];
  return <group>
    {puffPositions.map(([x, y, z, scale], index) => <Float key={index} speed={reducedMotion ? 0 : foreground ? 0.16 + index * 0.018 : 0.12 + index * 0.014} floatIntensity={reducedMotion ? 0 : foreground ? 0.04 : 0.055} rotationIntensity={reducedMotion ? 0 : 0.008}>
      <group position={[x, y, z]} scale={scale}>
        <mesh position={[0, -0.12, 0]} rotation={[0.06, 0, 0]}>
          <extrudeGeometry args={[cloud, { depth: 0.28, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.12, bevelThickness: 0.12, curveSegments: 18 }]} />
          <meshPhysicalMaterial color={index % 2 === 0 ? "#e9c4ff" : "#ffd0ec"} roughness={0.96} clearcoat={0.04} />
        </mesh>
        {[-0.6, -0.12, 0.42].map((offset, i) => <mesh key={offset} position={[offset, 0.03 + (i % 2) * 0.07, 0.25]} scale={[0.74 - i * 0.08, 0.43 + (i % 2) * 0.08, 0.28]}>
          <sphereGeometry args={[0.66, 28, 20]} />
          <meshPhysicalMaterial color={i === 1 ? "#fff0fb" : index % 2 ? "#f4d5ff" : "#ffd9f0"} roughness={0.94} clearcoat={0.04} />
        </mesh>)}
      </group>
    </Float>)}
  </group>;
}

function makeStar() {
  const shape = new Shape();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? 0.22 : 0.095;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  return new ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.018, bevelThickness: 0.02, curveSegments: 4 });
}

function DreamStars({ reducedMotion }: { reducedMotion: boolean }) {
  const geometry = useMemo(() => makeStar(), []);
  const stars = [[-2.5, 1.15, -1.4, 0.9], [-1.18, 1.68, -1.8, 0.56], [0.1, 1.45, -1.9, 0.44], [2.4, 1.08, -1.2, 0.78], [1.4, 1.78, -1.9, 0.45], [-2.95, 0.1, -1.25, 0.38], [2.95, 0.13, -1.2, 0.4]];
  return <group>
    {stars.map(([x, y, z, scale], index) => <Float key={index} speed={reducedMotion ? 0 : 0.42 + index * 0.04} floatIntensity={reducedMotion ? 0 : 0.055} rotationIntensity={reducedMotion ? 0 : 0.14}>
      <mesh geometry={geometry} position={[x, y, z]} scale={scale}>
        <meshStandardMaterial color="#ffe1a1" emissive="#ffc96b" emissiveIntensity={0.7} roughness={0.36} metalness={0.12} />
      </mesh>
    </Float>)}
    <Sparkles count={reducedMotion ? 20 : 54} scale={[7.2, 4, 3]} size={1.65} speed={reducedMotion ? 0 : 0.12} opacity={0.72} color="#ffe7bf" />
  </group>;
}

function SleepGlyph({ position, scale, delay = 0, reducedMotion }: { position: [number, number, number]; scale: number; delay?: number; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const shape = useMemo(() => {
    const glyph = new Shape();
    glyph.moveTo(-0.14, 0.2); glyph.lineTo(0.15, 0.2); glyph.lineTo(-0.13, -0.17); glyph.lineTo(0.17, -0.17); glyph.lineTo(0.17, -0.08); glyph.lineTo(0.03, -0.08); glyph.lineTo(0.3, 0.29); glyph.lineTo(-0.14, 0.29); glyph.closePath();
    return glyph;
  }, []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime + delay;
    group.current.position.y = position[1] + (reducedMotion ? 0 : Math.sin(t * 0.8) * 0.045);
    group.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.55) * 0.08;
  });
  return <group ref={group} position={position} scale={scale}>
    <mesh position={[0, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#ffe7ac" emissive="#ffd37d" emissiveIntensity={0.7} side={2} />
    </mesh>
  </group>;
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const readyCallback = useRef(onReady);
  useEffect(() => { readyCallback.current = onReady; }, [onReady]);
  useEffect(() => {
    const timer = window.setTimeout(() => readyCallback.current(), 100);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}

function LoadingScene({ reducedMotion, onReady }: { reducedMotion: boolean; onReady: () => void }) {
  const { size, setDpr } = useThree();
  const portrait = size.width < 700;
  useEffect(() => { setDpr(portrait ? 1 : size.width < 1200 ? 1.2 : 1.45); }, [portrait, setDpr, size.width]);
  return <>
    <DreiPerspectiveCamera makeDefault position={[0, 0.72, 8.8]} fov={35} />
    <color attach="background" args={["#25134a"]} />
    <fog attach="fog" args={["#352052", 7, 15]} />
    <ambientLight intensity={0.92} color="#e9d7ff" />
    <hemisphereLight intensity={0.9} color="#ffe6f4" groundColor="#6a4b8c" />
    <directionalLight position={[-3.8, 5.2, 4]} intensity={1.45} color="#fff0e2" />
    <pointLight position={[-2.2, 2.4, 2.4]} intensity={2.4} color="#ffb8db" distance={7} />
    <pointLight position={[2.1, 1.1, -0.4]} intensity={1.7} color="#b998ff" distance={7} />
    <DreamStars reducedMotion={reducedMotion} />
    <CloudBank reducedMotion={reducedMotion} />
    <group position={[0, -0.25, 0.08]} scale={portrait ? 0.82 : 0.92}>
      <PandaController />
    </group>
    <SleepGlyph position={[0.83, 1.18, 0.25]} scale={0.72} reducedMotion={reducedMotion} />
    <SleepGlyph position={[1.14, 1.48, 0.2]} scale={0.52} delay={1.8} reducedMotion={reducedMotion} />
    <CloudBank foreground reducedMotion={reducedMotion} />
    <FirstFrame onReady={onReady} />
  </>;
}

export default function LoadingWorld({ reducedMotion, onReady, onError }: { reducedMotion: boolean; onReady: () => void; onError: () => void }) {
  return <Canvas
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    shadows
    dpr={[1, 1.45]}
    camera={{ position: [0, 0.72, 8.8], fov: 35 }}
    gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    onCreated={({ gl }) => { gl.setClearColor("#25134a", 1); }}
    onError={onError}
  >
    <LoadingScene reducedMotion={reducedMotion} onReady={onReady} />
  </Canvas>;
}
