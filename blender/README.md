# Blender Prototype

The mascot's first 3D scene is generated procedurally so geometry and material decisions can be reproduced instead of living only in a binary `.blend` file.

## Requirements

Supported: Blender 4.x and Blender 5.x.

## Generate the scene

From repository root:

```bash
blender --background --python blender/scripts/build_mascot.py
```

This creates:

```text
blender/projekt_mascot_v01.blend
blender/renders/mascot_front_v01.png
blender/renders/mascot_three-quarter_v01.png
blender/renders/mascot_side_v01.png
blender/renders/mascot_rear_v01.png
blender/renders/mascot_top_v01.png
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

## v0.1 review result

The generated front, three-quarter, side, rear and top renders confirm the
sealed horizontal capsule silhouette, the target depth and the face-free rear.
The scene is ready for proportion review. Glass clarity, coffee color and the
crema transition remain deliberately open for the next material pass after the
proportions are approved.
