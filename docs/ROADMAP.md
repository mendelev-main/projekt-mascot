# Implementation Roadmap

## Phase 0 — Specification and design lock
**Status: IN PROGRESS**

Goal: remove ambiguity before 3D work.

Tasks:
- [x] define mascot concept
- [x] define no-limbs rule
- [x] define sealed transparent shell
- [x] define coffee as internal animated mass
- [x] define minimal AI-like face
- [x] define initial animation language
- [x] choose Blender → GLB → Three.js direction
- [x] create final model sheet candidate
- [ ] approve front proportions
- [ ] approve 3/4 proportions
- [ ] approve side depth
- [ ] approve coffee fill level
- [ ] approve neutral material/lighting reference

Exit criteria:
one approved visual reference that can be modeled without interpretation.

---

## Phase 1 — Static 3D prototype
**Status: NOT STARTED**

Goal: reproduce the approved design in Blender.

Tasks:
- [ ] build Shell
- [ ] build inner coffee volume
- [ ] create crema
- [ ] create neutral face
- [ ] define clean materials
- [ ] create neutral studio render
- [ ] validate silhouette from multiple angles
- [ ] create reproducible Blender setup/script where useful

Exit criteria:
static mascot matches the approved design.

---

## Phase 2 — Face and emotion system
**Status: NOT STARTED**

Goal: one model, multiple expressions.

Tasks:
- [ ] neutral
- [ ] happy
- [ ] excited
- [ ] surprised
- [ ] thinking
- [ ] sad
- [ ] sleepy
- [ ] success
- [ ] focused/loading
- [ ] blink system

Exit criteria:
expressions are readable at desktop and mobile UI sizes.

---

## Phase 3 — Coffee motion prototype
**Status: NOT STARTED**

Goal: convincing liquid inertia without heavy fluid simulation.

Tasks:
- [ ] test deformation approaches
- [ ] horizontal acceleration response
- [ ] vertical acceleration response
- [ ] spring/damping model
- [ ] settling oscillation
- [ ] jump impulse
- [ ] landing impulse
- [ ] idle micro-wave
- [ ] expose tuneable parameters

Exit criteria:
coffee visibly reacts to movement and settles naturally.

---

## Phase 4 — Web runtime
**Status: NOT STARTED**

Goal: run the mascot as a reusable browser component.

Tasks:
- [ ] export GLB
- [ ] Three.js scene
- [ ] responsive renderer
- [ ] lighting/environment
- [ ] load model
- [ ] MascotController
- [ ] emotion state switching
- [ ] pointer tracking
- [ ] movement API
- [ ] connect movement acceleration to coffee
- [ ] pause when hidden/offscreen
- [ ] prefers-reduced-motion support

Exit criteria:
standalone playground works reliably on desktop and mobile.

---

## Phase 5 — Polish and optimization
**Status: NOT STARTED**

Tasks:
- [ ] reduce model size
- [ ] optimize draw calls
- [ ] tune glass for mobile
- [ ] tune coffee visibility on light/dark backgrounds
- [ ] test Retina/high-DPR behavior
- [ ] add static fallback
- [ ] visual regression references
- [ ] browser/device QA

Exit criteria:
prototype is suitable for production integration.

---

## Phase 6 — Website integration
**Status: NOT STARTED**

Possible first integration points:
- [ ] website entry greeting
- [ ] add-to-cart reaction
- [ ] cart state
- [ ] checkout/loading
- [ ] order success
- [ ] network error
- [ ] high-load notice
- [ ] inactivity/sleep

Important:
integration should be added gradually. The mascot must never interfere with the primary ordering flow.

---

# v0.1 Acceptance checklist

The first meaningful release is complete when:

- [ ] mascot shape matches approved concept
- [ ] no opening/ring/limbs
- [ ] glass is visually clean
- [ ] coffee is readable through shell
- [ ] face is clear
- [ ] idle animation works
- [ ] blinking works
- [ ] pointer tracking works
- [ ] at least 4 emotions work
- [ ] mascot can move left/right
- [ ] coffee sloshes opposite acceleration
- [ ] coffee settles with damping
- [ ] mobile performance is acceptable
- [ ] reduced-motion mode exists
- [ ] standalone web demo is available
