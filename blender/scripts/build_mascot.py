"""
Projekt Mascot — procedural static prototype v0.1

Run in Blender:
  blender --background --python blender/scripts/build_mascot.py

Or open Blender > Scripting, load this file and Run Script.

The script creates:
- MascotRoot
- Shell
- CoffeeVolume
- Crema
- Eye_L / Eye_R
- Mouth
- Camera
- simple studio lighting

It intentionally avoids fluid simulation. Coffee motion is implemented later.
"""

import bpy
import math
from pathlib import Path
from mathutils import Vector

SCRIPT_DIR=Path(__file__).resolve().parent
BLENDER_DIR=SCRIPT_DIR.parent
RENDER_DIR=BLENDER_DIR / "renders"
RENDER_DIR.mkdir(parents=True,exist_ok=True)

# ---------- reset ----------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
    pass

# ---------- helpers ----------
def mat_principled(name, base, roughness=.35, metallic=0.0, transmission=0.0, ior=1.45, alpha=1.0, emission=None, emission_strength=0.0):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    bsdf=m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value=(*base,1)
    bsdf.inputs["Roughness"].default_value=roughness
    bsdf.inputs["Metallic"].default_value=metallic
    bsdf.inputs["Alpha"].default_value=alpha
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value=transmission
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value=transmission
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value=ior
    if emission:
        key="Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value=(*emission,1)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value=emission_strength
    if alpha < 1.0:
        # Blender 4 used blend_method; Blender 5 replaced it with
        # surface_render_method. Keep both branches so the scene remains
        # reproducible in either supported major version.
        if hasattr(m, "surface_render_method"):
            m.surface_render_method='DITHERED'
        elif hasattr(m, "blend_method"):
            m.blend_method='HASHED'
        m.diffuse_color=(*base,alpha)
    return m

def rounded_cube(name, scale, bevel=.28, material=None, location=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=location)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel_mod=o.modifiers.new("SoftCorners","BEVEL")
    bevel_mod.width=bevel
    bevel_mod.segments=8
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.shade_smooth()
    if material: o.data.materials.append(material)
    return o

def uv_sphere(name, scale, material, location):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

# ---------- materials ----------
glass=mat_principled("M_Glass",(1.0,0.58,0.22),roughness=.12,transmission=.22,ior=1.44,alpha=.18)
coffee=mat_principled("M_Coffee",(0.18,0.035,0.008),roughness=.32,ior=1.33)
crema=mat_principled("M_Crema",(0.88,0.36,0.09),roughness=.54)
face=mat_principled("M_Face",(1.0,.93,.78),roughness=.28,emission=(1.0,.42,.08),emission_strength=3.0)

# ---------- root ----------
root=bpy.data.objects.new("MascotRoot",None)
bpy.context.collection.objects.link(root)

# Canonical dimensions roughly width:height:depth = 1.62:1:.72
shell=rounded_cube("Shell",(1.62,0.72,1.0),bevel=.38,material=glass)
shell.parent=root

# Coffee is intentionally inset from the shell.
coffee_obj=rounded_cube("CoffeeVolume",(1.48,0.62,0.63),bevel=.30,material=coffee,location=(0,0,-.25))
coffee_obj.parent=root

# Thin crema band close to the resting surface.
crema_obj=rounded_cube("Crema",(1.45,0.60,0.070),bevel=.08,material=crema,location=(0,0,.405))
crema_obj.parent=root

# Face sits slightly in front of the coffee, inside shell silhouette.
eye_l=uv_sphere("Eye_L",(.13,.055,.25),face,(-.48,-.675,-.12))
eye_r=uv_sphere("Eye_R",(.13,.055,.25),face,( .48,-.675,-.12))
for o in (eye_l,eye_r): o.parent=root

# Mouth as bevelled curve.
curve=bpy.data.curves.new("MouthCurve","CURVE")
curve.dimensions='3D'
curve.bevel_depth=.045
curve.bevel_resolution=6
s=curve.splines.new('BEZIER')
s.bezier_points.add(2)
pts=[(-.20,-.69,-.30),(0,-.71,-.39),(.20,-.69,-.30)]
for bp,co in zip(s.bezier_points,pts):
    bp.co=co
    bp.handle_left_type='AUTO'
    bp.handle_right_type='AUTO'
mouth=bpy.data.objects.new("Mouth",curve)
bpy.context.collection.objects.link(mouth)
mouth.data.materials.append(face)
mouth.parent=root

# ---------- ground ----------
ground_mat=mat_principled("M_Ground",(0.72,.52,.34),roughness=.7)
bpy.ops.mesh.primitive_plane_add(size=20, location=(0,0,-1.12))
ground=bpy.context.object; ground.name="Ground"; ground.data.materials.append(ground_mat)

# ---------- lights ----------
def area(name, loc, energy, size):
    data=bpy.data.lights.new(name,'AREA'); data.energy=energy; data.shape='DISK'; data.size=size
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); o.location=loc
    direction=Vector((0,0,0))-o.location
    o.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    return o

area("Key",(4,-5,5),900,4.0)
area("Fill",(-4,-3,2),500,3.0)
area("Rim",(2,3,4),650,2.5)

# ---------- camera ----------
cam_data=bpy.data.cameras.new("Camera")
cam=bpy.data.objects.new("Camera",cam_data)
bpy.context.collection.objects.link(cam)
cam.location=(0,-7.2,.25)
direction=Vector((0,0,-.05))-cam.location
cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
cam.data.lens=58
bpy.context.scene.camera=cam

# ---------- render ----------
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE' if bpy.app.version >= (5,0,0) else 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x=1200
scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(0.055,0.035,0.025)

# Color management
scene.view_settings.look='AgX - Medium High Contrast'

# ---------- review renders ----------
def aim_camera(location,target=(0,0,-.05),lens=58):
    cam.location=location
    direction=Vector(target)-cam.location
    cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    cam.data.lens=lens

review_views={
    "front":((0,-7.2,.25),(0,0,-.05),58),
    "three-quarter":((4.8,-5.8,1.0),(0,0,-.05),58),
    "side":((7.2,0,.20),(0,0,-.05),58),
    "rear":((0,7.2,.25),(0,0,-.05),58),
    "top":((0,-.15,8.0),(0,0,0),58),
}

for view_name,(location,target,lens) in review_views.items():
    aim_camera(location,target,lens)
    scene.render.filepath=str(RENDER_DIR / f"mascot_{view_name}_v01.png")
    bpy.ops.render.render(write_still=True)

# Restore the canonical front camera before saving the editable source scene.
aim_camera(*review_views["front"])
bpy.ops.wm.save_as_mainfile(filepath=str(BLENDER_DIR / "projekt_mascot_v01.blend"))
print(f"Projekt Mascot v0.1 scene and {len(review_views)} review renders generated in {BLENDER_DIR}.")
