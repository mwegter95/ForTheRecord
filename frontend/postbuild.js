/**
 * Post-build script for GitHub Pages SPA support.
 *
 * GitHub Pages serves 404.html with a 404 HTTP status code, which means
 * Google will never index SPA routes even though the page renders correctly.
 *
 * This script copies index.html into each route directory so GitHub Pages
 * serves it with a 200 status code:
 *   build/about/index.html
 *   build/services/index.html
 *   etc.
 *
 * It also creates build/404.html as a fallback for any undefined routes.
 */

const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "build");
const indexHtml = fs.readFileSync(path.join(buildDir, "index.html"), "utf8");

// All SPA routes that need their own index.html
const routes = [
  "about",
  "services",
  "gallery",
  "faq",
  "get-in-touch",
  // Redirect routes (these redirect in React, but need a 200 to load the app)
  "weddings",
  "events",
  "booknow",
  "book-now",
  "contact",
];

routes.forEach((route) => {
  const routeDir = path.join(buildDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, "index.html"), indexHtml);
  console.log(`  ✓ Created ${route}/index.html`);
});

// Also copy to 404.html as a catch-all for any unlisted routes
fs.writeFileSync(path.join(buildDir, "404.html"), indexHtml);
console.log("  ✓ Created 404.html (catch-all fallback)");

console.log(
  `\nDone! Created index.html for ${routes.length} routes + 404.html fallback.`
);
