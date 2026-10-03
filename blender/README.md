# Blender Prototype

The mascot's first 3D scene is generated procedurally so geometry and material decisions can be reproduced instead of living only in a binary `.blend` file.

## Requirements

Recommended: Blender 4.x.

## Generate the scene

From repository root:

```bash
blender --background --python blender/scripts/build_mascot.py
```

This creates:

```text
blender/projekt_mascot_v01.blend
```

The scene contains the canonical object hierarchy:
- MascotRoot
- Shell
- CoffeeVolume
- Crema
- Eye_L
- Eye_R
- Mouth

It also creates a simple camera, ground and studio light rig.

## Important

This is the **geometry/material prototype**, not the final render.

The script deliberately does not implement:
- liquid physics,
- animation,
- morph targets,
- production glass shader,
- GLB optimization.

Those are later roadmap phases.

## Review checklist

After generating the scene, review:
1. silhouette from front;
2. depth from 3/4;
3. whether the shell reads as sealed;
4. whether the body looks like a mascot rather than a drinking glass;
5. coffee headspace;
6. face size and placement.

Only after these are approved should the animation rig become stable.
