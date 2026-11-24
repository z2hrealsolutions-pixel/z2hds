# Ziya, the Z2H mascot

A small animated character that lives in the corner of every page. It is drawn in three ways and switches between them by itself.

| Tier | What | When | Download |
|---|---|---|---|
| 3d | The real 3D model, drawn live (three.js) | Good connection and a capable device | about 256 KB (engine 126, model 113, code 17) |
| 2d | Flat pre-rendered frames from the same model (`public/ziya/sprites`) | Data saver, slow connection, weak device, no WebGL, "Lite Ziya", lag, or the signal drops | about 60 KB idle, plus 20 to 80 KB per animation, loaded when needed |
| still | One picture, no movement | "Reduce motion" is on | about 41 KB |

## Files
- `pose.ts` pose model and every animation clip (`CLIPS`). Change a clip here and re-render the sprites.
- `rig.ts` builds the character from the model and draws a pose. `model.ts` loads `public/ziya/ziya.zm.gz`.
- `director.ts` decides what Ziya does: welcome, 75% stay in a corner / 25% walk to the other corner, walking to the page when something happens, sleep, hide.
- `sprites.ts` plays the 2D frames. `Ziya.tsx` is the page shell (tier choice, loading, bubble, menu, test panel). `ZiyaMount.tsx` loads it after the page is up.
- `emit.ts` lets any page tell Ziya something happened: `ziyaEmit("form-sent")`.

## Events
Ziya listens for the window event `ziya:event` (detail = name), and for a `postMessage` of `{type:"z2h-ziya", event}` from the estimator frame (the frame must carry `data-ziya-target`). Names: `file-dropped`, `estimate-ready`, `upload-error`, `file-invalid`, `form-sent`, `footer`. An element with `data-ziya-target` is where he walks to.

## Test panel
Add `?ziya=demo` to any page address to get a panel that triggers every moment.

## While a message shows
- The message appears at the instant the event happens (not after Ziya arrives), and stays through the walk and the reaction.
- For as long as a message is showing, Ziya looks straight at the visitor, standing or walking: eyes centred (the pointer is ignored) and the head turned fully to the front. When walking, the body turns only about half as far (a three-quarter walk).
- In the code this is `faceS` in `director.ts` (0 to 1), passed to the rig as `pose.face`. The flat version uses two extra strips for it, `walkFR` and `walkFL` (about 50 KB, loaded when idle). Rebuild only them with `ONLY=walkFR,walkFL node scripts/ziya/render-sprites.js <dir> 0.4`.

## Rebuilding the assets
1. Model: `node scripts/ziya/bake-model.mjs Ziya.glb public/ziya/ziya.zm.gz` (needs `@gltf-transform/core`, `@gltf-transform/functions`, `meshoptimizer`).
2. Sprites: run `NEXT_PUBLIC_ZIYA_LAB=1 npx next dev -p 3100`, then `node scripts/ziya/render-sprites.js frames 0.4` and `python3 scripts/ziya/pack-sprites.py frames public/ziya/sprites`.
The `/ziya-lab` page used for this returns 404 on the live site.
