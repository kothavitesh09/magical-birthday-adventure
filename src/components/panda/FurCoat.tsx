"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";

function createFiberGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([
    -0.002, 0, 0, 0.002, 0, 0, 0.0009, 0.052, 0.002, -0.001, 0.034, 0,
  ], 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3, 1, 3, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

/** Short, tapered fibers add a soft plush edge without external textures or models. */
export function FurCoat({ center, radii, count, excludeFace = false, faceDetail = false, frontOnly = false, color = "#fffaf7" }: {
  center: [number, number, number]; radii: [number, number, number]; count: number; excludeFace?: boolean; faceDetail?: boolean; frontOnly?: boolean; color?: string;
}) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => createFiberGeometry(), []);
  const dummy = useMemo(() => new Matrix4(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const [cx, cy, cz] = center;
  const [rx, ry, rz] = radii;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const normal = new Vector3();
    const location = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    let instance = 0;
    for (let i = 0; i < count && instance < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2;
      const ring = Math.sqrt(1 - y * y);
      const phi = goldenAngle * i;
      const x = Math.cos(phi) * ring;
      const z = Math.sin(phi) * ring;
      if (frontOnly && z <= 0.05) continue;
      if (excludeFace && z > 0.05) continue;
      if (faceDetail && z > 0.05) {
        const eyePatch = ((Math.abs(x) - 0.37) / 0.43) ** 2 + ((y - 0.32) / 0.46) ** 2 < 1;
        const muzzle = (x / 0.34) ** 2 + ((y + 0.18) / 0.2) ** 2 < 1;
        if (eyePatch || muzzle) continue;
      }

      location.set(x * rx, y * ry, z * rz);
      normal.set(x / rx, y / ry, z / rz).normalize();
      rotation.setFromUnitVectors(up, normal);
      const length = 0.72 + ((i * 37) % 31) / 100;
      scale.setScalar(length);
      dummy.compose(location, rotation, scale);
      mesh.setMatrixAt(instance, dummy);
      const shade = 0.96 + ((i * 19) % 17) / 425;
      mesh.setColorAt(instance, new Color(shade, shade * 0.99, shade * 0.97));
      instance += 1;
    }
    mesh.count = instance;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cx, cy, cz, count, dummy, excludeFace, faceDetail, frontOnly, geometry, rx, ry, rz, up]);

  return <instancedMesh ref={ref} args={[geometry, undefined, count]} position={center} frustumCulled={false}>
    <meshStandardMaterial color={color} roughness={0.96} side={2} />
  </instancedMesh>;
}
