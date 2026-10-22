#!/usr/bin/env python3
"""Resize and convert an image for the site.

Usage:
  python3 scripts/optimize_image.py SOURCE DEST.webp [--width 1600] [--quality 80]
                                    [--crop X,Y,W,H] [--flatten white]
  python3 scripts/optimize_image.py SOURCE DEST/og.jpg --og

Requires Pillow (pip install pillow). Images are never upscaled.
Browser screenshots of pages without a background color come out partly
transparent; pass --flatten white so they do not turn dark on this site.
--og writes the 1200x630 JPEG used for link previews, cropped from the top.
"""
import argparse
import os
import sys

from PIL import Image, ImageColor

OG_SIZE = (1200, 630)
GROUND = "#07080c"


def cover(image, size):
    """Scale to fill `size`, then crop the overflow (centered across, kept from the top)."""
    width, height = size
    scale = max(width / image.width, height / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = (resized.width - width) // 2
    return resized.crop((left, 0, left + width, height))


def optimize(source, dest, width=1600, quality=80, crop=None, flatten=None, og=False):
    image = Image.open(source)
    if crop:
        x, y, w, h = crop
        image = image.crop((x, y, x + w, y + h))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    jpeg = dest.lower().endswith((".jpg", ".jpeg"))
    if (og or jpeg) and not flatten:
        flatten = GROUND
    if flatten and image.mode == "RGBA":
        background = Image.new("RGBA", image.size, ImageColor.getrgb(flatten) + (255,))
        image = Image.alpha_composite(background, image).convert("RGB")
    if og:
        image = cover(image, OG_SIZE)
    elif image.width > width:
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.LANCZOS)
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    if jpeg:
        image.convert("RGB").save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    else:
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
    parser.add_argument("--og", action="store_true", help="write a 1200x630 link preview image")
    args = parser.parse_args(argv)
    crop = tuple(int(n) for n in args.crop.split(",")) if args.crop else None
    size, nbytes = optimize(args.source, args.dest, args.width, args.quality, crop, args.flatten, args.og)
    print(f"{args.dest}: {size[0]}x{size[1]}, {nbytes // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1:])
