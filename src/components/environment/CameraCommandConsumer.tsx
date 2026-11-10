"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBirthdayStore } from "@/store/birthdayStore";

type OrbitCommands = { setAzimuthalAngle: (angle: number) => void; getAzimuthalAngle: () => number; dollyIn: (scale: number) => void; dollyOut: (scale: number) => void; update: () => void };

export function CameraCommandConsumer() {
  const command = useBirthdayStore((state) => state.cameraCommand);
  const controls = useThree((state) => state.controls) as OrbitCommands | null;
  const lastId = useRef(0);
  useFrame(() => {
    if (!command || !controls || command.id === lastId.current) return;
    lastId.current = command.id;
    if (command.type === "turn_left") controls.setAzimuthalAngle(controls.getAzimuthalAngle() + Math.PI / 10);
    if (command.type === "turn_right") controls.setAzimuthalAngle(controls.getAzimuthalAngle() - Math.PI / 10);
    if (command.type === "zoom_in") controls.dollyIn(1.17);
    if (command.type === "zoom_out") controls.dollyOut(1.17);
    controls.update();
  });
  return null;
}
