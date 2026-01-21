# Three.js PWA

A simple Progressive Web App (PWA) featuring an interactive Three.js 3D scene. This app is designed to work offline and can be installed on any device.

## Features

- Interactive 3D scene with rotating cube and torus
- Fully responsive design
- Offline functionality with Service Worker
- Installable as a Progressive Web App
- Animated lighting effects
- Optimized for GitHub Pages deployment

## Project Structure

```
.
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── app.js              # Three.js scene and animations
├── sw.js               # Service Worker for offline functionality
├── manifest.json       # PWA manifest
├── .nojekyll          # GitHub Pages configuration
└── icons/             # PWA icons directory
    ├── icon.svg       # Source icon (convert to PNGs)
    └── README.md      # Icon generation instructions
```

## Technologies Used

- **Three.js** (r128) - 3D graphics library
- **Service Workers** - Offline functionality
- **Web App Manifest** - PWA capabilities
- **Vanilla JavaScript** - No framework dependencies

## Local Development

1. Clone this repository
2. Serve the files using a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```
3. Open `http://localhost:8000` in your browser

## GitHub Pages Deployment

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select the branch you want to deploy (e.g., `main` or `claude/pwa-threejs-github-pages-TeCQi`)
4. Set the source to `/ (root)`
5. Click Save
6. Your app will be available at `https://username.github.io/repository-name/`

## PWA Icons

To generate all required icon sizes:

1. Edit `icons/icon.svg` to customize your icon
2. Convert to PNG using an online tool or ImageMagick:
   ```bash
   for size in 72 96 128 144 152 192 384 512; do
     convert icons/icon.svg -resize ${size}x${size} icons/icon-${size}x${size}.png
   done
   ```

Or use online tools like:
- https://www.pwabuilder.com/
- https://realfavicongenerator.net/

## Browser Support

- Chrome/Edge 45+
- Firefox 44+
- Safari 11.1+
- Opera 32+

## License

MIT
