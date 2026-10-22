#!/usr/bin/env python3
"""Resize and convert an image to WebP for the site.

Usage:
  python3 scripts/optimize_image.py SOURCE DEST.webp [--width 1600] [--quality 80]
                                    [--crop X,Y,W,H] [--flatten white]

Requires Pillow (pip install pillow). Images are never upscaled.
Browser screenshots of pages without a background color come out partly
transparent; pass --flatten white so they do not turn dark on this site.
"""
import argparse
import os
import sys

from PIL import Image, ImageColor


def optimize(source, dest, width=1600, quality=80, crop=None, flatten=None):
    image = Image.open(source)
    if crop:
        x, y, w, h = crop
        image = image.crop((x, y, x + w, y + h))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    if flatten and image.mode == "RGBA":
        background = Image.new("RGBA", image.size, ImageColor.getrgb(flatten) + (255,))
        image = Image.alpha_composite(background, image).convert("RGB")
    if image.width > width:
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.LANCZOS)
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    image.save(dest, "WEBP", quality=quality, method=6)
    return image.size, os.path.getsize(dest)


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source")
    parser.add_argument("dest")
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--quality", type=int, default=80)
    parser.add_argument("--crop", help="X,Y,W,H in source pixels")
    parser.add_argument("--flatten", help="fill transparent pixels with this color, e.g. white")
    args = parser.parse_args(argv)
    crop = tuple(int(n) for n in args.crop.split(",")) if args.crop else None
    size, nbytes = optimize(args.source, args.dest, args.width, args.quality, crop, args.flatten)
    print(f"{args.dest}: {size[0]}x{size[1]}, {nbytes // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1:])
