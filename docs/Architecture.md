# FACREC — Architecture

## System overview

FACREC is a three-tier attendance system: a React SPA, an Express/MongoDB
API, and a Python/OpenCV vision module that the API shells out to. There
is exactly one database (MongoDB) — Python never touches storage directly,
which is deliberate; see "Why Python doesn't talk to the database" below.

```
┌─────────────────────┐
│   React (Vite)       │  client/
│   Dashboard, Sessions,│
│   Recognition, etc.  │
└──────────┬───────────┘
           │ REST (axios, JWT bearer token)
           ▼
┌─────────────────────┐
│  Express API          │  server/
│  routes → controllers │
│         → services     │
│         → models       │
│  + Socket.IO (live      │
│    session updates)     │
└──────────┬───────────┘
           │ spawns child process, reads stdout JSON
           ▼
┌─────────────────────┐
│  Python vision layer  │  face_recognition.py, services/*.py
│  OpenCV + Haar Cascade │
│  KNN match against      │
│  face_dataset/*.npy     │
└─────────────────────┘
           │
           ▼
      MongoDB (single source of truth for all persisted data)
```

## Why Python doesn't talk to the database

Early in this project the Python module read/wrote a local SQLite file
while the web app used MongoDB — two disconnected sources of truth for
the same students. That's the classic failure mode for bolting a CV
script onto a web app: the recognizer "knows" about students the app
doesn't, or vice versa.

The fix: Python's only job is computer vision. It matches a face
against `face_dataset/<roll_no>.npy` and returns the `roll_no` plus
metadata (confidence, snapshot, bounding box, timing). It has no
database driver and no student records. Node does the MongoDB lookup,
attendance write, and logging. One system owns student data.

## Request flow: taking attendance

```
Faculty clicks "Start Recognition" (Recognition.jsx)
        │
        ▼
POST /api/engine/start  (recognitionEngineController.js)
        │
        ├─ finds the ACTIVE AttendanceSession (400 if none)
        │
        ▼
recognitionEngineService.js
        │  spawns: python face_recognition.py
        │  (cwd = project root, so face_dataset/ resolves)
        ▼
face_recognition.py
        │  1. load_face_dataset() → {label: roll_no} from .npy files
        │  2. open webcam, loop up to MAX_FRAMES
        │  3. Haar Cascade detects a face
        │  4. KNN match against the dataset
        │  5. on match: encode snapshot (JPEG→base64), compute
        │     bounding box scaled to the snapshot's resolution,
        │     record elapsed time
        │  6. print one JSON object to stdout, exit
        ▼
recognitionEngineController.js (back in Node)
        │  for each recognized face:
        │    - Student.findOne({ faceDatasetId | rollNo })
        │    - recognitionLogService.createLog(...)  ← always logged,
        │      matched or unknown
        │    - if matched: attendanceService.markAttendance(...)
        ▼
MongoDB: RecognitionLog + Attendance documents written
        │
        ▼
Response → React updates the Recognition page; RecognitionHistory.jsx
and Reports.jsx will reflect the new data on next load.
```

## Session lifecycle

```
SCHEDULED  →  ACTIVE  →  ENDED (locked)
                            │
                            └─ admin can reopen() → unlocked,
                               back to editable, then complete()
                               again recomputes present/absent
```

`startSession` snapshots `expectedStudents` from current enrollment.
`completeSession` diffs enrolled students against everyone who has an
Attendance "Present" record for that session, bulk-inserts "Absent"
for the rest, and locks the session. This is the auto-absent-detection
feature — it isn't a separate cron job, it's a deterministic step of
ending a session.

## Two recognition pipelines existed — only one is real

An earlier iteration of this codebase had two parallel implementations
of "start recognition": one at `/api/recognition/start`
(`recognitionController.js` → `vision/app.py`) and one at
`/api/engine/start` (`recognitionEngineController.js` →
`face_recognition.py` directly). Only the second was ever called by the
frontend. The first was dead code and has been removed. If you're
reading old notes or an older zip that mentions `vision/app.py` or
`pythonRunner.js`, those no longer exist in this version — worth
knowing in case it comes up in a viva ("why did you remove X").

## Folder structure

```
FACREC_FINAL/
├── client/                  React (Vite + Tailwind)
│   └── src/
│       ├── pages/           one file per route
│       ├── components/      shared UI (Sidebar, Modal, cards, charts)
│       └── services/        one file per API resource (axios wrappers)
├── server/
│   ├── scripts/seed.js       idempotent database seeding
│   └── src/
│       ├── routes/          URL → controller wiring only
│       ├── controllers/     HTTP layer: parse req, call service, respond
│       ├── services/        business logic, the only layer touching models
│       ├── models/          Mongoose schemas
│       ├── middleware/      auth (JWT), role-based authorization
│       └── socket/           Socket.IO setup for live session updates
├── services/                 Python: dataset_service, recognition_service,
│                              face_service (used by face_recognition.py)
├── face_dataset/              *.npy files, one per registered student
├── face_recognition.py        vision entry point (see flow above)
├── register_student.py        CLI tool to capture a student's face samples
└── docs/                      this folder
```
