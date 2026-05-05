# spa-to-mpa

Convert a React/Vite Single Page Application (SPA) into a Multi-Page Application (MPA) by generating separate HTML files for each route. This enables better SEO and independent page loading while preserving hydration.

## Why?

When you build a Single Page Application (like with React Router or Vue Router), you typically get a single `index.html` file. If you host it on a static server without routing rewrites, navigating to sub-routes directly returns a 404 error. Also, **web crawlers (like Discord, Twitter, Slack, LinkedIn) do not execute JavaScript**, which means they cannot read dynamic `<meta>` tags for social previews.

`spa-to-mpa` solves this by taking your built SPA folder (`dist` or `build`), generating physical `index.html` files for all your routes, fixing asset paths so hydration still works perfectly, and crucially, **injecting static SEO and Open Graph metadata per route so social previews work flawlessly!**

## Installation

```bash
npm install -g spa-to-mpa
```
*Or use it via npx:*
```bash
npx spa-to-mpa build ./dist ./mpa-dist --routes ./routes.json
```

## Usage

Create a `routes.json` file in your project containing an array of your routes. You can pass simple string paths, or objects containing SEO metadata for your social previews:

```json
[
  "/",
  {
    "path": "/about",
    "title": "About Us - My App",
    "description": "Learn more about our incredible team.",
    "image": "https://myapp.com/og-about.jpg"
  },
  {
    "path": "/products/1",
    "title": "Super Gadget - Shop",
    "description": "Buy the new Super Gadget today!",
    "image": "https://myapp.com/products/1.jpg"
  }
]
```

Then run the CLI:

```bash
spa-to-mpa build <input-dir> <output-dir> --routes <path-to-routes.json>
```

## How it works

1. Copies all non-HTML assets (like JS, CSS, images) to the output directory.
2. Reads your source `index.html`.
3. For each route in your config, it duplicates the `index.html` into a subdirectory (e.g. `/about/index.html`).
4. **Injects static `<title>`, `<meta name="description">`, and `og:image` tags** for web crawlers to read directly from the HTML without needing JavaScript.
5. Uses `cheerio` to intelligently rewrite relative asset paths in `<script>`, `<link>`, and `<img>` tags so they resolve correctly no matter how deep the route is.

## programmatic Usage

```javascript
import { convertToMpa } from 'spa-to-mpa';

await convertToMpa({
  inputDir: './dist',
  outputDir: './mpa-dist',
  routes: [
    '/', 
    { path: '/about', title: 'About' }
  ]
});
```

## License

MIT
