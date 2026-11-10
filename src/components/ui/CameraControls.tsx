"use client";

import { useBirthdayStore } from "@/store/birthdayStore";

export function CameraControls() {
  const cameraAction = useBirthdayStore((state) => state.cameraAction);
  return <div className="camera-toolbar" role="group" aria-label="Character camera controls">
    <span>VIEW</span>
    <button onClick={() => cameraAction("turn_left")} aria-label="Rotate view left">↶</button>
    <button onClick={() => cameraAction("turn_right")} aria-label="Rotate view right">↷</button>
    <i />
    <button onClick={() => cameraAction("zoom_out")} aria-label="Zoom out">−</button>
    <button onClick={() => cameraAction("zoom_in")} aria-label="Zoom in">+</button>
  </div>;
}
