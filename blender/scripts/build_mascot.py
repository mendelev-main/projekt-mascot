"""Build the editable Projekt mascot v0.4 scene, review renders and runtime GLB.

The scene uses inexpensive geometry and Eevee-safe materials so the same
hierarchy can later be exported to glTF. Liquid simulation comes later.
"""

import math
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
BLENDER_DIR = SCRIPT_DIR.parent
RENDER_DIR = BLENDER_DIR / "renders"
MODEL_DIR = BLENDER_DIR.parent / "models"
RENDER_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)
VERSION = "v04"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials,
                   bpy.data.cameras, bpy.data.lights):
    for datablock in list(datablocks):
        if datablock.users == 0:
            datablocks.remove(datablock)


def material(name, base, *, roughness=0.35, metallic=0.0, transmission=0.0,
             ior=1.45, alpha=1.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Alpha"].default_value = alpha
    transmission_key = "Transmission Weight" if "Transmission Weight" in bsdf.inputs else "Transmission"
    bsdf.inputs[transmission_key].default_value = transmission
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if emission:
        emission_key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
        bsdf.inputs[emission_key].default_value = (*emission, 1)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1.0:
        if hasattr(mat, "surface_render_method"):
            try:
                mat.surface_render_method = "BLENDED"
            except TypeError:
                mat.surface_render_method = "DITHERED"
        elif hasattr(mat, "blend_method"):
            mat.blend_method = "HASHED"
        mat.diffuse_color = (*base, alpha)
    return mat


def rounded_cube(name, scale, bevel, mat, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("SoftCorners", "BEVEL")
    modifier.width = bevel
    modifier.segments = 10
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    return obj


def uv_sphere(name, scale, mat, location, segments=40):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=20, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj


def poly_curve(name, points, bevel, mat, cyclic=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 4
    curve.bevel_depth = bevel
    curve.bevel_resolution = 5
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def superellipse_ring(name, half_width, half_height, depth, bevel, mat, samples=96):
    points = []
    power = 2 / 4.2
    for index in range(samples):
        angle = math.tau * index / samples
        cosine = math.cos(angle)
        sine = math.sin(angle)
        x = half_width * math.copysign(abs(cosine) ** power, cosine)
        z = half_height * math.copysign(abs(sine) ** power, sine)
        points.append((x, depth, z))
    return poly_curve(name, points, bevel, mat, cyclic=True)


def area_light(name, location, energy, color, radius):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = color
    data.shape = "DISK"
    data.size = radius
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


glass = material("M_Glass", (1.0, 0.55, 0.20), roughness=0.08,
                 transmission=0.30, ior=1.44, alpha=0.20)
glass_edge = material("M_GlassEdge", (0.82, 0.20, 0.025), roughness=0.24, alpha=0.38)
coffee_mat = material("M_Coffee", (0.030, 0.0035, 0.0008), roughness=0.23, ior=1.33)
crema_top_mat = material("M_CremaTop", (0.62, 0.10, 0.010), roughness=0.48)
crema_mat = material("M_Crema", (0.88, 0.24, 0.025), roughness=0.50)
bubble_mat = material("M_Bubble", (0.45, 0.075, 0.006), roughness=0.44)
face_mat = material("M_Face", (1.0, 0.91, 0.68), roughness=0.24,
                    emission=(1.0, 0.28, 0.035), emission_strength=4.2)
ground_mat = material("M_Ground", (0.78, 0.58, 0.42), roughness=0.76)

root = bpy.data.objects.new("MascotRoot", None)
bpy.context.collection.objects.link(root)

shell = rounded_cube("Shell", (1.62, 0.72, 1.0), 0.38, glass)
shell.parent = root
shell_rim = superellipse_ring("ShellRimFront", 1.578, 0.958, -0.724, 0.010, glass_edge)
shell_rim.parent = root
coffee = rounded_cube("CoffeeVolume", (1.48, 0.61, 0.64), 0.22, coffee_mat, (0, 0, -0.27))
coffee.parent = root
crema_surface = rounded_cube("CremaSurface", (1.365, 0.54, 0.018), 0.018, crema_top_mat, (0, 0, 0.365))
crema_surface.parent = root
crema_band = rounded_cube("Crema", (1.365, 0.020, 0.048), 0.038, crema_mat, (0, -0.625, 0.338))
crema_band.parent = root

bubbles = [
    (-1.05, 0.338, 0.018), (-0.79, 0.345, 0.026), (-0.48, 0.337, 0.015),
    (-0.17, 0.349, 0.021), (0.22, 0.338, 0.014), (0.58, 0.346, 0.024),
    (0.94, 0.337, 0.016),
]
for index, (x, z, radius) in enumerate(bubbles, start=1):
    bubble = uv_sphere(f"CremaBubble_{index:02d}", (radius, 0.012, radius), bubble_mat,
                       (x, -0.651, z), 24)
    bubble.parent = root

eye_left = uv_sphere("Eye_L", (0.105, 0.018, 0.235), face_mat, (-0.49, -0.700, -0.16))
eye_right = uv_sphere("Eye_R", (0.105, 0.018, 0.235), face_mat, (0.49, -0.700, -0.16))
for eye in (eye_left, eye_right):
    eye.parent = root
mouth = poly_curve("Mouth", [(-0.20, -0.705, -0.34), (0, -0.705, -0.42),
                              (0.20, -0.705, -0.34)], 0.032, face_mat)
mouth.parent = root

bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -1.10))
ground = bpy.context.object
ground.name = "Ground"
ground.data.materials.append(ground_mat)
area_light("Key", (4.2, -5.4, 5.8), 920, (1.0, 0.78, 0.58), 4.5)
area_light("Fill", (-4.5, -3.1, 2.8), 560, (1.0, 0.91, 0.80), 3.8)
area_light("Rim", (2.2, 3.8, 4.5), 620, (1.0, 0.52, 0.26), 3.2)

camera_data = bpy.data.cameras.new("Camera")
camera = bpy.data.objects.new("Camera", camera_data)
bpy.context.collection.objects.link(camera)
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE" if bpy.app.version >= (5, 0, 0) else "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.view_settings.look = "AgX - Medium High Contrast"

world = scene.world
world.use_nodes = True
background = world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.70, 0.48, 0.30, 1)
background.inputs["Strength"].default_value = 0.72


