# react-spa-to-mpa-converter

Convert a React/Vite Single Page Application (SPA) into a Multi-Page Application (MPA) by generating separate HTML files for each route. 

This enables **perfect SEO** and **dynamic social previews** (Open Graph tags for Discord, Twitter, LinkedIn, etc.) while preserving full React hydration!

## Why do I need this?

When you build a Single Page Application (like with React Router), you get a single `index.html` file. 

The problem is that **web crawlers (like Discord, Twitter, or Googlebot) do not execute JavaScript**. If you share a link to `https://myapp.com/about`, the crawler only reads the root `index.html` file. This means every single page on your website will show the exact same social preview card and title! 

`react-spa-to-mpa-converter` solves this by taking your built SPA folder (`dist`), generating physical `index.html` files for every route you specify, fixing the asset paths so your app doesn't break, and most importantly: **injecting static SEO and Open Graph metadata per route so social previews work flawlessly!**

## Installation

```bash
npm install react-spa-to-mpa-converter --save-dev
```

## Setup & Usage

### 1. Create a Configuration File
Create a `routes.json` file in the root of your project containing an array of your routes. You can pass objects containing SEO metadata for your unique social previews:

```json
[
  {
    "path": "/",
    "title": "Home - My Awesome App",
    "description": "Welcome to the homepage.",
    "image": "https://myapp.com/og-home.jpg"
  },
  {
    "path": "/about",
    "title": "About Us - My App",
    "description": "Learn more about our incredible team.",
    "image": "https://myapp.com/og-about.jpg"
  }
]
```

### 2. Automate the Build (Recommended)
The best way to use this tool is to have it automatically run right after your app builds. Open your `package.json` and add a `postbuild` script:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "postbuild": "spa-to-mpa build dist mpa-dist --routes routes.json",
  "preview": "vite preview"
}
```

Now, every time you run `npm run build`, Vite will create the `dist` folder, and then our tool will instantly convert it into a new folder called `mpa-dist`.

---

## Deployment (Crucial Step)

Because your actual multi-page site is now located in `mpa-dist` (not `dist`), you must tell your hosting provider to deploy the correct folder!

### Deploying to Vercel
If you deploy to Vercel, it defaults to serving the Vite `dist` folder. If you don't change this, Vercel will completely ignore your new social previews and `/about` might throw a 404!
1. Go to your project dashboard on Vercel.
2. Click **Settings** > **General**.
3. Scroll down to **Build & Development Settings**.
4. Find **Output Directory**, click **Override**, and change it from `dist` to `mpa-dist`.
5. Click **Save** and trigger a redeployment.

### Deploying to Netlify
Change your publish directory from `dist` to `mpa-dist` in your Netlify UI settings, or inside your `netlify.toml`:
```toml
[build]
  publish = "mpa-dist"
```

---

## Testing Locally

If you want to test your social previews or check if the routing works locally, **do not use `npm run preview`**. Vite's preview server is hardcoded to serve the standard SPA `dist` folder.

Instead, use a static server to serve your new MPA folder:

```bash
npx serve mpa-dist
```
Navigate to the provided localhost URL. You can inspect the page source on `/about` to verify that your unique Open Graph tags were successfully injected into the HTML!

## Troubleshooting / FAQ

**Q: I get a 404 when I refresh a sub-route on my live site!**
**A:** There are two main culprits:
1. **You forgot to add the route:** Ensure the route you are refreshing is actually listed in your `routes.json`. If it's missing, the tool won't generate the physical HTML file for it, resulting in a 404.
2. **You deployed the wrong folder:** Double-check your Vercel/Netlify settings to ensure the Output Directory is strictly set to `mpa-dist`. If it's set to `dist`, you are still serving the standard SPA.

**Q: The social preview image isn't showing up on Discord.**
**A:** Make sure your `"image"` URL in `routes.json` is a fully qualified absolute URL (e.g., `https://myapp.com/image.jpg`, not `/image.jpg`). 

## License

MIT
