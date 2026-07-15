# Vision Module Integration Notes

## Correction from the previous pass

Last round I fixed `recognitionController.js` / `/api/recognition/start`,
assuming it was the live path. It wasn't — it was **dead code**.
The Recognition page actually calls `/api/engine/start`, wired through
`recognitionEngineController.js` → `recognitionEngineService.js` →
`face_recognition.py` directly. That's the one that mattered, and my
earlier rewrite of `face_recognition.py`'s output (dropping `name` in
favor of `roll_no`) had silently broken it, since it still matched on
`face.name`.

Fixed now:
- `recognitionEngineController.js` matches on `roll_no`
  (`faceDatasetId`/`rollNo`) instead of the no-longer-existent `name`.
- It now populates the active session's `subject` and logs that,
  instead of a `face.subject` field Python never sends.
- The dead duplicate pipeline (`recognitionController.js`,
  `recognitionRoutes.js`, `recognitionService.js`, `pythonRunner.js`,
  `vision/app.py`) is deleted and unmounted from `app.js`. It was never
  called by the frontend and was actively misleading — worth checking
  for more of these; the codebase has a pattern of duplicate
  controllers/services for the same feature.

## What Python actually returns now

`face_recognition.py` no longer touches any database. It matches a
face against `face_dataset/<roll_no>.npy` and returns:
```json
{ "success": true, "recognized": [{ "roll_no": "21", "confidence": 87.3, "status": "Present" }], "total": 1 }
```
Node (`recognitionEngineController.js`) does the MongoDB lookup,
marks attendance via `attendanceService`, and — this was gap #1 —
**writes a `RecognitionLog` for every recognized face, matched or not**,
via `recognitionLogService.createLog()`. That call already existed in
this controller; it just had the wrong field names. `RecognitionHistory.jsx`
will now actually populate.

## Still open (schema-level, not wired yet)

`RecognitionLog` has no `snapshot`, `boundingBox`, or `duration` fields,
and `face_recognition.py` doesn't capture or return any of those either
— that's gap #1's remaining piece (bounding box + snapshot on the logs
page) and is a real feature addition, not a wiring fix. Flagging so it's
not mistaken for done.

## How to register a student's face

1. Create the student normally in the FACREC web app (Students page).
2. Run `python register_student.py` at the project root, enter their
   exact Roll No when prompted, let it capture 30 samples.
3. In the student's profile, set **Face Dataset ID** to that same Roll No
   (or leave it — the backend also falls back to matching on `rollNo`
   directly if `faceDatasetId` isn't set).

## Setup

```bash
# Python deps (project root)
pip install -r requirements.txt

# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev
```

Make sure an `AttendanceSession` is set to `ACTIVE` before hitting
recognition — both controllers reject it otherwise, by design.

## Known limitation, not yet fixed

Recognition returns after the **first** matched face per run (see the
early `return` inside the face loop in `recognize_once`), so one call
marks at most one student. Fine for testing; continuous multi-student
scanning would need that loop to accumulate matches across `MAX_FRAMES`
instead of returning on the first hit.

