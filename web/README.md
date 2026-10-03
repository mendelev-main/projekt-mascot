# Web playground

Standalone Three.js acceptance environment for the Projekt mascot.

```bash
cd web
npm install
npm run dev
```

`predev` and `prebuild` copy the canonical GLB and front render into Vite's
generated `public` directory. The source assets remain single-copy files at the
repository root.

## Runtime v0.5

- loads `models/projekt-mascot-v05.glb` by stable semantic node names;
- keeps the earlier procedural mascot as an automatic load-error fallback;
- falls back to the static front render if the WebGL context is lost;
- supports neutral, happy, excited, surprised, thinking, sad, sleepy, success
  and focused states;
- provides blinking, pointer look, horizontal movement and reaction impulses;
- drives coffee tilt and settling from movement acceleration;
- respects reduced-motion preferences;
- pauses simulation and rendering while hidden or offscreen;
- frames the model responsively for wide, narrow and mobile stages.

Run the production checks with:

```bash
python3 scripts/validate_glb.py models/projekt-mascot-v05.glb
cd web && npm run build
```
