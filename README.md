# FACREC — Face-Recognition Attendance ERP

A full attendance management system built around face recognition:
students are recognized by a Python/OpenCV vision module during a live
session, attendance is marked automatically in MongoDB, absences are
computed the moment a session ends, and faculty/admins get reports,
analytics, and a full recognition audit trail.

**Stack:** React (Vite, Tailwind) · Express · MongoDB (Mongoose) ·
Socket.IO · Python (OpenCV, Haar Cascade, KNN face matching)

## Quick start

```bash
pip install -r requirements.txt

cd server && npm install && cp .env.example .env
# edit .env: set MONGODB_URI and JWT_SECRET
npm run seed        # required - creates the first login accounts
npm run dev

# in a second terminal
cd client && npm install && npm run dev
```

Seeded logins (printed again after `npm run seed`):
- `admin@facrec.edu` / `Facrec@123`
- `ananya.rao@facrec.edu` / `Facrec@123` (faculty)
- `vikram.shah@facrec.edu` / `Facrec@123` (faculty)

Full walkthrough, including registering a new student's face and
troubleshooting common errors: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

## What it does

- **Students, Subjects, Faculty** — standard CRUD, role-gated (admin vs
  faculty vs student).
- **Enrollment** — students are enrolled per-subject; a student can't be
  double-enrolled (unique index), auto-enrollment matches branch/semester.
- **Faculty ↔ Subject assignment** — a faculty account can only create or
  start a session for a subject they're assigned to (enforced server-side,
  not just hidden in the UI).
- **Sessions** — `SCHEDULED → ACTIVE → ENDED`. Starting a session snapshots
  who's expected (current enrollment); ending one diffs expected vs. who
  was actually marked present and bulk-inserts `Absent` for everyone else —
  automatic, not a manual step.
- **Face recognition** — one webcam pass matches a face against
  `face_dataset/*.npy` via Haar Cascade + KNN, returns a snapshot,
  bounding box, confidence, and timing; Express resolves that to a real
  student in MongoDB and marks attendance.
- **Recognition history** — every recognition attempt is logged, matched
  or not, with the captured snapshot and bounding box overlay.
- **Reports** — PDF/Excel export of a session's attendance.
- **Analytics** — trends, subject distribution, branch breakdown,
  students under 75% attendance, weekly heatmap.
- **Live updates** — Socket.IO pushes session state changes to connected
  clients.

## Documentation

| Doc | Covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, request flow, why Python doesn't touch the database, folder structure |
| [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) | Full schema, relationships, uniqueness constraints |
| [docs/SEQUENCE_DIAGRAM.md](docs/SEQUENCE_DIAGRAM.md) | Recognition → attendance flow and session completion, step by step |
| [docs/API_DOCS.md](docs/API_DOCS.md) | Every endpoint, method, and required role |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Setup, seeding, running, common errors |
| [VISION_INTEGRATION.md](VISION_INTEGRATION.md) | How the Python vision module integrates with the Node backend, and its history |

## Project structure

```
FACREC_FINAL/
├── client/          React frontend
├── server/          Express API (routes → controllers → services → models)
│   └── scripts/seed.js
├── services/         Python vision helpers (dataset, recognition, face)
├── face_dataset/      *.npy face embeddings, one per registered student
├── face_recognition.py
├── register_student.py
├── requirements.txt
└── docs/
```

## Known limitations

- Recognition returns after the **first** matched face per call — one
  scan marks one student. Fine for testing; continuous multi-student
  scanning in one sweep would need `recognize_once()` to accumulate
  matches across its frame loop instead of returning on the first hit.
- No automated test suite (Jest/Supertest). Reasonable to add later;
  not a blocker for a capstone submission.
- Frontend and backend run as two separate dev servers; there's no
  single production build/serve step wired up yet (see
  docs/DEPLOYMENT.md's production build section).
