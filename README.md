# Projekt Mascot

Interactive mascot project for the cafe **Projekt**.

The goal is to create a lightweight, recognizable, futuristic coffee mascot that can live inside the website UI, react to user actions, express emotions, and move with believable coffee sloshing inside its transparent body.

## Core concept

The mascot is **not tied to the word "Projekt" visually**. It should work as an independent character and brand asset.

### Visual identity
- Horizontal rounded rectangular / capsule-like body.
- No sharp corners.
- No arms or legs.
- No openings, lid, rim, handle, straw, or top ring.
- Fully closed transparent shell.
- The shell is glass-like, but visually clean rather than photorealistically complex.
- Inside the shell is coffee.
- Coffee should have visible body/volume and a subtle crema layer.
- Face is minimal and futuristic:
  - two simple glowing eyes,
  - one simple glowing mouth,
  - expressions should read like emoji / AI assistant reactions.
- The character should feel like a compact digital assistant in physical form.
- No unnecessary decorations.
- Background is not part of the character asset; the mascot must work on different site backgrounds.

## Design principles

1. **Simple silhouette first**  
   The mascot must remain recognizable at small sizes, including mobile UI.

2. **Coffee is part of the character**  
   The internal coffee is not just a texture. It should visibly react to movement.

3. **Emotion through the face, not limbs**  
   Since there are no arms or legs, personality comes from:
   - eyes,
   - mouth,
   - tilt,
   - squash/stretch,
   - floating motion,
   - coffee movement.

4. **Futuristic, not robotic**  
   The mascot should feel like an AI companion but remain warm, friendly, and cafe-related.

5. **Animation must support UX**  
   Reactions should communicate state and guide the user rather than becoming decoration that distracts from ordering.

## Technical direction

Primary pipeline:

```text
Concept / model sheet
        ↓
Blender source model
        ↓
Materials + face system
        ↓
Coffee deformation / slosh system
        ↓
Animation states
        ↓
GLB / glTF export
        ↓
Three.js web runtime
        ↓
Website integration
```

### Proposed stack
- Blender — modeling, materials, animation authoring.
- Blender Python — reproducible generation/setup where practical.
- glTF / GLB — delivery format.
- Three.js — web rendering and runtime animation.
- JavaScript / TypeScript — state machine and interaction logic.
- Optional custom shader — only if required for better glass/liquid quality at acceptable mobile cost.

## Current release candidate: Prototype v0.4

Prototype v0.4 proves the complete Blender → GLB → Three.js path before
integration into the live website.

Required:
- transparent closed body,
- coffee volume inside,
- approved neutral face,
- idle floating,
- blinking,
- pointer tracking,
- basic happy/sad/surprised states,
- movement left/right,
- coffee inertia while moving,
- coffee settling after movement,
- basic squash on landing / reaction,
- responsive canvas,
- acceptable mobile performance.

Not required for v0.1:
- full fluid simulation,
- speech,
- sound,
- production website integration,
- large emotion library,
- complex accessories,
- photorealistic caustics/refraction.

## Repository structure

```text
projekt-mascot/
├── README.md
├── docs/
│   ├── DESIGN.md
│   ├── ANIMATION.md
│   ├── TECHNICAL.md
│   └── ROADMAP.md
├── references/
├── blender/
│   └── scripts/
├── models/
├── web/
└── experiments/
    └── liquid/
```

Canonical generated assets are versioned in `blender/` and `models/`. The web
build copies them into its generated `public` directory automatically.

## Status

**Runtime v0.4 is complete; final visual approval and physical mobile QA remain.**

Available now:
- editable Blender v0.4 scene and five review angles;
- validated 591 KB GLB with stable semantic nodes;
- nine emotion states, blink and pointer tracking;
- movement-driven coffee inertia with spring/damping controls;
- reduced-motion, offscreen pause and two fallback levels;
- reproducible asset sync, production build and GitHub Pages workflow.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for current completion and the next
quality pass.
