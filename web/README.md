# Web Playground

Standalone Three.js environment for developing the mascot before production-site integration.

## Run

```bash
cd web
npm install
npm run dev
```

Then open the local Vite URL.

## Current prototype

The current geometry is intentionally a placeholder. It validates:
- renderer setup;
- responsive canvas;
- MascotController API;
- pointer look;
- horizontal movement;
- spring/damping coffee slosh driver;
- reaction impulses;
- reduced-motion switch.

The procedural Blender model will replace the placeholder through GLB loading after the static 3D design is approved.

## Why build the runtime now?

The signature feature—coffee reacting to acceleration—depends on runtime motion. Building the controller independently lets us tune behavior before committing to a specific mesh deformation technique.
