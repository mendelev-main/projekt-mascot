# Model Sheet — v0.1

## Purpose

This document freezes the first modeling target for the mascot. The accompanying concept board is a visual reference; the rules below take precedence if an illustration introduces accidental details.

## Visual references

- Canonical owner-provided front reference: [`references/mascot-front-source.png`](../references/mascot-front-source.png)
- Five-view model-sheet candidate: [`references/model-sheet-v01-candidate.webp`](../references/model-sheet-v01-candidate.webp)
- Review status and precedence rules: [`references/README.md`](../references/README.md)

The source image controls identity and the front appearance. The five-view sheet is a candidate for approving proportions; it does not silently lock geometry that conflicts with the normalized dimensions below.

## Canonical silhouette

Front view:
- horizontal rounded rectangle;
- target width/height ratio: **1.55–1.70**;
- depth target: **0.68–0.76 × height**;
- large continuous corner radius;
- front surface slightly convex;
- top is a continuous sealed shell.

Strictly forbidden:
- top opening;
- cup rim;
- lid;
- handle;
- arms;
- legs;
- detached accessories in the base model.

## Canonical front composition

Normalized coordinates use width=1 and height=1.

- shell visual bounds: x 0.00–1.00, y 0.00–1.00;
- coffee fill at rest: approximately y 0.30–0.72 from bottom;
- crema band: thin, approximately 4–7% of body height;
- transparent headspace above coffee: clearly visible;
- eyes centered around y ≈ 0.48;
- left/right eye x ≈ 0.36 / 0.64;
- mouth centered x=0.50, y ≈ 0.39.

These are initial modeling coordinates and can be tuned after the first render.

## Shell

The shell is a single closed transparent volume. It is not a drinking vessel.

Design target:
- clear glass/acrylic-like material;
- modest index-of-refraction effect;
- controlled edge highlight;
- low visual noise;
- no prominent reflected softboxes;
- no thick decorative border.

The character must remain readable on both light and dark backgrounds.

## Coffee

Coffee is a separate inner volume with clearance from the shell.

At rest:
- approximately 65–72% fill;
- nearly horizontal surface;
- thin crema;
- subtle internal color variation.

For animation, the upper surface needs enough headspace to visibly tilt and oscillate.

## Face

The approved base language is:
- two vertical rounded luminous eyes;
- small luminous curved smile;
- warm ivory/cream emission;
- no pupils in the canonical neutral state;
- no nose;
- no eyebrows.

The face is logically independent from the liquid deformation.

## Views required before design lock

The production model must be reviewed in:
1. front;
2. front 3/4;
3. side;
4. rear;
5. top.

The rear has no face. The side view should preserve the soft capsule identity and must not resemble a conventional glass.

## Motion considerations baked into geometry

Geometry must support:
- ±8–12° presentation tilt without exposing visual artifacts;
- subtle squash/stretch;
- coffee surface tilt;
- internal coffee wave clearance;
- small yaw toward pointer;
- readable face down to compact mobile presentation.

## Current design status

**Model sheet v0.1 — candidate**

The core identity is locked:
- sealed transparent capsule;
- coffee inside;
- no limbs;
- minimal glowing face;
- horizontal rounded form.

Exact proportions/material tuning remain open until the first real-time 3D prototype.
