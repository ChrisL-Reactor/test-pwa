# PWA Icons

This directory should contain the following icon sizes for the Progressive Web App:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

You can use tools like:

1. **PWA Asset Generator**: `npx @pwa/asset-generator [source-image] ./icons`
2. **Online Tools**: https://www.pwabuilder.com/ or https://realfavicongenerator.net/
3. **ImageMagick**: Create from source SVG or PNG

## Quick Generation with ImageMagick

If you have a source image (e.g., icon.png), run:

```bash
for size in 72 96 128 144 152 192 384 512; do
  convert icon.png -resize ${size}x${size} icons/icon-${size}x${size}.png
done
```

## Placeholder Icon

For now, the app will work without icons, but they are recommended for a complete PWA experience.
