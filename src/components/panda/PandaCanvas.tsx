"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { PandaController } from "@/components/panda/PandaController";
import { PlaygroundEnvironment } from "@/components/environment/PlaygroundEnvironment";
import { SceneLighting } from "@/components/environment/SceneLighting";
import { CameraCommandConsumer } from "@/components/environment/CameraCommandConsumer";
import { usePageVisible } from "@/hooks/motion";

export default function PandaCanvas() {
  const pageVisible = usePageVisible();
  const [webgl] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch { return false; }
  });

  if (!webgl) return <div className="webgl-fallback"><p>The 3D panda needs WebGL to render in this browser.</p><span>Enable WebGL and reload the playground.</span></div>;

  return <div className="canvas-wrap"><Canvas frameloop={pageVisible ? "always" : "never"} dpr={[1, 1.55]} camera={{ position: [0, 1.25, 5.3], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
    <color attach="background" args={["#c6a6d8"]} /><fog attach="fog" args={["#c6a6d8", 9, 18]} />
    <SceneLighting /><Suspense fallback={null}>
      <PlaygroundEnvironment />
      <Float speed={1.3} rotationIntensity={0.025} floatIntensity={0.07}>
        <PandaController />
      </Float>
      <Sparkles count={70} scale={[9, 5, 4]} size={2.3} speed={0.22} opacity={0.72} color="#fff0b8" />
    </Suspense>
    <OrbitControls makeDefault target={[0, 0.54, 0]} enablePan={false} minDistance={3.5} maxDistance={8} minPolarAngle={Math.PI * 0.25} maxPolarAngle={Math.PI * 0.67} enableDamping dampingFactor={0.08} />
    <CameraCommandConsumer />
  </Canvas></div>;
}
