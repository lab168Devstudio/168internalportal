# Lab168 Internal Portal (Netlify-ready)

Black + red, premium internal portal for Lab168 with:
- Search, favorites, animated cards
- Single product link: **Brand‑in‑a‑Box Calculator**
- Org Chart section with expandable rows
- Tailwind + Vite + React + Framer Motion + Lucide icons

## Quick Start
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add a redirect file for SPA routing: `public/_redirects` (already included)
  ```
  /*    /index.html   200
  ```

## Configure the Calculator Link
In `src/App.tsx`, update the `links.open` for the calculator product:
```ts
links: { open: "/brand-in-a-box/calculator", docs: "#docs/brand-in-a-box-calculator" }
```
If the calculator is a separate site, make this a full URL (e.g., `https://go.lab168.ca/brand-in-a-box/calculator`).

---
Proprietary technology developed by **Lab168 Digital Enterprises**.
