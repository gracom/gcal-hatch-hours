"""Renders tools/icon.svg into the PNG sizes the manifest uses.

Run from the repository root:
    uv run --with resvg-py python tools/make_icons.py
"""

from pathlib import Path

import resvg_py

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "tools" / "icon.svg"
OUT = ROOT / "src" / "icons"
SIZES = [16, 32, 48, 128]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        png = resvg_py.svg_to_bytes(svg_path=str(SVG), width=size, height=size)
        (OUT / f"icon{size}.png").write_bytes(bytes(png))
        print(f"icon{size}.png")


if __name__ == "__main__":
    main()
