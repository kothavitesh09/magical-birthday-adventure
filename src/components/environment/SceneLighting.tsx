"use client";

export function SceneLighting() {
  return <>
    <ambientLight intensity={0.92} color="#ffe8f5" />
    <hemisphereLight intensity={0.8} color="#fff3fa" groundColor="#8d638d" />
    <directionalLight position={[-4, 7, 5]} intensity={2.25} color="#fff3dd" />
    <pointLight position={[3, 2.5, 2]} intensity={32} color="#ff89bd" distance={9} />
    <pointLight position={[-4, 1, -1]} intensity={18} color="#cbb2ff" distance={8} />
  </>;
}
