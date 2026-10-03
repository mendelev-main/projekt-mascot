# Animation Specification

## Goal

The mascot should feel alive even when idle, but animation must stay restrained enough for a real ordering website.

The defining motion feature is **coffee inertia inside the transparent body**.

## 1. Idle state

Continuous subtle motion:
- slow vertical float,
- very small body pitch/yaw variation,
- occasional blink,
- tiny coffee surface movement.

Suggested ranges:
- vertical bob: 2–6 px equivalent at common UI scale,
- rotation: within roughly ±2°,
- idle cycle: 3–6 seconds,
- blink interval: varied, not mechanically periodic.

## 2. Look / pointer tracking

The eyes may follow pointer/touch intent within a limited range.

Rules:
- only a small movement,
- never touch the shell edge,
- smooth damping,
- reset slowly to center.

Optional later:
the whole body may rotate 2–5° toward pointer direction.

## 3. Coffee slosh model

The first implementation should use a lightweight spring/inertia model, not real-time fluid simulation.

Conceptually:

```text
body acceleration
      ↓
opposite liquid tilt target
      ↓
spring response
      ↓
damping
      ↓
secondary surface wave
```

### Example
Mascot moves quickly right:
- coffee surface initially tilts upward on the left,
- liquid mass visually lags behind,
- after stopping, the surface overshoots,
- 2–4 decreasing oscillations follow,
- returns to near-flat idle.

### Required inputs
- horizontal acceleration,
- vertical acceleration,
- current body rotation,
- state impulse (jump/click/success).

### Parameters to expose
- sloshStrength,
- spring,
- damping,
- maxTilt,
- waveAmplitude,
- settleThreshold.

These must be tuneable without remodeling.

## 4. Jump / landing

For short celebratory reactions:

### Takeoff
- slight squash,
- fast upward motion,
- coffee shifts downward relative to shell.

### Air
- shell returns to normal proportions,
- coffee surface continues to oscillate.

### Landing
- brief squash,
- coffee surges upward,
- fast damped wave.

The effect should be stylized but not look like jelly unless intentionally enabled.

## 5. Emotion states

### neutral
- default eyes,
- small smile,
- slow idle.

### happy
- eyes narrow/curve slightly,
- wider smile,
- small upward bounce.

### excited
- larger eye expression,
- stronger bounce,
- larger coffee slosh impulse.

### surprised
- round/open eyes,
- small round mouth,
- short backward tilt.

### thinking
- eyes shift to one side,
- mouth minimal/flat,
- reduced movement.

### sad
- eye angle/shape lowers,
- mouth curves down,
- body lowers a few pixels.

### sleepy
- half/closed eyes,
- almost no bob,
- long slow movement.

### success
- happy face,
- quick squash → hop → settle.

### loading/focused
- face calm,
- subtle internal coffee circulation or slow surface motion,
- avoid frantic spinner-style movement.

## 6. Interaction events

Suggested website mapping:

```text
page ready        -> hello / neutral
pointer nearby    -> curious look
product hover     -> attentive
add to cart       -> happy
remove from cart  -> mild surprise
checkout loading  -> focused
order success     -> success
network error     -> sad / concerned
high load notice  -> warm alert reaction
inactivity        -> sleepy
```

## 7. Motion accessibility

The web implementation must respect:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced motion mode should:
- disable floating travel,
- disable strong hops,
- reduce slosh amplitude,
- retain static facial state changes,
- allow minimal blink if appropriate.

## 8. Performance principle

Never run expensive simulation just because the mascot is visible.

Animation should:
- pause when offscreen,
- reduce update rate when tab is hidden,
- avoid unnecessary shader complexity on low-end devices.
