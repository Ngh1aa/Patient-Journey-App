# CareFlow model scenario test results — 2026-10-15

Executed against the exact model factory committed in `model.js`, inside JS isolate. No real users, devices, payment services, or clinical workflows were tested.

| Test | Result |
|---|---|
| normal booking returns confirmed ID | PASS |
| proxy booking actor and subject separate | PASS |
| proxy cannot read without explicit permission | PASS |
| revoked proxy cannot book | PASS |
| switch patient clears screening and reason | PASS |
| danger routes to C3 and blocks slot | PASS |
| danger cannot submit booking | PASS |
| slot collision keeps no booking | PASS |
| timeout not success and blocked duplicate | PASS |
| server check not found makes retry possible | PASS |
| server check found makes confirmed once | PASS |
| QR start does not mark paid | PASS |
| doctor review does not mark patient informed | PASS |
| callback records a ticket state | PASS |
| deep link cannot cross patient | PASS |

**Summary: 15/15 simulated model assertions pass.**

The runnable browser demo includes the same checks via the QA panel. This establishes logical guard behavior only, NOT usability, security compliance, clinical safety, or production booking functionality.
