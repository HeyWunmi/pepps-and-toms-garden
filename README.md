# Pepps & Toms Garden Companion

A mobile-first React, Vite, TypeScript and Tailwind PWA for Pepps & Toms nursery customers and people registering their own plants. This milestone provides navigation and interface previews, without a backend.

## Run and build

Use Node.js 22.12 or newer (Node 24 recommended).

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Development normally runs at http://localhost:5173 and production preview at http://localhost:4173. `check` runs strict TypeScript checks; `build` checks types and creates `dist/` with the generated manifest and Workbox service worker. The dev script binds to `0.0.0.0` for environment previews.

## Screens and routes

React Router uses hash URLs so all screens remain reachable from static hosting and the cached app shell. Existing `/#/customer` and `/#/admin` links redirect to their respective overview screens.

| Customer | URL |
| --- | --- |
| Dashboard | `/#/customer/dashboard` |
| My Plants / Add Plant | `/#/customer/plants` |
| Calendar | `/#/customer/calendar` |
| Reminders | `/#/customer/reminders` |
| Growth Journal | `/#/customer/journal` |
| Harvest Log | `/#/customer/harvest` |
| Support | `/#/customer/support` |
| Settings | `/#/customer/settings` |

| Admin | URL |
| --- | --- |
| Overview | `/#/admin/overview` |
| Nursery Inventory | `/#/admin/inventory` |
| Customers | `/#/admin/customers` |
| Care Calendar | `/#/admin/calendar` |
| Reminders | `/#/admin/reminders` |
| Plant Assignments | `/#/admin/assignments` |
| Support | `/#/admin/support` |
| Reports | `/#/admin/reports` |

## What works locally

- Navigation, browser back/forward, customer/admin workspace switching, mobile bottom navigation and full-screen list menu (with Escape to close).
- Sample plant search and nursery/personal source filtering; sample customer label search.
- Upcoming/completed/overdue task filters.
- Monthly/weekly calendar modes, previous/next periods, event-type filtering and selecting dates to view events.
- Editable form fields and local photo selection. Add Plant validates JPG, PNG and WebP files up to 5 MB (including image signatures and browser decoding), displays the photo immediately, and shows the same photo in an explicitly unsaved plant-card preview. Choose a device file or request the rear phone camera where supported. Photos can be replaced or removed; neutral placeholders appear when none is selected.
- Back arrows on all secondary customer/admin screens use React Router history; an initial deep link falls back to the appropriate dashboard. Normal browser back/forward navigation is preserved.
- Inputs and photographs are held only in memory for the current screen. Navigating away or reloading discards them; no photo is added to the sample collection.
- Production app-shell caching and install metadata. No authenticated records are cached.

## What remains a preview

All records, counts, dates, statuses and report values are fictional examples. The illustrative schedule is November 2026; overdue and completed labels are fixed examples, not calculated or automated. Sample customer labels contain no real contact information.

Plant, journal, harvest, inventory, assignment, account and support forms cannot save or send. Their submission buttons are disabled and explanatory notices are visible. Selected Add Plant and care-advice photos are decoded locally for validation and preview, but are not uploaded, permanently stored or analysed. The older journal photo field remains a filename-only preview. No login, Supabase, database, email service, scheduled automation, analytics, push notifications or account permissions are connected. Reminder settings are marked **Planned** and disabled.

Customer Support now includes a clearly labelled **Ask about my plant** draft interface with a photograph, observations and qualitative soil-moisture fields. The typed draft contract supports future Storage uploads and optional admin review. Submission and admin-review controls are disabled; there is no AI connection, diagnosis, review workflow, email or simulated success.

Both workspaces are public. Before introducing real data, enforce authentication, admin permissions and Supabase row-level security on the backend. Hiding links alone is not access control. Nursery stock and nursery assignments are distinct from personally registered plants.

No hosting settings or paid services are configured. Nothing is publicly deployed by running the local preview.

## Branding and structure

White is the main page background. The official palette supplies accents: primary green `#2E6B0F`, accent green `#3C8D0D`, tomato red `#D61E1E`, leaf green `#5BAE2A` and cream `#FFF9F0`. The original logo artwork and PWA icon assets are retained. Fonts are locally served from Fontsource; their SIL Open Font Licenses are included in `public/licenses/`. Lucide React supplies interface icons.

- `src/App.tsx`: route definitions, redirects and missing-screen handling.
- `src/components/Layout.tsx`: shared responsive shell and customer/admin navigation.
- `src/components/UI.tsx`: reusable panels, badges, form notices and fields.
- `src/components/Calendar.tsx`: shared calendar view and local selection state.
- `src/components/Reminders.tsx`: shared task-status views.
- `src/components/BackButton.tsx`: router-history navigation with dashboard fallback.
- `src/components/PlantPhoto.tsx`: reusable device/camera picker and cover rendering.
- `src/lib/plantPhotos.ts`: file validation and temporary object-URL lifecycle, separate from future upload adapters. Original `File` objects remain available for a later authorised Storage upload; blob URLs are display-only and revoked when replaced/removed/unmounted. Backend validation and access controls will still be necessary.
- `src/features/plant-advice/`: local draft types and disabled care-advice interface, with no transport or model integration.
- `src/pages/Customer.tsx`, `src/pages/Admin.tsx`: screen components.
- `src/data.ts`: isolated fictional fixtures, ready to replace with an authenticated data layer later.
- `src/styles.css`: responsive layout and brand styles.
- `vite.config.ts`: manifest, icons, Tailwind and service worker build configuration.

## Manual validation

1. Run the checks and production build above, then start the production preview.
2. Visit each of the 16 routes. Check sidebar navigation, mobile menu, bottom navigation, workspace switching, browser back and forward, keyboard focus and Escape to close the menu.
3. Inspect at 320, 390, 768 and 1440px widths. The page should not overflow horizontally; the inventory table has its own scroll area on small screens.
4. Search My Plants for `basil`, then filter to Nursery: no sample results should remain. Search the sample customer labels. Switch all three reminder tabs.
5. Change the calendar between Month and Week, move periods, filter event types and select dates. Events exist in November 2026; other periods can be empty.
6. In Add Plant, select JPG/PNG/WebP images and confirm both the photograph and unsaved card cover appear. Try a non-image, a mismatched or damaged image, and a file over 5 MB. Rejected selections show errors and retain any previous valid photo. Remove/replace a photo and reload to confirm it is discarded. Try Take photo on a supported phone (camera availability and image formats depend on the device/browser; HEIC must be converted to JPG).
7. Test secondary-screen Back buttons after internal navigation, and directly open customer/admin calendar links in fresh tabs to verify dashboard fallbacks. Verify browser forward still works after using Back.
8. In Support, explore the planned care-advice fields and local photo preview. No save/send button should be enabled, no diagnosis or success message should appear, and no upload, account or email request should occur.
9. Inspect Application → Manifest / Service Workers in developer tools. Verify icons and white background metadata. Once the worker is active, reload, switch to Offline, and reload a deep link such as `/#/admin/reports`. The app shell should still load.
10. Install on real Android/iPhone devices over HTTPS when hosting becomes available. Android Chrome offers Install app / Add to home screen; iPhone Safari uses Share → Add to Home Screen. Localhost works for desktop service-worker testing, but an ordinary HTTP LAN address does not.

The worker is generated for production builds, not the dev server. Real-device installation remains to be verified. The current automatic worker update strategy should be revisited before connecting saved records or unsaved editing flows.

## Save to GitHub

Work is on `foundation`. Commit and push that branch for review; merging or deployment is a separate action. No backend infrastructure is needed to review this UI milestone.
