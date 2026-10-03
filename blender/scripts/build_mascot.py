"""Build the editable Projekt mascot v0.5 production-look scene and runtime GLB.

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
VERSION = "v05"

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


def add_noise_color(mat, color_dark, color_light, scale, detail, roughness):
    """Add low-cost organic color variation while keeping the Principled shader."""
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    coordinates = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    ramp = nodes.new("ShaderNodeValToRGB")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = detail
    noise.inputs["Roughness"].default_value = roughness
    ramp.color_ramp.elements[0].color = (*color_dark, 1)
    ramp.color_ramp.elements[1].color = (*color_light, 1)
    ramp.color_ramp.elements[0].position = 0.25
    ramp.color_ramp.elements[1].position = 0.78
    links.new(coordinates.outputs["Generated"], noise.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])


def add_coffee_swirl_shader(mat):
    """Broad distorted bands suggest liquid circulation without line geometry."""
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    coordinates = nodes.new("ShaderNodeTexCoord")
    wave = nodes.new("ShaderNodeTexWave")
    ramp = nodes.new("ShaderNodeValToRGB")
    bump = nodes.new("ShaderNodeBump")
    wave.wave_type = "BANDS"
    wave.bands_direction = "X"
    wave.inputs["Scale"].default_value = 0.72
    wave.inputs["Distortion"].default_value = 3.2
    wave.inputs["Detail"].default_value = 3.0
    wave.inputs["Detail Scale"].default_value = 1.25
    ramp.color_ramp.elements[0].color = (0.004, 0.00035, 0.00007, 1)
    ramp.color_ramp.elements[1].color = (0.018, 0.0016, 0.0002, 1)
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[1].position = 0.84
    bump.inputs["Strength"].default_value = 0.018
    bump.inputs["Distance"].default_value = 0.018
    links.new(coordinates.outputs["Generated"], wave.inputs["Vector"])
    links.new(wave.outputs["Color"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(wave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


glass = material("M_Glass", (1.0, 0.82, 0.62), roughness=0.045,
                 transmission=0.98, ior=1.45, alpha=0.24)
glass_inner = material("M_GlassInner", (1.0, 0.88, 0.72), roughness=0.060,
                       transmission=0.99, ior=1.45, alpha=0.045)
for glass_material, coat_weight in ((glass, 0.72), (glass_inner, 0.30)):
    glass_bsdf = glass_material.node_tree.nodes.get("Principled BSDF")
    if "Coat Weight" in glass_bsdf.inputs:
        glass_bsdf.inputs["Coat Weight"].default_value = coat_weight
        glass_bsdf.inputs["Coat Roughness"].default_value = 0.035
coffee_mat = material("M_Coffee", (0.020, 0.0025, 0.0005), roughness=0.20, ior=1.33)
add_coffee_swirl_shader(coffee_mat)
crema_top_mat = material("M_CremaTop", (0.72, 0.19, 0.025), roughness=0.58)
add_noise_color(crema_top_mat, (0.48, 0.055, 0.004), (1.0, 0.40, 0.07), 6.0, 5.0, 0.72)
crema_mat = material("M_Crema", (0.94, 0.32, 0.045), roughness=0.56)
bubble_mat = material("M_Bubble", (0.50, 0.065, 0.006), roughness=0.38)
face_mat = material("M_Face", (1.0, 0.88, 0.58), roughness=0.18,
                    emission=(1.0, 0.32, 0.045), emission_strength=6.5)
face_glow_mat = material("M_FaceGlow", (1.0, 0.62, 0.24), roughness=0.26,
                         alpha=0.018, emission=(1.0, 0.16, 0.008), emission_strength=0.70)
ground_mat = material("M_Ground", (0.82, 0.64, 0.49), roughness=0.82)

root = bpy.data.objects.new("MascotRoot", None)
bpy.context.collection.objects.link(root)

shell = rounded_cube("Shell", (1.62, 0.72, 1.0), 0.38, glass)
shell.parent = root
shell_inner = rounded_cube("ShellInner", (1.525, 0.655, 0.902), 0.32, glass_inner)
shell_inner.parent = root
coffee = rounded_cube("CoffeeVolume", (1.47, 0.605, 0.675), 0.245, coffee_mat, (0, 0, -0.275))
coffee.parent = root
crema_surface = rounded_cube("CremaSurface", (1.365, 0.535, 0.012), 0.012, crema_top_mat, (0, 0, 0.397))
crema_surface.parent = root
crema_band = rounded_cube("Crema", (1.365, 0.018, 0.035), 0.028, crema_mat,
                          (0, -0.625, 0.378))
crema_band.parent = root

bubbles = [
    (-1.18, 0.377, 0.014), (-1.03, 0.390, 0.023), (-0.86, 0.380, 0.011),
    (-0.69, 0.386, 0.019), (-0.52, 0.376, 0.010), (-0.34, 0.389, 0.025),
    (-0.15, 0.379, 0.013), (0.02, 0.385, 0.018), (0.20, 0.376, 0.009),
    (0.37, 0.388, 0.022), (0.56, 0.378, 0.012), (0.73, 0.386, 0.018),
    (0.90, 0.376, 0.010), (1.07, 0.389, 0.024), (1.21, 0.380, 0.012),
]
for index, (x, z, radius) in enumerate(bubbles, start=1):
    bubble = uv_sphere(f"CremaBubble_{index:02d}", (radius, 0.010, radius), bubble_mat,
                       (x, -0.660, z), 20)
    bubble.parent = root

def face_anchor(name, location):
    anchor = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(anchor)
    anchor.location = location
    anchor.parent = root
    return anchor


for name, x in (("Eye_L", -0.49), ("Eye_R", 0.49)):
    anchor = face_anchor(name, (x, -0.714, -0.17))
    glow = uv_sphere(f"{name}_Glow", (0.108, 0.006, 0.228), face_glow_mat, (0, 0.007, 0))
    core = uv_sphere(f"{name}_Core", (0.098, 0.010, 0.215), face_mat, (0, 0, 0))
    glow.parent = anchor
    core.parent = anchor

mouth = face_anchor("Mouth", (0, -0.714, 0))
mouth_points = [(-0.21, 0.007, -0.35), (-0.11, 0.007, -0.395),
                (0, 0.007, -0.410), (0.11, 0.007, -0.395),
                (0.21, 0.007, -0.35)]
mouth_glow = poly_curve("Mouth_Glow", mouth_points, 0.030, face_glow_mat)
mouth_core = poly_curve("Mouth_Core", mouth_points, 0.026, face_mat)
mouth_glow.parent = mouth
mouth_core.parent = mouth

bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -1.10))
ground = bpy.context.object
ground.name = "Ground"
ground.data.materials.append(ground_mat)
area_light("Key", (4.2, -5.4, 5.8), 1050, (1.0, 0.76, 0.52), 4.8)
area_light("Fill", (-4.8, -3.5, 2.9), 680, (1.0, 0.92, 0.82), 4.2)
area_light("Rim", (2.6, 3.9, 4.8), 820, (1.0, 0.45, 0.20), 3.0)
area_light("TopSoftbox", (-0.6, -0.8, 6.5), 720, (1.0, 0.86, 0.72), 5.0)

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
background.inputs["Color"].default_value = (0.88, 0.70, 0.54, 1)
background.inputs["Strength"].default_value = 0.92


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

# Production hero frame: use the physical outer glass volume in Cycles. The
# second shell is an Eevee/web readability aid and is hidden for this render.
shell_inner.hide_render = True
glass_bsdf = glass.node_tree.nodes.get("Principled BSDF")
glass_bsdf.inputs["Alpha"].default_value = 1.0
glass_bsdf.inputs["IOR"].default_value = 1.01
glass_bsdf.inputs["Transmission Weight"].default_value = 1.0
glass_bsdf.inputs["Base Color"].default_value = (1.0, 0.96, 0.90, 1)
scene.render.engine = "CYCLES"
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.filepath = str(RENDER_DIR / f"mascot_hero_{VERSION}.png")
bpy.ops.render.render(write_still=True)

print(
    f"Projekt Mascot {VERSION}: scene, GLB, {len(review_views)} review renders "
    "and Cycles hero frame generated."
)
