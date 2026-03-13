# For the Record - Poster Print Files

Print-ready poster files for 30" × 18" (2.5 ft × 1.5 ft) posterboard - HORIZONTAL LAYOUT.

## Files Created

1. **poster-18x30.svg** - Vector file (scalable to any size)
2. **poster-18x30-print.png** - High-resolution PNG (5400 × 9000 pixels, 300 DPI)
3. **poster-preview.html** - Preview the design in your browser
4. **convert_poster.py** - Script to regenerate PNG if needed

## Design Specifications

- **Size:** 30 inches wide × 18 inches tall (HORIZONTAL)
- **Resolution:** 300 DPI (print quality)
- **Pixel Dimensions:** 9000 × 5400 pixels
- **File Format:** PNG or SVG (both work for printing)
- **Color Space:** RGB (standard for most print shops)

## Text Positioning

The design includes:
- Logo centered in upper-middle area
- "For the Record" text positioned at y=1250 (in Cormorant Garamond font)
- "MINNESOTA WEDDING DJ" text at y=1380
- Contact info at bottom (y=1620) split left and right

Text is positioned to split the gap between the logo bottom and poster bottom, as requested.

## Printing Instructions

### Option 1: Using SVG (Recommended)
Most modern print shops can print directly from SVG:
1. Send **poster-18x30.svg** to the print shop
2. Request 30" × 18" size (HORIZONTAL)
3. Specify "print at actual size" or "100% scale"
4. No borders or margins

### Option 2: Using PNG
If the print shop prefers raster files:
1. Send **poster-18x30-print.png**
2. Request 30" × 18" size at 300 DPI (HORIZONTAL)
3. The file is already sized correctly
4. Print at "actual size" with no scaling

### Recommended Print Settings
- **Material:** Poster board, foam core, or matte photo paper
- **Finish:** Matte (recommended) or glossy
- **Mounting:** Consider foam core backing for durability
- **Color Profile:** sRGB or Adobe RGB

## Local Print Shops (Twin Cities Area)

Consider these options:
- **FedEx Office** - Quick turnaround, poster board available
- **UPS Store** - Good quality, multiple material options
- **Costco Photo Center** - Excellent quality for large formats
- **Local print shops** - Best quality, professional consultation

## Making Changes

If you need to adjust the design:

1. **Edit the SVG file** (`poster-18x30.svg`)
   - Open in any text editor
   - Text positions are marked with comments
   
2. **Regenerate the PNG** (optional)
   ```bash
   python convert_poster.py
   ```

3. **Preview changes**
   - Open `poster-preview.html` in your browser

## Tips for Best Results

✓ Ask the print shop for a proof or test print if possible
✓ Specify "no scaling" to maintain the exact 18" × 30" size
✓ Request matte finish to reduce glare
✓ Consider lamination for durability if displaying outdoors
✓ Foam core backing makes it easier to transport and display

## File Sizes

- SVG: ~4 KB (vector, infinitely scalable)
- PNG: 0.48 MB (compressed, ready to print)
- Very efficient due to simple design with solid colors!

---

Created: March 13, 2026
For: For the Record Minnesota Wedding DJ