def aim_camera(location, target=(0, 0, -0.04), lens=58):
    camera.location = location
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = lens


review_views = {
    "front": ((0, -7.2, 0.22), (0, 0, -0.04), 58),
    "three-quarter": ((4.75, -5.85, 0.95), (0, 0, -0.05), 58),
    "side": ((7.2, 0, 0.18), (0, 0, -0.05), 58),
    "rear": ((0, 7.2, 0.22), (0, 0, -0.04), 58),
    "top": ((0, 0, 8.0), (0, 0, 0), 58),
}
for view_name, (location, target, lens) in review_views.items():
    aim_camera(location, target, lens)
    scene.render.filepath = str(RENDER_DIR / f"mascot_{view_name}_{VERSION}.png")
    bpy.ops.render.render(write_still=True)

aim_camera(*review_views["front"])
bpy.ops.wm.save_as_mainfile(filepath=str(BLENDER_DIR / f"projekt_mascot_{VERSION}.blend"))

# Export only the runtime hierarchy. Studio lights, camera and ground stay in Blender.
def hierarchy_objects(parent):
    yield parent
    for child in parent.children:
        yield from hierarchy_objects(child)

bpy.ops.object.select_all(action="DESELECT")
for export_object in hierarchy_objects(root):
    export_object.select_set(True)
bpy.context.view_layer.objects.active = shell
bpy.ops.export_scene.gltf(
    filepath=str(MODEL_DIR / f"projekt-mascot-{VERSION}.glb"),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
)
print(f"Projekt Mascot {VERSION}: scene, GLB and {len(review_views)} review renders generated.")
