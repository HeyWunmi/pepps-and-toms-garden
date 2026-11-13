# Pepps & Toms Garden Companion

A mobile-first, installable Progressive Web App foundation for Pepps & Toms customers and people growing their own plants.

## Run locally

Install Node.js 22.12 or newer (Node 24 recommended), which includes npm. From this repository folder:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite (usually http://localhost:5173). Choose **My garden** or **Admin preview** in the navigation; on phones, open the menu first.

## Check and build

```sh
npm run check
npm run build
npm run preview
```

`check` verifies TypeScript. `build` checks types and creates the production app, web app manifest and service worker in `dist/`. `preview` serves that production build, usually at http://localhost:4173. The service worker is enabled in production builds, not the development server.

## Test the foundation

1. Open both `/#/customer` and `/#/admin`; confirm that the heading and navigation change.
2. Test a narrow phone viewport (320px and up) and a desktop viewport. Check the menu, keyboard navigation and visible focus outlines.
3. Run the production preview. In browser developer tools, inspect Application → Manifest and Service Workers. Confirm the manifest and its icons load and the worker is active.
4. After the worker activates, reload once, switch developer tools to Offline, and reload again. The app shell and both dashboard views should still load. This does not store plant records or provide offline account access.
5. For installation on a real device, the app must be served over HTTPS. Localhost is also considered secure for local desktop testing. An ordinary phone connection to a computer's HTTP LAN address will not support service workers.
6. Android Chrome: use the browser's **Install app** or **Add to Home screen** option when available. iPhone Safari: use **Share → Add to Home Screen** and open the saved app. Exact labels vary by browser and OS; installation is controlled by the browser.

No public hosting is configured yet. Real Android and iPhone installation still needs device testing over HTTPS.

## What is included

- React, Vite, strict TypeScript and Tailwind CSS.
- Responsive customer and admin dashboard layouts with accessible navigation.
- A manifest, standalone display, regular and maskable icons, iPhone home-screen icon, and a generated Workbox service worker using `vite-plugin-pwa`.
- Production app-shell precaching for offline use after an initial online visit.
- Clearly marked placeholders for plant collections, growth journals, reminders and customer management.

## Boundaries and next steps

This is a foundation preview, not a functioning account or plant management system. Both views are public. The admin view is not protected and must not contain private information. There are no mock users, fake login screens, sample plant records, reminder scheduling or push notifications.

Supabase authentication, database access and permission checks will be added in a later phase. Before real records are introduced, admin access must be enforced by the backend and Supabase row-level security, not simply by hiding a navigation item. Customer and personal plants can share the future tracking experience.

No Supabase, Cloudflare, database or paid service has been created. Current dependencies run locally. Future hosting and storage choices should be reviewed against the goal of roughly 200 users at minimal cost, including photo storage and reminder delivery limits.

## Project layout

- `src/App.tsx`: public customer/admin view selection and placeholder layouts.
- `src/styles.css`: Tailwind import, nature palette and responsive styles.
- `src/main.tsx`: React entry point and production service worker registration.
- `vite.config.ts`: build, Tailwind and PWA manifest/cache configuration.
- `public/`: application icons. No external fonts or image services are needed.

The current worker only precaches build assets; no API or authenticated response caching is configured. Revisit the update strategy before adding forms or unsaved journals, since `autoUpdate` allows new app-shell versions to activate automatically.

## Save to GitHub

Review the changes, commit them, and push a branch:

```sh
git diff
git add .
git commit -m "Add garden companion PWA foundation"
git push -u origin foundation
```

Then open a pull request from `foundation` to `main` on GitHub. If you work on a differently named branch, replace `foundation` with that branch name. Publishing the app or environment is a separate step.
