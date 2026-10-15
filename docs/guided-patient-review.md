# CareFlow — guided patient journeys

Request: repair the audited flow gaps and make the existing public patient URL suitable for recruiter walkthroughs. Scope stays in prototype/; staff-prototype/ is unchanged.

Applied UIUX Workspace: START-HERE → AGENTS → CONTRACT-OWNERSHIP → mobile-web-preview flow; mobile-navigation-and-state-ux, frontend-implementation and ui-craft-and-visual-qa. Existing screen IDs, tokens, views, fixtures and guarded transitions are reused. No frontend dependencies added. The canonical task packet is recovered in the work area; its automatically inferred commerce domain is not adopted as product truth. The user-provided clinic journey remains the domain requirement.

## Presentation

- The default index URL opens a left-hand list of F1–F12 with ordered checklists and branch choices. Progress comes from actual app state and routes, not manually ticked checkboxes.
- Patient inputs are prefilled only in guided presentation. Patients still submit forms, accept calls and choose payment actions. Clinic updates use the same guarded state owner, exposed outside the phone as the next relevant update.
- Mobile collapses the guide into a compact, expandable journey bar. Existing scenario URLs remain an independent inspection mode without autofill.
- Reload preserves the journey and booking draft; restarting or choosing a flow uses labelled synthetic fixtures. A persistent external notice says “Trải nghiệm minh họa · Không gửi yêu cầu hoặc thanh toán thực.” No “Bản demo”, “kiểm thử” or developer vocabulary appears in patient screens.

## Repaired paths

- Follow-up retains patient/history and previous-visit link, clears the old reason, and routes through C2/C3/C6 before C7. No automatic normal screening.
- Online waiting-room CTA requires both device preparation and an eligible visit state. An unanswered call queues a callback automatically; answering resolves it. Leaving a call returns to the waiting/reconnection path without completing the encounter.
- Pre-consultation results remain awaiting clinic confirmation. The clinic-confirmed continuation has distinct “return to current visit” and “review during consultation” instructions/actions.
- Medicine/question/symptom, tracking and referral feedback create care tasks: received → coordinator handling → doctor review → reply. Only clinic updates advance those handoffs.
- Encounter completion records signed/locked timestamps. Sharing the summary is a separate clinic action. Fee-plan communication can occur before the visit; paid/refund remain clinic owned.
- Doctor review, notification, explanation and callback resolution remain separate.

## Boundaries

No real SMS, video, upload, payment or clinic backend exists. Prefilled attachment is a synthetic metadata fixture. No diagnosis, prescription, triage criteria, price or refund policy is invented. Summary content demonstrates sharing and provenance without clinical advice. Clinical content and operational policy approval, server-side identity/deduplication, native QA and user validation remain pending. File14/15, original11/12 and Deep Research report remain unavailable.

Verification: model guards, F1–F12 guided branches, existing 47-screen browser/reflow/accessibility suite, desktop/mobile rendered screenshots and critical deployed interactions. Exact results are taken from CI and runtime evidence for the final revision.
