# Technical Architecture

## 1. Objective

Build one reusable interactive mascot component that can be embedded into the cafe website without coupling it to a specific page implementation.

## 2. Asset pipeline

```text
Blender source (.blend)
        ↓
clean object hierarchy
        ↓
materials / morphs / animation clips
        ↓
GLB export
        ↓
web optimization
        ↓
Three.js loader
        ↓
MascotController API
```

## 3. Proposed Blender object hierarchy

```text
MascotRoot
├── Shell
├── CoffeeVolume
│   ├── CoffeeBody
│   └── Crema
├── Face
│   ├── Eye_L
│   ├── Eye_R
│   └── Mouth
└── ShadowProxy (optional; not exported if unnecessary)
```

The exact implementation may change after the first prototype.

## 4. Face implementation

Preferred order of exploration:

1. simple geometry / emissive planes,
2. morph targets for facial shape changes,
3. texture atlas only if it gives a clear performance or workflow advantage.

We should avoid baking every expression into a separate full model.

## 5. Coffee implementation strategy

### v0.1
Pseudo-physical deformation.

Options to prototype:
- vertex deformation controlled by a small number of morph targets,
- shader displacement of the upper liquid region,
- bone/lattice deformation exported from Blender,
- hybrid: geometry tilt + shader surface wave.

Selection criteria:
- looks convincing,
- works in GLB/Three.js,
- mobile friendly,
- easy to tune.

### Later
Only consider more advanced WebGL liquid simulation if the visual improvement justifies performance and complexity.

## 6. Runtime controller

Proposed public API:

```ts
type MascotEmotion =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'surprised'
  | 'thinking'
  | 'sad'
  | 'sleepy'
  | 'success'
  | 'focused';

interface MascotController {
  setEmotion(emotion: MascotEmotion): void;
  lookAt(x: number, y: number): void;
  moveTo(x: number, y: number, options?: MoveOptions): Promise<void>;
  impulse(type: 'tap' | 'jump' | 'success'): void;
  setReducedMotion(enabled: boolean): void;
  destroy(): void;
}
```

The website should not need to know how coffee deformation is implemented.

## 7. State machine

Suggested high-level states:

```text
BOOT
 ↓
IDLE
 ├── LOOKING
 ├── REACTING
 ├── MOVING
 ├── FOCUSED
 ├── SLEEPY
 └── ERROR
```

Emotion and motion should be separable where possible.

Example:
the mascot can be `happy` while `MOVING`.

## 8. Rendering

Initial target:
- Three.js WebGL renderer,
- physically plausible but simplified transparent shell,
- tone mapping tuned once,
- one compact environment/light rig,
- transparent canvas option if needed for site placement.

## 9. Mobile constraints

Targets for prototype:
- smooth interaction on modern iPhone/iPad/Android devices,
- responsive DPR cap,
- compressed GLB,
- avoid large texture dependencies,
- stop animation when not visible.

Initial performance budget (to validate, not absolute):
- GLB preferably under 2–3 MB,
- minimal texture count,
- no 4K textures,
- limited draw calls,
- one main mascot instance.

## 10. Web test harness

Before integration into the production website, create a standalone playground with:
- neutral background,
- mascot canvas,
- emotion buttons,
- movement buttons,
- slosh strength slider,
- damping slider,
- reduced motion toggle,
- FPS/debug info in development mode.

This playground becomes the acceptance environment for all animation changes.

## 11. Fallback

If WebGL is unavailable or performance is unacceptable:
- show a static optimized image or lightweight pre-rendered idle asset,
- preserve ordering functionality.

The mascot must never block the website's primary ordering flow.
