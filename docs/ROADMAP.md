# Implementation roadmap

## Phase 0 — Specification and design lock
**Status: VISUAL APPROVAL PENDING**

Completed: concept, no-limbs rule, sealed shell, internal animated coffee,
minimal face, motion language, Blender → GLB → Three.js pipeline and canonical
model-sheet candidate.

Pending visual decisions:
- [ ] final approval of front and 3/4 proportions
- [ ] final approval of side depth and coffee fill level
- [ ] final approval of neutral glass/material reference

---

## Phase 1 — Static 3D prototype
**Status: COMPLETE — v0.4 candidate**

- [x] shell, coffee volume, crema surface/band and bubbles
- [x] neutral emissive face
- [x] stable materials and semantic node hierarchy
- [x] front, 3/4, side, rear and top review renders
- [x] reproducible Blender generation script
- [x] editable Blender scene and runtime GLB export
- [x] automatic GLB contract/size validation

Further visual refinement can happen without breaking the asset contract.

---

## Phase 2 — Face and emotion system
**Status: COMPLETE IN WEB RUNTIME**

- [x] neutral
- [x] happy
- [x] excited
- [x] surprised
- [x] thinking
- [x] sad
- [x] sleepy
- [x] success
- [x] focused/loading
- [x] blink system

Future improvement: replace runtime scale/rotation expressions with authored
morph targets if the quality gain justifies the extra asset complexity.

---

## Phase 3 — Coffee motion prototype
**Status: IN PROGRESS**

- [x] deterministic spring/damping model
- [x] horizontal acceleration response
- [x] settling oscillation
- [x] reaction impulse
- [x] idle micro-wave in the procedural fallback
- [x] tuneable slosh strength and damping
- [ ] vertical acceleration and landing response
- [ ] GLB surface morph or shader deformation

The canonical GLB liquid group already tilts from motion. Fine surface waves are
currently visible in the procedural fallback and remain the next 3D runtime task.

---

## Phase 4 — Web runtime
**Status: COMPLETE — playground v0.4**

- [x] GLB export and loading
- [x] Three.js scene and lighting
- [x] responsive renderer and model framing
- [x] `MascotController`
- [x] emotion switching and pointer tracking
- [x] movement API connected to coffee inertia
- [x] pause simulation/rendering while hidden or offscreen
- [x] `prefers-reduced-motion` support
- [x] procedural load-error fallback
- [x] static WebGL-context fallback

---

## Phase 5 — Polish and optimization
**Status: IN PROGRESS**

- [x] GLB under the 3 MiB prototype budget
- [x] DPR cap and responsive framing
- [x] static fallback asset
- [x] desktop browser acceptance pass
- [ ] compress geometry where it produces a meaningful size reduction
- [ ] tune glass and coffee on light/dark production backgrounds
- [ ] add stable visual regression references
- [ ] physical iPhone/iPad/Android performance QA

---

## Phase 6 — Website integration
**Status: NOT STARTED**

Candidate integration events:
- [ ] website entry greeting
- [ ] product hover / add to cart / remove from cart
- [ ] checkout loading and order success
- [ ] network error and high-load notice
- [ ] inactivity/sleep

Integration stays gradual. Mascot failures must never block the ordering flow.

---

# v0.4 acceptance snapshot

- [x] sealed capsule with no opening, ring or limbs
- [x] transparent shell, readable coffee and clear face
- [x] idle, blink and pointer tracking
- [x] nine emotion states
- [x] horizontal movement and damped coffee response
- [x] reduced-motion mode
- [x] standalone browser demo with real GLB
- [x] procedural and static fallback paths
- [ ] final visual sign-off against the model sheet
- [ ] physical mobile performance sign-off
