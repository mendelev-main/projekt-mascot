# 3D Asset Contract

This contract defines names and coordinate conventions shared by Blender and the future web runtime.

## Coordinates

- X: horizontal / mascot left-right
- Y: depth
- Z: vertical
- origin: mascot body center
- front: negative Y
- up: positive Z

## Required exported nodes

```text
MascotRoot
Shell
ShellRimFront
CoffeeVolume
CremaSurface
Crema
Eye_L
Eye_R
Mouth
```

Names should remain stable after Phase 1 because the web runtime may address them directly.

## Materials

Expected logical materials:
- M_Glass
- M_GlassEdge
- M_Coffee
- M_CremaTop
- M_Crema
- M_Bubble
- M_Face

`CremaBubble_01` … `CremaBubble_07` are optional visual-detail nodes. The web
runtime groups them with `CoffeeVolume`, `CremaSurface` and `Crema` under the
liquid motion driver.

Web runtime is allowed to replace/tune materials after GLB loading.

## Scale

The web runtime should treat the mascot as unit-independent and normalize based on its bounding box.

## Animation contract

Future GLB clips should use stable semantic names where possible:
- idle
- blink
- happy
- surprised
- sleepy
- success

Coffee slosh is expected to be driven primarily at runtime, so it should not depend on a long baked animation.

## Compatibility rule

Any breaking rename of exported nodes, materials, morph targets, or animation clips must update this document and the web loader in the same change.
