# Magical Birthday Adventure — Panda Playground

The current phase is an interactive character playground built with Next.js, React Three Fiber, Drei, Zustand, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run typecheck`, `npm run lint`, and `npm run build` for validation.

## Character status and limits

`PandaCharacter` is a custom procedural baby panda prototype with deformed plush head/body meshes, a layered face, animated eyelids, articulated shoulder/elbow/paw and hip/foot pivots, and short instanced silhouette fibers. It has randomized idle glances and tilts, breathing, blinks, expression controls, pause/resume, and 44 named action controls. The pose controller blends procedural poses and returns one-shot actions to idle.

The latest reference-inspired pass enlarges the head and glossy eyes, rounds the eye patches, adds a twin muzzle and nostrils, warms the coat, softens the blush with a radial texture, broadens the belly, and adds sparse instanced fur detail across the face and body. This is a procedural interpretation of the supplied panda image, not a pixel-perfect match.

This remains a **temporary procedural prototype**, not a production-ready animated-film character. It does not use a GLB, skeletal skinning, blend shapes, or authored animation clips. All 44 playground actions are procedural pose curves; walk/run have no foot locking, and the assembled forms do not deform like a weight-painted character. Facial pieces also read as separate pieces from profile, so the side view is not at the reference quality yet. Emotion selectors include neutral, happy, sad, surprised, curious, sleepy, shy, blushing, excited, proud, affectionate, and embarrassed; they affect eye openness, gaze, mouth, blush, paws, and/or body pose. Birthday actions now include peeking, stepping out, meter reaction, door presentation and glances, letter/heart presentation, wish and candle sequences, cheek/eye hiding, gift hiding/pop, and a finale dance. The gift box and paper props are procedural scene geometry.

No character model was present locally. A visually relevant downloadable rigged cartoon panda is listed on [Sketchfab by MR7](https://sketchfab.com/3d-models/panda-cartoon-cute-animated-rigged-b9229a00d4084ca0832381cecf970c07) under CC BY attribution, but the model file could not be fetched and inspected in this environment, so it is not bundled or represented as verified. Its actual skeleton and facial controls still need inspection. The required production asset is a plush-styled, licensed GLB with verified rig, eye/face controls, and clips suitable for retargeting or replacement.

The playground environment uses local Three.js geometry and lighting, with no remote HDR download required. Run `npm run dev` to open it at `http://localhost:3000`.
