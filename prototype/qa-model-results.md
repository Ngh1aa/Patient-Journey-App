# CareFlow Low-fi — Automated Smoke Test Report

**Date:** 15/10/2026 (Asia/Ho_Chi_Minh)  
**Scope:** mock logic + static screen inventory; **NOT a clinical safety evaluation or participant usability test**.  
**Source:** [GitHub Actions — successful run](https://github.com/Ngh1aa/Patient-Journey-App/actions/runs/38631281362), job `verify` executed `node prototype/tests.cjs`.

## Result

**26 / 26 PASS** on the GitHub Actions run above. Verified assertions:
1. Exactly 23 unique screen IDs.
2. Normal self booking produces a confirmed mock record.
3. Success screen is unavailable without a confirmed record.
4. Proxy booking keeps creator and patient IDs distinct.
5. BOOK privilege is not VIEW_RESULT privilege.
6. Revoked proxy cannot place bookings.
7. Deep links do not cross patient context.
8. Revoked relative cannot open result link.
9. Switching patient clears previous screening data.
10. Warning routes to C3.
11. Warning blocks C4/C5/C6.
12. Warning blocks booking submit.
13. Editing a previous warning answer does not silently clear the flag.
14. Slot conflict creates no appointment.
15. Unknown network outcome cannot show success.
16. Unknown outcome prevents duplicate submission.
17. Server NOT_FOUND check permits a safe retry.
18. Server FOUND check reuses the confirmed booking.
19. Switching profile cannot display another patient's success.
20. QR initiation remains pending reconciliation.
21. Only a pending payment may become paid via mock backend settlement.
22. Doctor review does not mark patient informed.
23. Callback remains a separate task state.
24. `app.js` provides 23 screen render cases.
25. HTML script loading order and mobile viewport exist.
26. SVG wireframe board contains 23 screen labels.

**CI link:** https://github.com/Ngh1aa/Patient-Journey-App/actions/runs/38631281362

## Explicitly not verified

- Complete interactive browser flows on iOS Safari, Android Chrome or with assistive technologies.
- Real OTP, schedule API, race conditions at an actual HIS/PMS, payment providers, video SDK, SMS/Zalo, or live queue synchronization.
- Clinical screening behavior or medical appropriateness of emergency messaging.
- Real-user comprehension, SUS, UMUX-Lite, task completion time or age cohort behavior.
- Legal/privacy compliance of production deployment.

## Next checks
Run the 5 moderated prototype scripts in [USABILITY-TEST-PLAN.md](USABILITY-TEST-PLAN.md) with synthetic scenarios and approved recruitment. Log failures for C1/G1, C2/C3, C5, F1/F2 before hi-fi; get medical and privacy review of risk wording & result access.
