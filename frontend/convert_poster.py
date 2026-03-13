#!/usr/bin/env python3
"""
Convert the poster SVG to high-resolution PNG for printing.
Creates a 300 DPI PNG file suitable for professional printing.

For 30" x 18" at 300 DPI = 9000 x 5400 pixels
"""

import cairosvg
import os

# Input and output paths
svg_file = "poster-18x30.svg"
png_file = "poster-18x30-print.png"

# Calculate dimensions for 300 DPI
# 30 inches x 300 DPI = 9000 pixels
# 18 inches x 300 DPI = 5400 pixels
width_px = 9000
height_px = 5400

print(f"Converting {svg_file} to {png_file}")
print(f"Output size: {width_px} x {height_px} pixels (300 DPI for 30\" x 18\")")
print(f"This will create a ~{(width_px * height_px * 3) / (1024 * 1024):.1f}MB file...")

# Convert SVG to PNG at high resolution
cairosvg.svg2png(
    url=svg_file,
    write_to=png_file,
    output_width=width_px,
    output_height=height_px
)

# Get file size
file_size_mb = os.path.getsize(png_file) / (1024 * 1024)

print(f"✓ Successfully created {png_file}")
print(f"  File size: {file_size_mb:.2f} MB")
print(f"\nReady for printing at 30\" x 18\" (2.5 ft x 1.5 ft) - HORIZONTAL")
print(f"Resolution: 300 DPI")
