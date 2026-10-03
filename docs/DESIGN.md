# Mascot Visual Design Specification

## 1. Character idea

The mascot is a small futuristic coffee entity: visually somewhere between an emoji, a glass capsule, and a friendly AI assistant.

It must not look like:
- a conventional coffee cup,
- a mug,
- a takeaway cup,
- a robot with limbs,
- a cube with hard corners,
- a container with an opening.

It should feel like **a single sealed object with coffee living inside it**.

## 2. Body

### Shape
- Horizontal proportion.
- Rounded rectangle / soft capsule.
- Width clearly greater than height.
- Soft front and rear curvature.
- No visible top opening.
- No rim.
- No ring.
- No lid.
- No handle.
- No feet or base geometry.
- No arms or legs.

### Target proportion for model exploration
Initial modeling ratio:

```text
width : height : depth
1.55 : 1.00 : 0.72
```

This is a starting point, not a final locked dimension.

### Corners
The character must never read as a sharp cube. Corner radius should be large enough that the silhouette feels soft even from a distance.

## 3. Transparent shell

The shell should look glass-like but not like a realistic drinking glass.

Desired:
- clean transparent surface,
- soft refraction,
- controlled edge highlights,
- subtle thickness,
- minimal reflections.

Avoid:
- excessive studio highlights,
- many reflected windows/light panels,
- chrome-like reflections,
- strong rainbow dispersion,
- thick dark glass edges,
- visual noise.

The face and coffee must remain easy to read through the shell.

## 4. Coffee

Coffee occupies the internal volume.

### Visual treatment
- deep espresso/brown body,
- slight warm translucency near edges,
- soft crema at upper boundary,
- a few subtle bubbles may be used,
- no latte art,
- no whipped cream,
- no garnish.

### Fill level
Default neutral fill should leave a visible transparent zone above the coffee so movement is readable.

Initial target:

```text
65–72% of usable inner height
```

### Important behavior
The coffee surface must not be permanently flat during motion.

When the mascot accelerates:
- coffee tilts in the opposite direction,
- rises along one side,
- settles with damped oscillation.

The coffee is a key signature feature of the character.

## 5. Face

### Neutral face
- two simple luminous eyes,
- one small curved luminous mouth.

### Style
- minimal,
- readable,
- soft glow,
- no eyelashes,
- no eyebrows in the base design,
- no nose.

The face should feel digitally generated / AI-like without becoming cold.

### Placement
The face is visually centered in the front plane, slightly below the exact geometric center if required to account for the coffee surface.

The face should remain independent from the coffee deformation so expressions stay stable while liquid moves.

## 6. Emotion language

Expressions should be achieved primarily with eyes and mouth.

Initial emotion set:
- neutral,
- happy,
- excited,
- surprised,
- thinking,
- sad,
- sleepy,
- success,
- loading/focused.

Body tilt and squash/stretch can support emotions but should remain subtle.

## 7. Motion personality

The mascot has no legs and does not walk.

Movement style:
- floats,
- glides,
- gently bobs,
- may make short hops,
- reacts with slight squash/stretch,
- can rotate a few degrees while reacting.

The coffee inertia should slightly exaggerate movement and give the character physical weight.

## 8. Lighting language

For product renders:
- one soft key,
- subtle fill,
- subtle rim only when necessary,
- clean single-color background.

For the website:
- lighting should be neutral enough to work across different page backgrounds,
- avoid relying on a single HDR environment for the character to look correct.

## 9. Brand behavior

The mascot should feel:
- friendly,
- clever,
- compact,
- curious,
- slightly playful,
- modern.

It should not feel:
- childish,
- hyperactive,
- overly cartoonish,
- aggressive,
- luxury/formal,
- mechanically robotic.

## 10. Design lock checklist

Before modeling is considered approved, verify:

- [ ] horizontal rounded body
- [ ] sealed shell
- [ ] no top ring
- [ ] no opening
- [ ] no limbs
- [ ] controlled reflections
- [ ] coffee clearly visible
- [ ] face readable at small size
- [ ] neutral front view approved
- [ ] 3/4 view approved
- [ ] side view approved
- [ ] back view approved
- [ ] top view approved
