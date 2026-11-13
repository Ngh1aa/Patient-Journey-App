# CareFlow — Patient Journey App

A browser prototype for patients: 47 screens following the file13 catalogue, built with HTML/CSS/JavaScript. The current renderer is in [prototype](prototype/index.html). Medical services, verification codes, video and payments are all simulated; do not enter real personal data.

```sh
npm ci --prefix prototype
node prototype/preview-server.cjs
# http://127.0.0.1:4175/prototype/index.html
npm --prefix prototype run test:all
```

[Screen catalogue and flows](docs/screen-flow-matrix.md) · [file13 source](docs/13-patient-journey-source.md) · [Product brief](docs/product-brief.md) · [Design system](docs/design-system.md) · [QA](docs/qa-results.md)

File14/15, the original 11/12 and the Deep Research UX Writing material were not found in the two checkouts/attachments provided. Clinical, legal and operational approval, a real backend, native QA and direct user validation are still outstanding. `hifi/` and `wireframe-board.svg` are historical material from before file13; do not use the old catalogue for current acceptance.

The interface is in English (dates use the `en-GB` format). Supporting documents in `docs/`, `research/`, `design/` and `hifi/` are still in Vietnamese.

## Full demo (everything except a backend)

Open `prototype/?scenario=demo#/login` (sign in with any phone number and the code `123456`) or `?scenario=demo-member#/home` to go straight in. Starting data comes from a single file, [data/careflow-seed.js](data/careflow-seed.js); every change is kept in the tab's sessionStorage ([data/careflow-store.js](data/careflow-store.js)), so it survives moving between screens and reloading. The **Reset demo data** button (top bar or Settings) reloads the starting data.

- Patients: book by specialty/doctor, time and reason; appointment details; reschedule; cancel with a reason; upcoming/past/cancelled lists; visit summary and results; prescriptions (`#/medications`) with refill requests; profile editing with per-field validation (`#/profile/edit`); family members — add, view, edit, remove (`#/profile/family`); insurance (`#/profile/insurance`); support tickets with a message thread, replies and close/reopen (`#/support/tickets`); notifications that can be marked as read.
- Clinic: `staff-prototype/#/ops/queue` (today's queue, check-in, start and complete visits, internal notes, create a task or a follow-up appointment), `#/ops/tasks` (create, edit, complete and delete tasks), `#/ops/tickets` (reply to patients). Both apps share data when opened in the same tab.
- Every list has an empty state; an unknown ID shows “Not found”; loading and saving have simulated latency. **Options → Simulate connection error** (or “Simulate error” in the clinic) makes the next load/save fail, with a Try again button; data is unchanged when it fails.
- Medications, results and notes are all sample content with fictional patients; no real medical action is performed.
- A tab that still holds data from the earlier Vietnamese build is reseeded once with the English data (flag `careflow.locale` in sessionStorage).

```sh
py -3 -m http.server 8903 --bind 127.0.0.1          # from the repo root
NODE_PATH=<folder containing playwright> node tests/full-product.e2e.cjs
```

## CareFlow Clinic — Desktop portfolio showcase

The **interactive desktop prototype for doctors** is in [staff-prototype](staff-prototype/index.html). It is a portfolio project with simulated data; there is no backend, real staff authentication or integration with medical systems. Desktop and mobile share labels, statuses and the [component contract](docs/design-system.md); role fonts are Plus Jakarta Sans / Be Vietnam Pro.

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

Current screens include the doctor overview, schedule, visit list, patient record, visit details, consultation, results, and the handover/follow-up steps. The overview prioritises the current consultation → decisions needed → unreviewed results → today's schedule. Interactions are simulated within the session and respect the doctor's permissions. See the [desktop guide](staff-prototype/README.md) and its own QA workflow.
