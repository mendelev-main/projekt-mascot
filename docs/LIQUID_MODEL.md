# Coffee Liquid Model v0.1

Prototype v0.1 uses a perceptual spring/wave simulation instead of real-time CFD.

Inputs: mascot horizontal acceleration, reaction impulses, slosh strength, damping, reduced-motion state.

Outputs: surface tilt, secondary wave amplitude, wave phase.

The visible top surface is a subdivided mesh. Vertex height combines linear inertial tilt, a longitudinal damped wave, a smaller cross-wave and edge weighting. The internal coffee body may receive only a small rigid tilt, while the top surface carries the stronger deformation.

When moving right, liquid initially rises on the left, crosses equilibrium after acceleration changes, oscillates with decreasing amplitude, then returns near flat.

Later iterations can add wall meniscus, crema deformation, vertical acceleration, rotational inertia and shader micro-ripples. The lightweight model is preferred for an ordering website because it is deterministic, tuneable and mobile-friendly.
