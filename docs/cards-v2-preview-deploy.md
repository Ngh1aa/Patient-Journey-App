# CareFlow+ Cards V2 — HTTPS preview (Vercel)

## Isolation requirements

**Publishing the preview is separate from merging.** Do not merge the draft PR #46, push code to `main`, change existing GitHub Pages source, or overwrite the current public CareFlow app.

Target source: **`Ngh1aa/Patient-Journey-App` at `redesign/cards-v2`**. This branch contains the mobile/doctor static preview and `vercel.json`.

## Deployment using a separate Vercel project

1. Connect Vercel with GitHub access to **this repository**, or authorize the Vercel connector in ChatGPT.
2. Create a **separate** Vercel project (for example `careflow-cards-v2-preview`); do not repurpose any existing Patient Journey production project.
3. Choose `Other` for Framework Preset, repository **root directory `./`** (NOT `prototype/` or `staff-prototype/`), output directory `.`, and **no build command**.
4. Configure this preview project's production branch to **`redesign/cards-v2`** or deploy this branch as a branch-specific preview. Do not deploy `main` in the preview project.
5. `vercel.json` rewrites the site root `/` to `/prototype/index.html` and `/doctor` to `/staff-prototype/index.html`; the original paths `/prototype/index.html` and `/staff-prototype/index.html` also stay available.
6. Wait for provider verification of **deployment status, source SHA and assigned HTTPS URL**. Test on that exact URL; never invent a `*.vercel.app` address.

## Expected links (only after provider gives origin)

- Mobile `<origin>/prototype/index.html?scenario=empty#/home`
- Mobile with visits `<origin>/prototype/index.html?scenario=appointments#/appointments`
- Doctor `<origin>/staff-prototype/index.html#/doctor`
- Short entrypoints `<origin>/` (mobile) and `<origin>/doctor` (doctor)

## QA before sharing

- Resolve `/design/cards-v2.css` and `/design/cards-v2.js` as **200** (both pages import assets from parent folder).
- Verify fonts from `/prototype/assets/fonts/`, image links, Hash routing and browser back.
- Test 360/390px mobile Home/B1, D1, C8 and desktop doctor 1280/1440.
- Verify no console errors, real clickable nav, patient journey guards, and the `main` GitHub Pages site unchanged.
- The existing CI tests on PR #46 provide *localhost runner* evidence; they do not prove remote preview deployment. Retest the real HTTPS site.

**Status:** deployment configuration PREPARED. The preview is NOT DEPLOYED or VERIFIED until a Vercel connection deploys it and a real HTTPS URL has been retrieved.
