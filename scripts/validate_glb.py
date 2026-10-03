#!/usr/bin/env python3
"""Validate the runtime GLB contract using only the Python standard library."""

import json
import struct
import sys
from pathlib import Path

EXPECTED_NODES = {
    "MascotRoot", "Shell", "ShellRimFront", "CoffeeVolume", "CremaSurface",
    "Crema", "Eye_L", "Eye_R", "Mouth",
}
EXPECTED_MATERIALS = {
    "M_Glass", "M_GlassEdge", "M_Coffee", "M_CremaTop", "M_Crema",
    "M_Bubble", "M_Face",
}
MAX_BYTES = 3 * 1024 * 1024


def main(path: Path) -> None:
    data = path.read_bytes()
    if len(data) > MAX_BYTES:
        raise SystemExit(f"GLB exceeds 3 MiB budget: {len(data)} bytes")
    magic, version, declared_length = struct.unpack_from("<4sII", data)
    if magic != b"glTF" or version != 2 or declared_length != len(data):
        raise SystemExit("Invalid GLB 2.0 header")
    chunk_length, chunk_type = struct.unpack_from("<II", data, 12)
    if chunk_type != 0x4E4F534A:
        raise SystemExit("First GLB chunk is not JSON")
    document = json.loads(data[20:20 + chunk_length].decode("utf-8"))
    nodes = {node.get("name") for node in document.get("nodes", [])}
    materials = {item.get("name") for item in document.get("materials", [])}
    missing_nodes = EXPECTED_NODES - nodes
    missing_materials = EXPECTED_MATERIALS - materials
    if missing_nodes or missing_materials:
        raise SystemExit(
            f"GLB contract failed; nodes={sorted(missing_nodes)}, "
            f"materials={sorted(missing_materials)}"
        )
    print(
        f"GLB contract OK: {path.name}, {len(data)} bytes, "
        f"{len(nodes)} named nodes, {len(materials)} named materials"
    )


if __name__ == "__main__":
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "models/projekt-mascot-v04.glb")
    main(target)
