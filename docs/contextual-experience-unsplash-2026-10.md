# CareFlow — contextual UX density pass (October 2026)

## Source of truth and scope

- Target: `prototype/` mobile-browser demo in this repository, 47 existing screen routes.
- Process/reference: `Ngh1aa/uiux-ai-workspace` → `AGENTS.md`, `START-HERE.md`, `docs/CONTRACT-OWNERSHIP.md`, `skills_UIUX/mobile-app-design/SKILL.md`, `skills_UIUX/mobile-web-preview/SKILL.md`, `skills_UIUX/visual-design-direction/SKILL.md`.
- Design constraints: keep white surfaces with navy accent, the existing 5-item bottom navigation and the current booking state machine. Reduce empty visual blocks through decision-ready information, not filler.
- Implementation: `careflow-experience.js` decorates current rendered screens without modifying business state. `careflow-experience.css` owns the new card density, disclosure, checklist and primary center CTA.
- Existing high-risk screens C3, C4 (danger-sign triage), G3/G4 (active calls) and checkout transaction entry H4 were deliberately not expanded.

## UX changes

- Home: two contextual pathways to family profiles and support in a paired grid.
- Booking: profile guidance, symptom-writing tips, in-person vs online considerations, date/confirmation explanations, next step shortcuts.
- Appointment: manage new booking, change/cancel context and status recovery.
- Clinic visit / testing: before-visit checklist, check-in/queue, lab preparation and privacy notices.
- Online: working device checklist, waiting and reconnection support.
- Aftercare: guidance, reusable short checklist, doctor follow-up pathways, next step links.
- Messages, profile, notifications, settings: account-oriented cards/disclosures with real route actions.
- Navigation: central button remains `data-action="book-nav"`, visually emphasized with a 62px navy circular action and visible `Đặt lịch` label; no new route system.
- Session checklists: optional device-only state in `sessionStorage`; does not alter clinical record or send to a server.

## Unsplash photography provenance

All listed source pages were verified as **free to use under the Unsplash License** during this change. They are third-party stock photos and **do not depict the real CareFlow clinic, staff, or patients**.

| Placement | Photographer / source | Original photo | Optimized CDN image |
| --- | --- | --- | --- |
| Home appointment hero | Online Marketing | https://unsplash.com/photos/doctor-holding-red-stethoscope-hIgeoQjS_iE | https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7 |
| Home discovery, support, onboarding cards | National Cancer Institute | https://unsplash.com/photos/doctor-talking-to-patient-in-clinic-tl447mekwuQ | https://images.unsplash.com/photo-1631217868264-e5b90bb7e133 |
| Visit detail | Accuray | https://unsplash.com/photos/doctor-and-patient-in-medical-room-ThpS0DVkPBs | https://images.unsplash.com/photo-1666214277730-e9c7e755e5a3 |
| Authentication, aftercare card | Vitaly Gariev | https://unsplash.com/photos/a-female-doctor-wearing-a-stethoscope-sits-at-her-desk-_zbqco3m7dA | https://images.unsplash.com/photo-1758691462651-611d730c5272 |

CDN photos use `auto=format&fit=crop&w=1100&q=78` for lighter mobile rendering. Existing local repo images remain as fallbacks for broken/blocked external media. Image load requires a network; an external network failure should not block booking.

## Verification and evidence limits

- New JavaScript was syntax-checked with a JavaScript parser before writing.
- `npm run check` includes the new experience script.
- `browser-tests/contextual-experience.spec.cjs` checks main CTA routing and geometric centering, contextual action routing, 360px overflow and checklist session persistence in Chromium/WebKit.
- Do not claim browser tests, remote photo HTTP status or live GitHub Pages deployment PASS solely from source changes. Verify through CI/browser and live URL separately.
- Prototype uses synthetic medical and payment state; no backend exists. No real clinical guidance, user testing, or production data is implied.
