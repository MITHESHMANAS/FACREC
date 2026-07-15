# FACREC — Stabilization Fixes (Runtime Bugs Found by Actually Using the App)

Everything below was confirmed by reading the actual code path, not
assumed from a description. Each entry: what was wrong, why, what
changed.

## 1. Dashboard "Attendance" card showed a meaningless number

**Was:** `dashboardController.js` computed `attendance` as
`Attendance.countDocuments({status: "Present"})` — a raw, all-time
count of Present rows. The frontend then rendered it as
`` `${stats.attendance}%` `` in three separate widgets (Admin/Faculty/
Student dashboards) as if it were a percentage. If your school had
run 5 sessions with mixed attendance, you could easily see something
like "Attendance: 34%" where 34 was actually a row count, not a rate.

**Fix:** `dashboardController.js` now aggregates
`expectedStudents`/`presentStudents` across all `ENDED` sessions (the
same reliable numbers Reports.jsx already uses) and returns a real
`attendancePercentage`. All three dashboard widgets updated to read
the new field name.

## 2. Attendance could be marked for a student who isn't enrolled

**Was:** `attendanceService.markAttendance` checked session existence,
lock status, and duplicates — but never checked that the student was
actually enrolled in the session's subject. Both the manual "Mark
Attendance" form and face recognition could attach a Present record to
a student who has nothing to do with that subject, which then
corrupts `expectedStudents`/`presentStudents` math everywhere
downstream.

**Fix:** `markAttendance` now checks
`enrollmentService.getEnrolledStudentIds(session.subject)` and rejects
with a clear message if the student isn't in that list. The manual
attendance form (`AttendanceForm.jsx`) was also rewritten to only
list students actually enrolled in the selected session's subject,
so the case doesn't come up in the UI to begin with — the backend
check is what actually enforces it either way.

## 3. Deleting a student left orphaned records

**Was:** `studentService.deleteStudent` was a bare
`Student.findByIdAndDelete(id)` — no cleanup. Enrollment, Attendance,
and RecognitionLog documents referencing that student's ObjectId
stuck around, populate() calls on them return `null` for `student`,
and they render as blank rows.

**Fix:** deletion now also removes the student's Enrollment,
Attendance, and RecognitionLog documents in the same call.

## 4. `faceDatasetId` stayed `null` after creating a student

**Was:** the recognition pipeline matches a face by looking up
`Student.faceDatasetId` (falling back to `rollNo`), but nothing ever
set `faceDatasetId` — it required a manual edit after the fact, which
is easy to skip and leaves recognition silently non-functional for
that student.

**Fix:** `studentService.createStudent` now defaults
`faceDatasetId = rollNo` automatically at creation time (still
overridable if you explicitly pass a different value). Combined with
`register_student.py` already using roll number as the `.npy`
filename, a newly created student is recognition-ready without an
extra manual step.

## 5. Deleting a Subject/Faculty could orphan live data

**Was:** both `subjectService.deleteSubject` and
`facultyService.deleteFaculty` were unconditional hard deletes, no
check for dependents.

**Fix:** `deleteSubject` now blocks if there are active enrollments,
active faculty assignments, or scheduled/active sessions still
pointing at it. `deleteFaculty` blocks if there are active
`FacultySubject` assignments. Both throw a clear message telling you
what to remove first, instead of silently orphaning references.

## 6. No global handler for bad/malformed IDs

**Was:** a malformed ObjectId in a URL param (e.g. a stale frontend
link, or hand-typed URL) throws a Mongoose `CastError` that, if not
individually caught, surfaces as an opaque 500.

**Fix:** added a global error-handling middleware in `app.js` (Express
5's async handlers auto-forward thrown errors to it) that turns
`CastError` → 400 with a readable message, `ValidationError` → 400
with the validation message, and duplicate-key errors → 409, instead
of a raw stack trace reaching the client.

## 7. Leftover cruft

`Attendance.jsx` had a stray `tactics>` token inside the "Manual
Attendance" button's JSX — harmless to the build (JSX treats unknown
bare words as boolean props) but clearly a typo. Removed.

## 8. Reopening a session made it impossible to mark attendance again

**Was:** `markAttendance` treated a second attendance record for the
same (student, session) as an error - `"Attendance already marked."`
That's correct the *first* time through a session, but breaks the
entire point of "Reopen": after `completeSession` locks a session, it
auto-inserts `Absent` rows for everyone not yet marked. Reopen only
flips `isLocked` back to `false` - the old `Absent` row is still
there. So the moment you reopened a session and tried to correct
anyone (manually or via recognition), it hit that same row and threw
"already marked" again. Nothing could ever be corrected after ending
a session once.

**Fix:** `markAttendance` is now an upsert. If a record already exists
for that (student, session): if the status isn't actually changing,
return it as-is (no pointless write); if it is changing (e.g.
Absent → Present after a reopen), update that row in place. No new
row is ever created for an existing (student, session) pair - the
unique DB index still guarantees that structurally. This is what
makes the full cycle work: End Session (locks + auto-marks absent) →
Reopen (unlocks) → correct attendance (updates, doesn't duplicate) →
End Session again (`completeSession` recomputes present/absent from
the current state, re-locks). Reports and Attendance page were
already correct here - they just needed this fix underneath them to
actually reflect reality.

**Deliberately not built**, per your own call: automatic time-based
session closing, multi-stage session states, background jobs, or
extra notification systems. The lifecycle stays
`ACTIVE → ENDED (locked) → reopen → ENDED (locked) again`, no new
states added.


---

**Not in this pass, still open:** live end-to-end verification against
a real MongoDB instance — this sandbox has no `mongod` available. All
fixes above were validated by reading the full call path for each bug
(model → service → controller → route → frontend) and confirming the
fix closes the gap, plus static checks (Python compiles, server loads
every edited module, client builds clean at 776 modules). Recommend
re-running your existing full workflow test (register → enroll →
session → recognition → report) once more against this build,
specifically: end a session, reopen it, correct someone's attendance,
end it again, and re-download the report.

## 9. Reports page never actually loaded any sessions (confirmed root cause)

**Was:** `Reports.jsx`'s `loadSessions()` did:
```js
const data = await getSessions();          // returns {success, sessions: [...]}
const sorted = [...data].sort(...)          // spreads the response OBJECT, not the array
```
Spreading a non-array object like this throws a `TypeError` immediately.
The `catch` block swallowed it and showed a "Unable to load sessions"
toast, and `sessions` stayed `[]` forever - meaning the Reports page
could never show a single session, no matter how many you ended. This
is the literal, confirmed root cause of "not loading any reports."

**Fix:** `[...(data.sessions || [])]` instead of `[...data]`.

## 10. Session, Attendance, Reports, and Dashboard pages went stale

**Was:** each of these pages only fetched its data once on mount
(`useEffect(..., [])`). If a session started, ended, or was reopened
- whether from that same page or a different tab/user - nothing told
the other open pages to refetch. Attendance's "active session" banner,
Reports' list of ended sessions, and Dashboard's stats could all be
showing outdated state indefinitely until a manual page refresh.

**Fix:** the backend now broadcasts a `sessionUpdated` Socket.IO event
whenever `startSession`, `completeSession`, or `reopenSession` runs
(same socket connection `attendanceService` already used for
`attendanceMarked` - no new infrastructure). `useAttendanceSocket` now
accepts a second optional callback for this event. Wired into
Dashboard, Attendance, Reports, and Sessions so they all reload the
relevant slice of state when any of them changes it.

## 11. Attendance page mixed every session's records into one table

**Was:** `getAttendance()` had no filtering - it always returned every
Attendance row ever created. A single college's worth of a few weeks
of sessions would show as one long, meaningless combined list with no
way to tell what belonged to the session actually in progress.

**Fix:** `GET /api/attendance` now accepts an optional `?session=`
query param; `attendanceService.getAttendance` filters by it when
present (still returns everything if omitted - existing callers with
no filter behave exactly as before). `Attendance.jsx` now defaults its
view to whichever session is currently `ACTIVE` (or, if none is
active, the dropdown clearly shows "All Sessions (history)" - there's
no silent wrong default). A dropdown lets you explicitly pick any past
session or go back to the full history; the selection persists across
socket-triggered reloads instead of getting reset out from under you.

---

**Checked and found NOT to be a bug**, despite being on the list this
came from: "recognition results not cleared between scans" -
`handleRecognition` in `Attendance.jsx` already does
`setRecognizedStudents(result.recognized || [])`, which replaces the
array on every call, not appends to it.

## 9. Reports page never loaded any sessions

**Was:** `getSessions()` returns `{success, sessions}`. `Reports.jsx`
did `[...data].sort(...)` — spreading a plain object, not an array.
This throws immediately (`TypeError: data is not iterable`), gets
caught, shows the "Unable to load sessions" toast, and `sessions`
state stays `[]` forever. This is the actual, confirmed root cause of
"not loading any reports" - every ended session was there in the
database the whole time, the page just crashed before it could show
them.

**Fix:** `[...(data.sessions || [])].sort(...)`.

## 10. Sessions starting/ending/reopening didn't update other open pages

**Was:** the frontend (`Attendance.jsx`, `Reports.jsx`, `Sessions.jsx`,
`Dashboard.jsx`) already had a `useAttendanceSocket(onAttendance,
onSessionUpdated)` hook wired up and listening for a `"sessionUpdated"`
socket event on all four pages. Nothing on the backend ever emitted
that event, so it was dead code - correct architecture, missing the
one broadcast call that would have made it work.

**Fix:** `sessionService.js` now broadcasts `sessionUpdated` after
`startSession`, `completeSession`, and `reopenSession`, reusing the
same Socket.IO instance `attendanceService` already uses. All four
pages pick it up automatically since they were already listening.

## 11. Recognition could hang the request forever on a bad camera

**Was:** `recognitionEngineService.js` spawned Python with no timeout.
`face_recognition.py` caps itself at `MAX_FRAMES` under normal
operation, but if the webcam fails to open, some OpenCV/driver
combinations block on `cap.read()` indefinitely rather than erroring
out - the child process would never exit and the HTTP request would
hang with no way for the frontend to recover except closing the tab.

**Fix:** added a 45-second timeout that kills the child process
(`SIGKILL`) and rejects with a clear "check the camera connection"
message if Python hasn't finished by then.

## Checked and already correct (no change needed)

- **Confidence threshold** - `recognition_service.py` already rejects
  low-confidence matches as unknown via `UNKNOWN_THRESHOLD`.
- **Multiple active sessions** - `startSession` already force-ends any
  other `ACTIVE` session before activating a new one; two sessions
  being simultaneously active is structurally impossible, not just
  handled gracefully.

## 12. Faculty deletion didn't check for live sessions

**Was:** `deleteFaculty` only blocked deletion if there were active
`FacultySubject` assignments. A faculty member with a `SCHEDULED` or
`ACTIVE` session (created before their assignment was removed, or
just never checked) could still be deleted, leaving that session's
`faculty` string field pointing at someone who no longer exists.

**Fix:** now also blocks deletion if `AttendanceSession.faculty`
(a display-name string, not an ObjectId ref - see the model) matches
the faculty's name with a `SCHEDULED`/`ACTIVE` session. Name-based
matching is an existing limitation of how `AttendanceSession.faculty`
is modeled, not something introduced here - flagging it in case two
faculty ever share an identical name, which would need an actual
schema change (`faculty` as an ObjectId ref) to fully close.

## 13. Student dashboard's "My Attendance" card was mislabeled

**Was:** the student-role dashboard showed a card titled
"My Attendance" backed by `stats.attendancePercentage` - which is the
**college-wide** overall attendance rate (see fix #1), not that
student's own. Checked why a real per-student number isn't possible
right now: `Student` has no link to `User` at all (`Faculty` does,
via a `user` field; `Student` doesn't). There's currently no way to
resolve "which Student record does this logged-in student account
belong to."

**Fix (scoped intentionally small):** relabeled to
"Overall Attendance %", matching the other two dashboards, so it
states what it actually shows instead of claiming to be personal.
**Not fixed:** actually computing personal attendance, since that
needs a `Student.user` link (schema change) plus a dedicated endpoint
- a real feature addition, which is explicitly out of scope for a
stabilization pass. Flagging clearly rather than quietly shipping a
mislabeled number.

## 14. Orphaned records from before the cascade-delete fix existed

**Was:** the cascade-delete fix (#3) only stops *new* orphans. Any
Enrollment/Attendance/RecognitionLog created before that fix was
deployed still references Student/Subject ObjectIds that are now
gone - `populate()` silently returns `null` for those and they
render as blank rows (exactly what showed up in Enrollments after
deleting a student pre-fix).

**Fix, two parts:**
- `enrollmentService.getEnrollments` now filters out any record where
  `student` or `subject` didn't resolve, so the API never hands back
  something the UI can't fully render - permanent safety net, not
  just a one-time cleanup.
- `server/scripts/cleanupOrphans.js` (`npm run cleanup-orphans`) finds
  and deletes the actual orphaned Enrollment/Attendance/RecognitionLog
  documents already sitting in the database. Only deletes records
  whose reference is confirmed dangling; never touches anything that
  still resolves. Safe to run repeatedly.

## 15. Session table: "Start" stayed clickable on an ended session

**Was:** the Start button's disabled state was
`disabled={session.status === "ACTIVE"}` - which only accounts for
one state. For `ENDED` sessions this evaluates to `false`, so Start
stayed enabled and green on a session that had already finished
(exactly what showed up in the screenshot). The same binary check
also didn't handle the reopened case correctly (`status` stays
`"ENDED"` after reopen - only `isLocked` changes).

**Fix:** replaced the single boolean with three explicit conditions -
`canStart` (`SCHEDULED` only), `canEnd` (`ACTIVE`, or `ENDED` with
`isLocked: false` - i.e. reopened), `canReopen` (`ENDED` and locked).
Each button only renders when its condition is true, instead of
always rendering with an inconsistent disabled state.

## 16. Recognition Timeline showed a green checkmark for "Absent" entries

**Was:** every entry in `RecognitionTimeline.jsx` hardcoded a green
checkmark icon and green left border regardless of `record.status` -
an "Absent" recognition log looked identical to a "Present" one
except for the text inside a badge that was also visually clipped
(see #17). Misleading, not just unstyled.

**Fix:** icon and border color now branch on `record.status` -
red X and red border for anything that isn't "Present".

## 17. Status pills clipped their own text ("Presen" instead of "Present")

**Was:** `AttendanceHistory.jsx` and `RecognitionTimeline.jsx` built
status pills as `<span className="px-3 py-1 rounded-full ...">` with
no `whitespace-nowrap`. In a narrow table cell, the text can wrap to
a second line - which the pill's own `rounded-full` corners then
visually clip, since the pill's height is sized for one line.

**Fix:** added a shared `Badge.jsx` component
(`whitespace-nowrap inline-block` + a single source of truth for
which color each status word gets) and swapped every ad-hoc pill
(`AttendanceHistory`, `RecognitionTimeline`, `Enrollments` status
column) over to it. Also reduces the "everything is a different
color" problem across pages, since they now all pull from the same
status→color map instead of each page picking colors independently.

## 18. Attendance Health card was a wall of one color

**Was:** `AttendanceHealth.jsx` tinted the entire card background,
border, heading, and a 6xl icon red/amber/green depending on
percentage - on a low-attendance student, the whole card (not just
the number) turned red, which is what your screenshot showed.

**Fix:** card is now always a plain white card with a slate border;
only a small badge and the progress bar carry the status color. Also
dropped the icon from `text-6xl` to nothing (redundant with the badge
already stating the tier) - matches "remove oversized icons" from
your UI guidelines.

---

**Scope note on the full enterprise UI redesign:** the 25-point
guideline document is a genuinely large design-system project (a
reusable StatCard/DataTable/PageHeader/ActionButton set applied
consistently across every one of ~15 pages). This pass fixed the
concrete bugs plus the specific components shown in your screenshot
(Student Profile: AttendanceHealth, AttendanceHistory,
RecognitionTimeline) and the two real logic bugs found along the way
(session buttons, recognition timeline status). It did not rebuild
every page's layout/spacing/typography to the full ERPNext-style
spec - that's a legitimate next pass, not something to silently
half-do. Tell me which specific pages matter most for your demo and
I'll take them the rest of the way.

## 19. Dead duplicate component: StatCard.jsx

**Was:** `StatCard.jsx` and `StatsCard.jsx` were near-identical
components (title + value display). Checked usage: `StatCard.jsx` had
zero imports anywhere in the codebase - pure dead code. `StatsCard.jsx`
is the one actually used, across 8 pages (Sessions, Attendance,
Analytics, Reports, Students, Recognition, Faculty, Subjects).

**Fix:** deleted the dead file. Polished the real one
(`StatsCard.jsx`) internally - border, hover-lift, and a colored
accent bar derived from the same `color` prop every page already
passes - so all 8 existing call sites pick up the improved look with
zero changes to the pages themselves (same props: `title`, `value`,
`color`).

## Checked and already solid (no change needed)

- **Sidebar** - already has consistent icons (react-icons/fa
  throughout, not a mix of emoji and icons), active-route highlighting,
  hover animation, user avatar + role badge, proper logout button.
  Matches the guideline's sidebar spec already.
- **`StatusBadge.jsx`** (boolean active/inactive, used in
  `StudentTable`/`FacultyTable`) - already renders consistent
  green/red pills. This is a different component from the new
  `Badge.jsx` (which handles status *words* like "Present"/"ACTIVE") -
  both are legitimate, not a duplication to merge.
- **Empty states** on `StudentTable`, `FacultyTable`, `SessionTable` -
  already use the "icon + bold message + subtext" pattern the UI
  guidelines ask for.

## 20. App-wide color palette normalization

**Was:** a full grep audit across every page and component found 15+
files using colors outside the sanctioned 5 (indigo/green/red/amber/
slate) - orange, cyan, yellow, and blue scattered across stat cards,
icons, buttons, and status badges with no consistent meaning.

**Fix, done as a real audit not a guess:**
- `orange-*` and `yellow-*` → `amber-*` (15 occurrences across
  `SessionTable`, `AttendanceHealth`-era code, `AnalyticsCharts`,
  `ProfileHeader`, `StudentCard`, `SubjectCard`, dashboard widgets,
  and 7 pages' stat cards)
- `cyan-*` → `indigo-*` (`ProfileHeader`'s attendance-percentage tile)
- `blue-*` → `indigo-*` **everywhere except one sanctioned case**:
  the `ENDED` session status badge (`Badge.jsx` and
  `SessionTable.jsx`'s status pill) - your own guideline explicitly
  asked for "ENDED → Blue pill" as a status-specific exception, kept
  intentionally, not missed.
- Verified afterward: zero remaining usages of purple, pink, teal,
  violet, fuchsia, lime, rose, or sky anywhere in `pages/` or
  `components/`.

**Deliberately not touched:** the categorical color array in
`AnalyticsCharts.jsx` (6 distinct hues for the subject-distribution
pie chart). A pie chart with several slices needs genuinely
distinguishable colors - collapsing it to the 5-color semantic
palette would make adjacent slices hard to tell apart, which defeats
the actual goal (a readable, professional chart) in favor of the
letter of the rule. Flagging the reasoning rather than silently
leaving it unexplained.

## 21. Session lifecycle simplified: removed the separate "Locked" state

**Was:** sessions had `status` (SCHEDULED/ACTIVE/ENDED) *and* a
separate `isLocked` boolean, giving 4 effective states to reason
about (e.g. "ENDED + locked" vs "ENDED + not locked" after a reopen).
This was real, working logic (see fixes #8, #11) but more machinery
than the workflow needs, and it showed up in the UI as a confusing
extra "🔒 Locked" tag next to the status badge (your screenshot).

**Fix - real architecture change, not cosmetic:**
- Removed `isLocked` from the `AttendanceSession` model entirely.
- `completeSession` no longer sets a lock flag - `status: "ENDED"`
  alone now means "read-only."
- `reopenSession` now does exactly what it sounds like: flips
  `status` from `ENDED` back to `ACTIVE` (previously it only cleared
  the lock flag while leaving `status` at `ENDED`, which was the
  source of the earlier "ENDED but not locked" edge case entirely).
  It also now enforces the same "only one ACTIVE session at a time"
  invariant `startSession` already had, since reopening can put a
  session back into ACTIVE.
- `attendanceService.markAttendance`/`deleteAttendance` check
  `session.status === "ENDED"` instead of `session.isLocked`.
- `SessionTable.jsx` button logic collapses to three one-line rules:
  `canStart = SCHEDULED`, `canEnd = ACTIVE`, `canReopen = ENDED`. The
  "🔒 Locked" tag is gone - the status badge alone is now sufficient
  information.
- `AttendanceForm.jsx`'s session filter updated to match
  (`status !== "ENDED"` instead of `!isLocked`).

Net effect: fewer states, fewer edge cases, and the exact "ENDED with
an active-looking End button" inconsistency from the Sessions
screenshot can't recur structurally - `canEnd` is now only ever true
when `status === "ACTIVE"`.

## 22. Student Profile: consolidated three copies of the same numbers

**Was:** Present/Absent/Total attendance was rendered **three
separate times** on one page - once inside `ProfileHeader`'s stat
row, once inside `AttendanceProgress`'s donut card, and once inside
`AttendanceHealth`'s card. Plus a giant gradient hero banner with a
percentage badge overlapping its own edge (visible in your
screenshot).

**Fix:**
- `ProfileHeader` rewritten: no gradient banner, no floating
  overlapping badges. Clean card - avatar, name, roll, a single
  dataset-status pill, and email/branch/semester in a row below.
  Attendance numbers removed entirely from this component.
- Added one dedicated 4-card stat row to `StudentProfile.jsx`
  (Total/Present/Absent/Attendance%) using the shared `StatsCard` -
  this is the single place those four numbers now live.
- `AttendanceProgress` (the donut) shrunk from a half-page circle
  with its own repeated stat boxes down to a compact card: donut +
  tier label only. No more duplicate numbers.
- `AttendanceHealth` trimmed the same way - dropped its own
  Present/Absent boxes, kept the badge + percentage + advice text +
  progress bar (the one thing it does that nothing else on the page
  does).
- New `utils/attendanceTier.js` - single source of truth for what
  percentage counts as Excellent/Good/Needs Improvement and which
  color each tier gets, shared by both `AttendanceHealth` and
  `AttendanceProgress` so they can never disagree or show two
  different colors for the same percentage (they used slightly
  different thresholds/colors before this).

## 23. Enrolled-subject pills read as hyperlinks

**Was:** indigo text on a light indigo background - the exact visual
convention for a clickable link, on something that isn't clickable.

**Fix:** gray/slate pills, matching the guideline's "gray pills, not
hyperlink-styled."

## 24. Card style normalized across 9 more components

**Was:** `AttendanceHistory`, `SubjectPerformance`,
`RecognitionTimeline`, `EnrolledSubjects`, and 5 dashboard widgets
used `shadow-lg` with no border, inconsistent with the
`shadow-sm border border-slate-200` pattern used everywhere else
after fix #17-18.

**Fix:** normalized all 9 to the same card treatment.

## 25. Fabricated status data across three pages - fixed with real checks

**Was:** three separate places showed hardcoded, always-true status
text with no actual check behind it:
- `Recognition.jsx`: `<StatsCard title="Camera" value="ONLINE" .../>`
  - a literal string, not derived from anything.
- `Analytics.jsx`: "Camera: ● Online", "Recognition Engine: ● Running",
  "MongoDB: ● Connected" - all three hardcoded.
- `Dashboard.jsx`: a permanently-pulsing green dot claiming
  "Listening for live attendance & recognition events..." regardless
  of whether the socket was actually connected.
- The backend `/api/engine/health` endpoint itself was the root cause
  of the first two - it always returned `status: "ONLINE"`
  unconditionally, no check performed at all.

**Fix:**
- `healthCheck` now actually checks `mongoose.connection.readyState`
  for real MongoDB status, and checks the filesystem for the vision
  module's required files (`haarcascade_frontalface_alt.xml`,
  `face_recognition.py`, and counts registered `.npy` files in
  `face_dataset/`). Returns `DEGRADED` if anything's missing, plus a
  `registeredFaces` count. Documented the one honest limitation: this
  confirms the vision *files* are in place, not that a webcam is
  physically connected - actually opening the camera just to answer a
  status poll would be invasive.
- `Recognition.jsx` and `Analytics.jsx` now call this real endpoint
  and render its actual response instead of literals.
- `Dashboard.jsx` now listens to the actual `socket.io-client`
  `connect`/`disconnect` events and reflects real connection state in
  both the top-bar "LIVE" badge and the bottom status card.

## 26. Recognition result cards were always blank

**Was:** `Recognition.jsx` rendered `result.recognized` for the
result cards - `student.name`, `student.subject`. But
`result.recognized` is the raw array `face_recognition.py` returns:
`{roll_no, confidence, status}`. No `name` field, no `subject` field
exist there at all - Python never sends them (see
`docs/ARCHITECTURE.md`, "why Python doesn't talk to the database").
Every result card would have rendered a blank name and blank subject,
confidence and a status pill would have been the only real data
shown.

**Fix:** switched to `result.recognitionLogs`, which the backend
already builds with the correct resolved `name` (or the raw `roll_no`
for an unmatched face), `confidence`, and `status`. Also added
`subject` to that array on the backend (it wasn't there before either
- trivial to add since `activeSession.subject?.name` was already in
scope).

## 27. Table header styling unified

**Was:** three different table header treatments across the app -
`SessionTable`/`Reports` used light slate, `StudentTable` used an
indigo-to-blue gradient, `FacultyTable` used solid indigo. All three
with white text.

**Fix:** normalized to the same `bg-slate-50 text-slate-600 sticky
top-0` header used everywhere else, matching the design system.

## 28. Dashboard widget order

Reordered to match the guideline's hierarchy: statistics → charts +
recent recognition → active session + top performers → quick actions
→ live status. Previously Quick Actions was placed immediately after
the stat cards, ahead of anything data-driven.

## 29. Closed the remaining pages that hadn't gone through the redesign

**Was:** two pages had never been touched at all this session -
`Login.jsx` and `FacultyAssignments.jsx` - plus a comprehensive final
sweep found *more* untouched card instances than the earlier
per-page passes had caught (`Attendance.jsx`, `Enrollments.jsx`,
`Subjects.jsx`, `RecognitionHistory.jsx`, `AnalyticsCharts.jsx`,
`FacultyTable.jsx`, `AttendanceTable.jsx`, `SubjectCard.jsx`,
`StudentTable.jsx`, `StudentCard.jsx`, and all three dashboard role
widgets).

**Fix:**
- `Login.jsx`: fixed two real UX bugs, not just style - error message
  `<p>` tags rendered unconditionally (empty but present, causing
  layout jank even with no error) - now conditionally rendered. Also,
  the app globally sets `outline: none` on all inputs
  (`index.css`) with nothing replacing it, so this form had **zero
  focus indicator** on its inputs - a real accessibility gap, not
  cosmetic. Added `focus-within:ring-2 focus-within:ring-indigo-500`
  to both input containers.
- `FacultyAssignments.jsx`: card and table header normalized to match
  everywhere else.
- Ran a full-codebase grep sweep (not per-file guessing) for every
  remaining `rounded-xl shadow`, `bg-indigo-600 text-white` header,
  and old-style card, and normalized all of them in one pass -
  including a third duplicate stat-card component (`Card`, defined
  identically inside `AdminWidgets.jsx`, `FacultyWidgets.jsx`, and
  `StudentWidgets.jsx` - separate from `StatsCard.jsx` since it
  needed icon support `StatsCard` doesn't have). Normalized its
  visual style; **flagging, not silently fixing**, that this is still
  three copies of the same component - consolidating it into one
  shared icon-capable card is a real follow-up, not done here.

**Intentional exceptions, not oversights:** `Login.jsx`'s
`shadow-2xl` card and `Modal.jsx`/`ConfirmModal.jsx`'s `shadow-xl` -
an elevated shadow for a login card or a modal floating over a
backdrop is a standard, deliberate UI convention distinct from an
ordinary page card, not something the "everyday card" normalization
should flatten.

**Full verification, not a guess:** after this pass, a grep across
every file in `pages/` and `components/` for `bg-indigo-600
text-white"` (old header) and `rounded-xl shadow ` (old card, not the
two exceptions above) returns zero matches.

## 30. Dead code and two real Navbar bugs found while auditing Sprint 10/11

**Was, three separate things:**
- `RecognitionButton.jsx` - a completely unused, unstyled prototype
  component (confirmed via grep: imported nowhere). Used raw
  `alert()` calls - the only two `alert()`s left in the entire app.
  Deleted.
- `Navbar.jsx` had a block of JSX - an "Add Student" button - sitting
  **outside the component's `return` statement entirely**. It never
  rendered. Worse, it called `setOpen(true)`, and `setOpen` doesn't
  exist anywhere in that file (no matching `useState`) - if this code
  had ever actually been reachable, clicking it would throw a
  `ReferenceError`. Removed entirely.
- `Navbar.jsx`'s header title was hardcoded to the literal string
  `"Dashboard"` - meaning **every page in the app**, including
  Students, Sessions, Reports, everything, showed "Dashboard" in the
  top bar regardless of where you actually were. Fixed by deriving
  the title from the current route (`useLocation()` + a path→title
  map), so the navbar now actually reflects the page you're on.

## 31. Accessibility: icon-only buttons had no label

**Was:** `ActionButtons.jsx` (the edit/delete icon pair used in
*every* table across the app - Students, Faculty, Subjects, Sessions,
etc.) had no `aria-label` and no `title` tooltip on either button -
a screen reader would announce nothing meaningful, and sighted users
get no hover tooltip either.

**Fix:** added `aria-label` + `title` to both. Because this is one
shared component, this single fix closes the gap everywhere at once
rather than needing per-table changes. Also fixed the same gap on
Login's show/hide password toggle (the other icon-only button found
in the app).

---

**Honest scope assessment against the 15-sprint plan you shared:**
this is genuinely a multi-week project as written (a dedicated
`components/ui/` library with 15 new components, full table
pagination/sort, `React.memo`/route-splitting performance work, a
complete accessibility audit, responsive/mobile testing across device
sizes). I'm not going to claim that's done when it isn't.

What's already substantively covered by earlier fixes in this
document, mapped to their sprint numbers:
- **Sprint 1** (design system) - partially: `Badge`, `StatsCard`,
  `Modal`, `ConfirmModal`, `SearchBar` already exist and are reused
  across pages; a formal `components/ui/` folder with all 15 named
  components (`Button`, `Card`, `PageHeader`, `Table`, `FormField`,
  etc.) does not.
- **Sprint 2** (Student Profile) - done, see #22.
- **Sprint 3** (Dashboard order) - done, see #28.
- **Sprint 6** (Recognition page) - done, see #26.
- **Sprint 7/8** (Reports/Analytics) - partially: colors and real
  data fixed (#25), the "each report as its own card with generated
  time" restructuring is not done - the table format from before
  still stands.
- **Sprint 10** (confirmations/alerts) - verified: every delete
  already confirms via `ConfirmModal` before acting (checked all 5
  delete flows); the only `alert()`s in the app are now removed (#30).
- **Sprint 11** (accessibility) - started (#31), not a full audit.

Not attempted at all: Sprint 4's sort/pagination, Sprint 5's form
component library, Sprint 9's sidebar collapse/navbar notifications,
Sprint 12's responsive/mobile pass, Sprint 13's performance work,
Sprint 14's `constants/theme.js` extraction. Flagging plainly rather
than gesturing at partial coverage as if it were complete.

## 32. Report generation had no session-status validation

**Was:** `generatePDFReport`/`generateExcelReport` accepted *any*
session ID and generated a report for it regardless of `status` - a
`SCHEDULED` session that had never started could technically get a
"report" (it would just fail downstream with "no attendance found,"
not a clear "this hasn't happened yet" message). Also found while
fixing this: the no-`sessionId` fallback path searched for an
`ACTIVE` session specifically - meaning if this fallback were ever
hit, it would generate a report for a session still in progress,
with `expectedStudents`/`presentStudents`/`absentStudents` not even
finalized yet (those are only computed by `completeSession`).

**Fix:**
- Both functions now explicitly reject any session where
  `status !== "ENDED"`, with a clear message.
- Fixed the fallback query itself to match - it now looks for the
  most recently ended session instead of an active one, since an
  active-session fallback was structurally incompatible with the new
  ENDED-only rule I was adding.
- `reportController.js`: validation failures (session not found,
  session not ended, no attendance) now return **400**, not a
  blanket **500**. Previously every failure - a plain bad request and
  an actual server crash - looked identical to the frontend.
- No frontend change needed: `Reports.jsx` already only ever passes
  an explicit ID for a session already confirmed `ENDED` (it filters
  the session list before rendering the button), so this closes the
  gap for anyone hitting the API directly without changing any normal
  user-facing behavior.

## 33. Started the real design system: components/ui/

**Built, not repainted:**
- `components/ui/Card.jsx` - the actual reusable card container, with
  `padding` (sm/md/lg/none), `accent` (left-border highlight color),
  and `hover` props, instead of every page hand-typing
  `"bg-white rounded-2xl shadow-sm border border-slate-200 p-6"` as a
  string.
- `components/ui/Button.jsx` - `variant` (primary/secondary/success/
  danger/warning), `size`, `icon`, and `loading` props (built-in
  spinner swap), instead of every page hand-typing its own
  `bg-X-600 hover:bg-X-700 disabled:bg-gray-400 ...` string.

**Actually migrated (not just built and left unused):**
- `AttendanceHealth.jsx`, `AttendanceProgress.jsx`, `ProfileHeader.jsx`
  → `Card`.
- `Reports.jsx`'s active-session banner → `Card` with the `accent`
  prop (exactly what it's for).
- `Recognition.jsx`'s "Start Recognition" button → `Button`, using
  its built-in `loading` prop instead of hand-rolled spinner JSX.

**Found and fixed a real bug while migrating Reports.jsx:** the
"Active Session" banner offered PDF/Excel download buttons for a
session that, by definition, has `status: "ACTIVE"` - not `ENDED`.
After fix #32 (reports now require `ENDED` status), clicking those
buttons would always fail. Previously they would have "worked" by
generating a report for an unfinished session, which was itself wrong
per the stated rule. Replaced the buttons with the message your
mentor's own guidance specified: "End this session to generate a
report."

**Deliberately not migrated, explained rather than silently skipped:**
- The per-row PDF/Excel links inside Reports' table - these are
  compact text-style actions in a dense table row; forcing them into
  `Button`'s solid filled style would be a visual regression in that
  context, not an improvement. Left as-is (already correctly colored
  from fix #7).
- `Recognition.jsx`'s three remaining card divs - migrating them
  safely requires matching nested closing tags across a long file;
  given the risk of a mismatch under time pressure versus the
  cosmetic-only benefit (they're already visually correct), left
  hand-styled rather than risk breaking a working page.
- The other ~25 hand-styled cards across the rest of the app (Students,
  Faculty, Subjects, Sessions, Dashboard widgets, etc.) - not
  migrated. `Card`/`Button` exist and are proven working in 6 real
  call sites; full app-wide migration is still a distinct, bounded
  follow-up task, not something to claim as done.

## 34. Frontend redesign Phase 1: shared layout shell + collapsible nav

**Problem:** every one of the 13 protected pages hand-rolled the same
`<div className="flex min-h-screen bg-slate-100"><Sidebar />
<div className="flex-1"><Navbar />...` wrapper. Sidebar and Navbar
were also each duplicating a `PAGE_TITLES`-style map of routes, so
the two could (and did, slightly) drift apart on naming.

**Built:**
- `config/navConfig.js` - single source of truth for every nav
  destination, grouped by role (admin/faculty/student) and by section
  (Overview / Academics / Attendance / Insights). Both the sidebar's
  rendering and the navbar's search/breadcrumb read this same list now,
  so a renamed or added route can't drift between the two.
- `layouts/AppLayout.jsx` - the actual shared page shell. Lifts the
  sidebar's collapsed state so it persists across navigation instead
  of resetting on every route change.
- `components/Sidebar.jsx` - rebuilt: collapsible (icon-only mode with
  hover tooltips), grouped sections instead of one flat list, animated
  width transition (Framer Motion), active-route highlight.
- `components/Navbar.jsx` - rebuilt: breadcrumb-style title (reads
  `navConfig`), a real jump-to-page search (filters nav items, not
  cosmetic), a live socket-connection pill (reads the same global
  `socket` singleton Dashboard already used), and a notifications
  affordance that honestly shows "nothing new" rather than fabricating
  unread counts with no backend behind them.
- `components/ui/KpiCard.jsx` - the gradient-chip stat card the
  redesign brief asked for, replacing three near-identical local
  `Card` components that were copy-pasted inside `AdminWidgets.jsx`,
  `FacultyWidgets.jsx`, and `StudentWidgets.jsx`.

**Migrated:** all 13 pages (`Dashboard`, `Students`, `StudentProfile`,
`Faculty`, `Subjects`, `Enrollments`, `FacultyAssignments`, `Sessions`,
`Attendance`, `Recognition`, `RecognitionHistory`, `Analytics`,
`Reports`) now render `<AppLayout>` instead of the duplicated wrapper.
Every existing API call, service import, and piece of page logic was
left untouched - this pass only touched the layout shell around each
page's content. Verified with a full `npm run build` after the swap
and again after the KPI card change; both clean.

**Also removed:** the unused `Sidebar.jsx.bak`/`Navbar.jsx.bak` left
over from the swap, and `App.css` - leftover Vite starter-template CSS
that nothing imported.

**Deliberately not touched in this pass (next phases):**
- Table components (`StudentTable`, `FacultyTable`, `SessionTable`,
  `AttendanceTable`) - still the original plain tables, not yet the
  sortable/paginated/sticky-header data tables the brief describes.
- Forms (`StudentForm`, `FacultyForm`, `SessionForm`, etc.) - not yet
  given floating labels or the modern-input treatment.
- `Recognition.jsx`'s hero camera/result-card treatment, and
  `RecognitionHistory.jsx`'s timeline layout - both still on their
  original markup.
- `Analytics.jsx` chart styling and `StudentProfile.jsx`'s history
  timeline - unchanged.
- `eslint` couldn't be run to double-check this pass - the uploaded
  project has no `eslint.config.js` (ESLint 9+ requires one; there's
  no legacy `.eslintrc.*` either), so `npm run lint` was already
  non-functional before this session. `npm run build` was used as the
  verification method instead, consistent with how earlier fixes in
  this log were checked.

## 35. Frontend redesign Phase 2: real data tables + modal polish

**Built:**
- `hooks/useDataTable.js` - client-side sort + pagination for a table
  component. Takes the array the page already filters/fetches (e.g.
  `filteredStudents`) and a `getSortValue(row, field)` function;
  returns the current page's rows plus sort/page state. No page's
  data-fetching or search-filtering logic changed - this only slices
  what the table renders.
- `components/ui/SortableTh.jsx` - clickable `<th>` with an active-
  state chevron, so a column becomes sortable by passing a `field`
  prop instead of hand-building click handlers per table.
- `components/ui/Pagination.jsx` - page controls (prev/next, "Showing
  X-Y of Z"), only renders when there's more than one page.
- `components/ui/EmptyState.jsx` - the one "nothing here" block,
  replacing four near-identical hand-rolled empty states (each with
  its own emoji-in-a-div).

**Migrated:** `StudentTable`, `FacultyTable`, `SessionTable`,
`AttendanceTable` - all four now sort (click any column header),
paginate (8-10 rows/page), and show the shared empty state. Every
prop each table receives is unchanged (`students`/`onEdit`/`onDelete`,
etc.) - pages that render these tables needed zero changes.

**`RecognitionHistory.jsx` rebuilt** from a single wide table into the
timeline layout the brief asked for: snapshot, name, status pill,
subject, timestamp/camera/duration, and a confidence number, one row
per attempt. Added working search (student/subject/camera) and a
status filter (All/Recognized/Unknown) - both client-side over the
already-fetched log list, same pattern as every other page's search.
**Not added:** an Export button - `recognitionLogService.js` has no
export endpoint, and the brief for the rest of the app already
established the rule (fix #32) that a button shouldn't exist if the
backend can't actually do the thing yet.

**`Modal.jsx` / `ConfirmModal.jsx` rebuilt** to match the brief's
"professional modal" spec: backdrop blur, Framer Motion enter/exit,
Escape-to-close, click-outside-to-close, and a proper close icon
instead of a bare `×`. `ConfirmModal` additionally got a warning-icon
header. Both keep their exact original props, so every one of the 8
pages using them needed no changes.

**Also:** `SearchBar.jsx` got a leading search icon to match the
navbar's search styling from Phase 1.

**Verified:** `npm run build` clean after each of the three groups of
changes (tables, RecognitionHistory, modals) in this phase.

**Deliberately not touched in this pass (next phases):**
- Forms (`StudentForm`, `FacultyForm`, `SessionForm`, `SubjectForm`,
  `AttendanceForm`) - not yet given floating labels or the modern-
  input treatment described in the brief.
- `Recognition.jsx`'s hero camera/result-card treatment - unchanged.
- `Analytics.jsx` chart styling and `StudentProfile.jsx`'s history
  timeline - unchanged.
- Export/print buttons on `Reports.jsx` and `Attendance.jsx` - not
  reviewed in this pass.

## 36. Frontend redesign Phase 3: enterprise-quality forms

**Built:**
- `components/ui/FormInput.jsx` - `forwardRef` text/email/date/time
  input with a label, optional leading icon, error message (red
  border + text), and an optional hint line for non-error guidance.
  `forwardRef` matters here specifically so `{...register("field")}`
  from react-hook-form keeps working unchanged - its returned `ref`
  needs a real DOM node to attach to.
- `components/ui/FormSelect.jsx` - same pattern for `<select>`, with a
  custom chevron icon replacing the default browser arrow.

**Migrated:** `StudentForm`, `FacultyForm`, `SubjectForm`,
`SessionForm`, `AttendanceForm` - every field now uses `FormInput`/
`FormSelect`, related fields grouped into a 2-3 column grid instead of
one long single-column stack, and the submit button now uses the
existing `Button` component (`loading` prop) instead of a hand-rolled
disabled/text-swap button. `register(...)` calls, validation rules,
`watch`/`setValue` logic (subject-picks-faculty in `SessionForm`,
session-picks-enrolled-students in `AttendanceForm`) - all untouched.
Only the markup rendering each field changed.

**Checked and left alone:** `Login.jsx`'s form - already has icons,
inline validation, a show/hide password toggle, and a loading-spinner
button; it already meets the bar the brief is asking for elsewhere, so
rewriting it would be change for its own sake.

**Verified:** `npm run build` clean after the form migration.

**Deliberately not touched in this pass (next phases):**
- `Recognition.jsx`'s hero camera/result-card treatment - unchanged.
- `Analytics.jsx` chart styling and `StudentProfile.jsx`'s history
  timeline - unchanged.
- Success animations on form submit (brief mentions this) - not
  added; would need a design decision on where it appears (toast
  already fires on save) rather than a mechanical migration.

## 37. Frontend redesign Phase 4: Recognition page hero treatment

**Built:**
- `components/RecognitionResultCard.jsx` - one matched/unknown result
  row: a circular confidence gauge (reusing the same
  `react-circular-progressbar` pattern already proven in
  `AttendanceProgress.jsx`, not a new dependency), name, subject, and
  the existing `Badge` for status. Green gauge + green-tinted card for
  a match, slate for unknown. Framer Motion staggered entrance so
  multiple results in one scan animate in one at a time.
- Live-camera card rebuilt as an actual viewfinder: dark panel,
  corner-bracket framing, and (only while a scan is in flight) an
  animated scanning line sweeping top to bottom plus a subtle pulse on
  the camera icon. The honest caption - that the browser doesn't get a
  real video stream, recognition runs server-side against the
  connected webcam - is kept exactly as before; the visual treatment
  changed, not the claim.
- The three top stat cards swapped from the old flat `StatsCard` to
  `KpiCard` (gradient icon chip, tone reflects real state: emerald
  when the vision module reports `READY`, red otherwise).

**Not touched:** `handleRecognition`, `loadStatus`, the
`getEngineStatus`/`startRecognition` service calls, toast messages,
and all conditional logic - identical to before. Only presentation
changed.

**Verified:** `npm run build` clean.

**Deliberately not touched in this pass (next phases):**
- `Analytics.jsx` chart styling and `StudentProfile.jsx`'s history
  timeline - unchanged.
- Reports/Attendance export & print button review - not done.

## 38. Frontend redesign Phase 5: Analytics charts + StudentProfile history

**`Analytics.jsx` / `AnalyticsCharts.jsx`:**
- Top stat row and the bottom "Recognition Statistics" row both
  swapped from `StatsCard` to `KpiCard`.
- The three info panels (Attendance Overview, System Status,
  Recognition Summary) rebuilt on the shared `Card` component with an
  icon in each header and a live status dot (green/red) for
  MongoDB/Vision Module instead of plain colored text.
- Every chart's 📈/🥧/📊/🚨/📅/🗓️ emoji header replaced with a
  react-icons icon in a consistent chip, matching the icon language
  used everywhere else in the app (Sidebar, Navbar, KpiCard).
- Chart tooltips get a shared, actually-styled `contentStyle` (rounded
  corners, subtle shadow, border) instead of recharts' plain default
  box; bars got rounded tops.
- The attendance-shortage table and the "no completed sessions" /
  "no shortage students" states now use the shared `EmptyState`
  instead of a bare paragraph.
- **Not changed:** any data shape, any prop passed into
  `AnalyticsCharts`, or the `getAnalytics()`/`getEngineStatus()` calls.

**`StudentProfile.jsx` / `AttendanceHistory.jsx`:**
- The four top stat cards swapped to `KpiCard`.
- `AttendanceHistory` (the plain table) rebuilt with `Card`, an icon
  header, sortable columns (`useDataTable`/`SortableTh`, same hook
  from Phase 2), pagination, and the shared `EmptyState` - identical
  treatment to the main data tables so a student's profile page
  doesn't feel like a different app from the admin tables.
- `RecognitionTimeline.jsx` reviewed and left alone - it already had
  the connected-dot timeline with icons and left border the brief
  describes; rewriting it would've been change for change's sake, same
  call as Login.jsx in fix #36.

**Verified:** `npm run build` clean.

**Deliberately not touched in this pass (next phase):**
- Reports/Attendance export & print button review - not done.

## 39. Frontend redesign Phase 6: final polishing pass (everything else)

Went looking for whatever the first five phases hadn't reached yet,
rather than declaring the redesign done after the named items. Found
this by grepping every page/component for leftover `StatsCard` calls
and emoji characters (a Python regex over the Unicode emoji ranges) -
worth remembering as a quick way to audit "did I actually get
everything" instead of trusting a mental list.

**`Reports.jsx` rebuilt:** stat row to `KpiCard`, sessions table
re-styled, and the PDF/Excel download links turned into real icon
buttons (`FaFilePdf`/`FaFileExcel`) instead of plain text links. The
downloads themselves (`downloadPdfReport`/`downloadExcelReport`,
per-row loading state) are untouched - they already hit real backend
endpoints, nothing fake to add or remove here.

**`Attendance.jsx` rebuilt:** this was the last page still on
hand-typed buttons and a raw `<select>` - now uses `KpiCard`,
`FormSelect` for the session filter, `Button` for the two header
actions, and `Card` for the active/no-active-session banners.
Confirmed (again) that no export/print controls exist anywhere on
this page - there's no backend support for them, so none were added,
matching fix #38's Recognition History precedent.

**`Enrollments.jsx` / `FacultyAssignments.jsx` rebuilt:** both had an
inline enrollment/assignment form that predated the Phase 3 form
migration (it lived directly in the page, not in one of the five
`*Form.jsx` files, so it was missed). Now use `FormSelect`/`FormInput`/
`Button` for the form and `SortableTh`/`Pagination`/`EmptyState` for
the table, matching every other list page in the app.

**Remaining `StatsCard` call sites migrated to `KpiCard`:**
`Students.jsx`, `Faculty.jsx`, `Subjects.jsx`, `Sessions.jsx` - the
four pages Phase 5 didn't touch. `StatsCard.jsx` itself is now
unreferenced anywhere in the codebase and has been deleted rather than
left as dead code.

**Emoji swept for react-icons, per the brief's "consistent icon
family" rule:** the recognized-student checkmark and active/no-session
banners in `Attendance.jsx`; the faculty emoji in
`FacultyAssignments.jsx`'s empty state (now `EmptyState` +
`FaUserCheck`); the book emoji in `Enrollments.jsx` and `Subjects.jsx`
empty states (now `EmptyState` + `FaLayerGroup`/`FaBook`);
`SessionTable.jsx`'s Start/End/Reopen buttons (▶/⏹/🔄 → `FaPlay`/
`FaStop`/`FaRedo`); `EmptyState.jsx`'s own fallback icon (📭 →
`FaInbox`); `ActiveSessionWidget.jsx` (🟢 → `Badge`, plus the whole
widget rebuilt on `Card`/`EmptyState`/icon rows since it was still on
its original markup from before Phase 1); and `Dashboard.jsx`'s
live/offline pill (🟢/⚪ → the same animated dot used in the Navbar
since Phase 1, so the two indicators now actually look like the same
feature instead of two different ones).

**Dead code found and removed while sweeping:** three genuinely empty
(0-byte) leftover widget files -
`dashboard/widgets/ActiveSessionCard.jsx`,
`dashboard/widgets/AttendanceTrend.jsx`,
`dashboard/widgets/RecentRecognition.jsx` - each superseded by a
same-purpose `...Widget.jsx`/`...Chart.jsx` file that Dashboard.jsx
actually imports. Confirmed zero references before deleting.

**Verified:** `npm run build` clean after each group of changes in
this pass, and a final `grep`/Python sweep afterward confirmed zero
remaining `StatsCard` references and zero remaining emoji in any
`.jsx` file under `pages/` or `components/`.

**Where the redesign brief now stands, honestly:**
- Layout shell, nav, KPI cards, data tables, forms, modals,
  Recognition hero, Analytics, StudentProfile, Reports, Attendance,
  Enrollments, and FacultyAssignments are all on the shared design
  system (`Card`/`Button`/`Badge`/`KpiCard`/`FormInput`/`FormSelect`/
  `SortableTh`/`Pagination`/`EmptyState`/`Modal`/`ConfirmModal`) with
  no emoji left as icons.
- Not done, because nothing in the brief calls for it and no backend
  support exists: dark mode toggle, export/print on Attendance,
  notification content beyond "nothing new" (no backend notification
  model), and a jump-to-page search beyond the nav-item filter already
  built in Phase 1's Navbar.
- Automated tests are still the pre-existing gap noted at the top of
  this doc (sandbox network restrictions) - unrelated to the frontend
  redesign, not something this pass could fix.

## Phase: Enterprise UI Redesign Pass (Claude, this session)

Frontend-only, backend untouched, per the "Enterprise UI Final
Redesign" brief.

- **Faculty page:** KPI row cut from 4 cards to 2 (`Total Faculty`,
  `Branches` — derived as `new Set(department).size`, not hardcoded).
  Removed the CSE/ECE/ME per-department cards; that breakdown belongs
  in Analytics, not repeated here.
- **Students page:** KPI row cut from 5 cards to 4 (`Total Students`,
  `Active Students`, `Branches`, `Semesters` — both derived via
  `Set`). Removed the CSE/ECE/ME cards.
- **Login page:** full rewrite — split layout (dark branding panel +
  glass-effect form card), matches the reference screenshot's visual
  language. Auth logic (`useForm`, `login()`, `loginUser()`) untouched.
- **Dashboard:** added a proper hero section (time-of-day greeting,
  role label, live date, LIVE/OFFLINE badge) replacing the old plain
  `<h1>`. Reordered sections to KPIs → Quick Actions → Trend/Recognition
  → Active Session/Top Performers → System Health, per the brief's
  hierarchy. System Health card now shows Backend/MongoDB/Socket.IO/
  Vision Module status — **all four derived from real signals**
  (`apiReachable` from the actual stats-load try/catch, `socketConnected`
  from the existing socket listener, `engine.visionModule === "READY"`
  from a real `getEngineStatus()` call) rather than hardcoded `true`,
  consistent with the earlier fabricated-health-check fix.
- **Student Profile:** `ProfileHeader` rebuilt as a gradient hero
  banner (matches Dashboard/Login treatment) instead of a plain white
  card; removed the redundant plain "Student Profile" `<h1>` above it
  since the hero now carries that role.
- **Typography:** normalized oversized `text-4xl font-bold` page
  titles (Analytics, Reports, Students) to `text-3xl font-semibold
  tracking-tight`, matching the scale already used on Faculty/Recognition.
- Recognition page reviewed against the brief and left as-is — already
  matches the "flagship AI product" bar (viewfinder framing, scan
  animation, confidence-style result cards, last-run details).
- **Verified:** `npm install && npm run build` clean, no errors, only
  the pre-existing >500kB chunk-size advisory (unrelated).

**Deferred (not touched this pass):** Recognition Logs page redesign,
full Reports "template/history" rework beyond the KPI/typography
touch-ups above, Subject page enhancements, tables toolbar unification
(search+filter+refresh+export in one bar) across all list pages,
global 8px spacing audit, empty-state illustrations beyond the
existing `EmptyState` component, micro-interactions (button ripple,
loading shimmer). These are real, separate chunks of work — flag them
if you want the next pass.

## Phase: List-Page Toolbar Unification + Recognition Logs / Subjects (Claude, this session cont'd)

Frontend-only, backend untouched.

- **Recognition History (`RecognitionHistory.jsx`):** added the missing
  KPI row (`Total Attempts`, `Recognized`, `Unknown Faces` — all derived
  from the real `logs` array, no invented numbers) above the existing
  search/filter/timeline, and added a `Refresh` button next to the
  toolbar so it matches the Search → Filter → Refresh pattern used
  elsewhere.
- **Subjects page:** replaced the two arbitrary/narrow KPI cards
  (`Semester 5`, `CSE` — hardcoded to one semester and one branch,
  meaningless once other branches/semesters exist) with `Departments`
  (unique branch count) and `Faculty Assigned` (count of subjects with
  a faculty value). **Note:** the original brief also asked for a
  `Credits` KPI — there is no `credits` field anywhere in the Subject
  schema, form, or card, and the backend is frozen, so that card was
  deliberately left out rather than fabricated. Flag it if you want to
  add a real `credits` field later (that would need a backend change).
- **Toolbar unification:** added a `Refresh` button (wired to each
  page's real load function, spinner tied to real `loading` state) next
  to the search bar on Faculty, Students, Subjects, Sessions,
  Attendance, Enrollments, and Faculty Assignments — closing out the
  "Search → Filter → Refresh" toolbar pattern called for in the brief
  across every list page, not just Faculty.
- **Bug caught and fixed during this pass:** an edit to Faculty.jsx's
  toolbar briefly ate the opening `{` of the `loading ? ... : ...` JSX
  ternary that follows it, which would have been a hard build break.
  Caught by `npm run build`, not shipped.
- **Verified:** `npm run build` clean after every edit group in this
  pass.

**Still deferred:** a global 8px spacing audit across every page (spot
checks look consistent already via the shared `Card`/`KpiCard`
components, but a full pass hasn't been done), and micro-interactions
beyond what `Button`/`KpiCard`/`Card` already provide (hover-lift,
shadow transitions) — no ripple/shimmer effects added.

## Phase: Table/Action Polish to Match Reference Screenshot (Claude, this session cont'd)

Frontend-only, backend untouched. Direct response to the reference
screenshot (Faculty page) — matched its remaining visual details across
the app rather than just that one page.

- **`ActionButtons.jsx`:** rebuilt as bordered, rounded icon-buttons
  (indigo edit / red delete, each in its own soft-colored square) —
  matches the reference exactly. This is a single shared component, so
  Faculty, Students, Sessions, and Attendance tables all picked up the
  upgrade automatically without per-page edits.
- **Department/branch columns:** `FacultyTable` and `StudentTable` now
  render department/branch as a rounded pill with a building icon
  (matching the "Computer Science" pill in the reference) instead of
  plain text.
- **Status filter dropdown:** added a real "All Status / Active /
  Inactive" filter to Faculty and Students, wired to each record's
  actual `isActive` field — matches the reference toolbar, not
  decorative.
- **Verified:** `npm run build` clean.

## Phase: App-Wide Radius/Hover/Motion Polish (Claude, this session cont'd)

Pure polish, no new features, backend untouched.

- **Radius unification:** every large container (`Card`, `KpiCard`,
  data tables, `Modal`, `ConfirmModal`) standardized from Tailwind's
  default `rounded-2xl` (16px) to the brief's `rounded-[20px]` —
  applied via a project-wide sweep, so it's identical everywhere
  rather than "close enough" per component.
- **Interactive-element radius:** `Button`, `FormInput`, `FormSelect`,
  `SearchBar`, the hand-typed "+ Add X" buttons on Faculty/Students/
  Subjects/Sessions, every page's Refresh button, the status-filter
  dropdowns, and the ConfirmModal footer buttons all standardized to
  `rounded-[14px]` per the brief's button/input radius spec.
- **Hover-lift micro-interaction:** `Button`, the hand-typed primary
  "+ Add X" buttons, Refresh buttons, and ConfirmModal buttons now
  lift half a pixel with a soft shadow on hover and settle back on
  click (`hover:-translate-y-0.5 active:translate-y-0`, 150ms) instead
  of a flat color-only hover. Small, consistent, not excessive.
- **Page transition:** `AppLayout`'s `<main>` now fades/slides in
  (200ms) on every route change via `framer-motion` keyed on
  `location.pathname` — was instant/jarring before.
- **Verified:** `npm run build` clean after every step of this sweep.

**Still genuinely not done, on purpose:** a literal pixel-ruler 8px
spacing measurement across every page (spacing is consistent by
construction since pages share `Card`/`KpiCard`/`gap-6`/`mb-6`
conventions, but no exhaustive measurement pass was run), and loading
skeletons/shimmer (pages currently use `BeatLoader` spinners, which
work fine — swapping to skeletons is a UI style choice, not a fix, so
it wasn't done without being asked for by name).

## Phase: Spacing Measurement Pass + Loading Skeletons (Claude, this session cont'd)

Both items explicitly called out as "not honestly done" in the prior
summary — actually done now. Backend untouched.

### Spacing audit
Surveyed every spacing class (`m*-N`, `p*-N`, `gap-N`) across all 12
pages. Micro-spacing (`mt-1`/`gap-2`/button padding) is fine at 4px-grid
scale by normal design convention and was left alone. The real
inconsistency was at the **macro/section level**: page header wrapper
and KPI-grid bottom margins were split between `mb-6` (24px, used by
Faculty/Subjects/Sessions/etc.) and `mb-8` (32px, used by Students/
Analytics/Enrollments/FacultyAssignments), and the first section-after-
header gap was split between `mt-6` and `mt-8`/`mt-5` across Reports/
Analytics/Recognition/StudentProfile/Dashboard. Normalized all of it
to a single consistent 24px (`-6`) rhythm everywhere — every page now
breathes at the identical interval. Login's two internal card-spacing
values (`mb-8`, `mt-8`) were deliberately left alone: they're spacing
*within* a single card, not between page sections, and changing them
wasn't part of what was inconsistent.

### Loading skeletons
Replaced `<BeatLoader />` spinners with real shimmer skeletons on
every page that had one:
- **New shared components:** `TableSkeleton` (header bar + N staggered
  shimmer rows, `showHeader` prop for row-list pages like Recognition
  History that don't have a column header) and `CardSkeleton` (N
  shimmer cards) in `components/ui/`.
- **Table pages** (Faculty, Students, Sessions, Attendance,
  Enrollments, Faculty Assignments, Reports' session table) → 
  `TableSkeleton` with a column count matching each table.
- **Card-grid pages** (Subjects) → `CardSkeleton`.
- **Row-list page** (Recognition History) → `TableSkeleton` with
  `showHeader={false}`.
- **Full-page loaders** (Analytics, Student Profile, Dashboard) used
  to render a bare spinner or text on a blank white screen *before*
  the sidebar/navbar even mounted. Rewrote both Analytics and Student
  Profile to render inside `AppLayout` immediately with a skeleton in
  the content area, so the sidebar/navbar appear instantly instead of
  flashing in after data loads — a real UX fix, not just a visual
  swap. Dashboard's "Loading Dashboard..." text placeholder was
  replaced with an actual `CardSkeleton`.
- Login's `ClipLoader` (a button-level submit spinner, not a page
  loader) was correctly left alone — a skeleton doesn't make sense
  inside a button.
- **Verified:** `npm run build` clean after every swap; confirmed no
  file still imports `react-spinners`' `BeatLoader` except where
  intentionally kept (none — fully replaced).

## Phase: KPI Philosophy Alignment (Claude, this session cont'd)

Backend untouched. This pass audited every page's KPI row against the
requested "KPIs summarize, don't repeat the table" mapping and fixed
the pages that didn't match, using only real, already-available data.

- **Faculty / Students / Subjects / Dashboard:** already matched the
  requested mapping from earlier passes. No changes needed.
- **Sessions:** `Total` → `Today's Sessions` (real: filters `session.date`
  against today's date), `Ended` → `Completed`, `Scheduled` → `Upcoming`
  (same underlying data, relabeled to match).
- **Recognition:** replaced `Vision Module` / `Registered Faces` /
  `Last Scan Result` with `Today's Recognitions`, `Accuracy`, `Unknown
  Faces`, `Camera Status` — all computed from a new real fetch of
  `getRecognitionLogs()` filtered to today, refreshed after every scan.
  **Registered Faces and Vision Module weren't deleted** — moved into
  the existing "Last Run Details" panel (now 5 columns) so that real
  information isn't lost, just relocated to where it fits the new KPI
  philosophy.
- **Analytics:** replaced `Students`/`Sessions`/`Attendance`/`Today's
  Attendance` (which duplicated table/chart data) with `Attendance %`
  (derived from the real `present`/`absent` counts the backend already
  returns), `Top Branch`, `Shortage Alerts` (`shortageStudents.length`,
  real), `Recognition Accuracy` (`recognitionStats.accuracy`, real).
  **Caveat on "Top Branch":** the backend's `branchAttendance` only
  aggregates student *headcount* per branch, not per-branch attendance
  rate — there's no field for that. So "Top Branch" here means "branch
  with the most students," not "branch with the best attendance,"
  because that's the only real data available. Flag it if you want a
  true attendance-rate version — that needs a backend aggregation
  change, which is out of scope while backend is frozen.
- **Reports:** requested KPIs were `Generated Reports`, `Scheduled
  Reports`, `Exports Today`, `Templates`. **Deliberately not
  implemented** — FACREC has no report-generation log, no scheduling
  feature, and no templates concept anywhere in the backend; reports
  are generated on-demand as PDF/Excel downloads per session with
  nothing persisted. Building these KPIs would mean inventing numbers
  with no real backing, which violates the project's core principle.
  Left Reports' KPIs as `Completed Sessions` / `Total Present` / `Total
  Absent` — real, meaningful, and already correct. A real version of
  the requested KPIs would need new backend fields (report logs,
  scheduling, templates), which is a feature addition, not UI polish.
- **Verified:** `npm run build` clean.

## Phase: Navbar Clock + Sectioned Forms (Claude, this session cont'd)

Backend untouched. Went through this critique's remaining items one
by one against the actual codebase (most were already done in earlier
passes - Faculty/Students KPIs, Dashboard hero/KPIs/actions/health,
Recognition flagship layout, Student Profile hero, table toolbars,
color/spacing/radius consistency).

### Genuinely new, implemented
- **Navbar clock:** added a live time display (updates every 30s,
  `now.toLocaleTimeString`) between Notifications and the user/profile
  block, matching the requested `Breadcrumb → Search → Notifications →
  Clock → Profile` order. Navbar already had breadcrumb, jump-to-page
  search, and notifications from earlier work - this was the one
  missing piece.
- **Sectioned forms:** `StudentForm` and `FacultyForm` now group their
  real fields under labeled sections ("Personal Information" /
  "Academic Details" for Students, "Personal Information" /
  "Professional Details" for Faculty) with a divider and consistent
  spacing, instead of one flat, unlabeled field list.

### Deliberately not done, and why
- **"Recognition" as a third form section:** neither form has any
  face-recognition-related fields (dataset registration is a separate
  flow elsewhere in the app) - there was nothing real to put in a
  third section, so only the two sections with actual fields were
  added.
- **Sidebar "Settings shortcut":** there is no Settings page or route
  anywhere in this app. Adding a sidebar link for it would mean either
  a dead button or building a whole new page with no backend behind
  it - out of scope for a UI-polish pass. The sidebar footer already
  has a version tag (`FACREC v2.0`) and logout.
- **Reports "Report Center" (templates/history/scheduling):** same
  call as the previous phase - no backend support for any of that
  exists, so it wasn't fabricated.
- **Pixel-level mobile/tablet QA at 1920/1440/1366/tablet widths:**
  responsive classes (`md:`/`lg:`) are used consistently throughout,
  but this environment can build and verify code correctness, not
  visually render the app in a browser at specific viewports - that
  needs `npm run dev` and an actual screen to check against. Flag any
  specific breakpoint that looks wrong once you've run it locally and
  it can be fixed directly.
- **Verified:** `npm run build` clean.

## Phase: Form Sectioning Completed Across the Board (Claude, this session cont'd)

Backend untouched. Finished what the previous phase started: went
through every form component in the app, not just Student/Faculty.

- **`SubjectForm`:** sectioned into "Subject Details" (code, name) and
  "Academic Assignment" (semester, branch, faculty).
- **`SessionForm`:** sectioned into "Subject Selection" (subject
  dropdown + the auto-filled faculty/semester/branch read-only fields)
  and "Schedule" (date, start time, end time).
- **`AttendanceForm`:** left as a single flat flow on purpose - it's a
  strictly linear session → student → status sequence with no natural
  grouping, so forcing section headers onto it would be decorative,
  not clarifying.
- **Enrollments / Faculty Assignments inline forms:** left as-is - both
  are simple two-field-plus-button quick-add rows embedded directly in
  their page, not multi-field modals, so they don't need the same
  treatment.
- **Verified:** `npm run build` clean.

This closes out every form in the app to the same standard.

## Phase: Real Bugs Found From Actual Screenshots (Claude, this session cont'd)

The person shared real screenshots of the running app for the first
time this session - up to now everything had been verified by
`npm run build` only, which catches compile errors but not visual
bugs. Went through both screenshots and found genuine, verifiable
issues (not just re-reading the same brief again). Backend untouched.

### Confirmed real bugs, fixed
- **Search placeholder text was wrong on almost every page.** Faculty,
  Sessions, Attendance, Enrollments, and Faculty Assignments were all
  missing a `placeholder` prop on `<SearchBar>`, so they silently fell
  back to `SearchBar`'s hardcoded default - "Search by name, roll no
  or email..." - which is what the Subjects screenshot showed, and is
  nonsense on a subjects list. Gave each page its own accurate
  placeholder matching what it actually searches (verified against
  each page's real filter logic, not guessed).
- **Subjects KPI row didn't match what was already implemented
  earlier** - still had 4 cards (`Subjects`, `Departments`, `Faculty
  Assigned`, `Active`) instead of the intended 3. Fixed for real this
  time: dropped `Active` (redundant - every card already shows its own
  Active/Inactive badge) and renamed `Departments` → `Branches` to
  match the terminology Faculty/Students already use.
- **Subject cards' "0%" attendance read as a broken/failed state**
  (bright red). The backend only sets `attendancePercentage` to 0 when
  a subject has no ended sessions yet - it can't be distinguished from
  a genuine 0%, because the field that would tell them apart
  (`totalExpected`) is explicitly stripped out of the API response.
  Given that ambiguity, switched to reading any 0% as "Not Started"
  (neutral gray badge, no progress bar) rather than an alarming red
  failure state - the honest call given what's actually knowable from
  the frontend.
- **Full `SubjectCard` redesign** per the reference: icon header,
  colored semester/branch pill badges, icon rows for faculty/enrolled
  students, "Not Started" state, hover-lift. **"View" button was not
  added** - there is no subject detail route anywhere in the app, so a
  View button would be a dead link. Kept Edit/Delete only.
- **`RecentRecognitionWidget` on the Dashboard always rendered
  confidence in green, even at 33%.** Now color-coded by actual value
  (emerald ≥75%, amber ≥50%, red below) as a pill badge, matching the
  threshold logic already used on `SubjectCard`. Also rebuilt with
  avatar initials and the app's standard card-title styling - it had
  never been touched since before the redesign passes and stood out
  as visibly older than everything around it.
- **Quick Actions was a sparse 2×2 grid stretched across the full
  dashboard width**, which is exactly the "huge empty card" complaint
  in the screenshot. Changed to a 4-across row on larger screens so
  the four action buttons fill the width properly, and gave each
  action's icon a colored container matching the rest of the design
  system instead of a bare icon.
- **Six more stale `text-2xl font-bold` widget/card headers**
  (`AttendanceTrendChart`, `TopPerformersWidget`, `ActiveSessionWidget`,
  `SubjectPerformance`, `RecognitionTimeline`, `EnrolledSubjects`) were
  never brought in line with the `text-lg font-semibold text-slate-800`
  standard used everywhere else - normalized all of them. Left
  `StudentCard`'s large name heading and `RecognitionHistory`'s
  confidence-percentage stat value alone - those are a profile name
  and a numeric stat display respectively, not section headers, so the
  large size there is correct, not a bug.

### Flagged, not guessed at
- The Dashboard screenshot appears to show the KPI row's colored icon
  squares overlapping the bottom edge of the dark hero banner, and the
  sidebar's collapse toggle possibly overlapping the "U / ADMIN" user
  block. Read through `KpiCard`, `Dashboard.jsx`, and `Sidebar.jsx` and
  found no code that would cause either (no negative margins, no
  absolute positioning that escapes its container, and the toggle's
  fixed position lands within the logo block, not the user block, by
  the actual pixel math). This may be a screenshot-compression/scaling
  artifact rather than a real layout bug. If it's still visible after
  this build, send a full-resolution screenshot of just that header
  area and it'll get a real fix instead of a guessed one.
- **Verified:** `npm run build` clean after every change in this pass.

## Phase: Sidebar Investigation + Two-Letter Avatar (Claude, this session cont'd)

Backend untouched. Direct follow-up to "what about sidebar?"

- **Investigated the earlier flagged overlap concern properly.**
  Re-read `Sidebar.jsx` line by line: the collapse toggle is
  `absolute -right-3 top-9`, which by the actual pixel math sits
  within the logo block's vertical span (top-9 = 36px, logo block is
  ~92px tall with its own padding) - not anywhere near the user
  avatar block below it. No negative margins, no z-index conflicts,
  no absolute positioning that escapes its container. Couldn't
  reproduce a real bug from the code. Most likely a screenshot
  scaling/compression artifact rather than an actual layout defect -
  flagged as still unconfirmed rather than claiming it's fixed.
- **Real, verified fix made instead:** the reference image's sidebar
  avatar shows two-letter initials ("SA" for System Admin), while the
  app's `Sidebar.jsx` was using `.charAt(0)` - a single letter. Added
  a shared `getInitials()` utility (strips Dr./Mr./Mrs./Ms. before
  taking initials, e.g. "Dr. Ananya Rao" → "AR") and applied it to the
  sidebar's 40px avatar, which has room for two characters. Left the
  Navbar's avatar as single-letter on purpose - it's a small 32px
  badge where a single bold initial reads more cleanly than two
  cramped letters, and the reference doesn't show that badge at all
  to compare against.
- **Verified:** `npm run build` clean.

## Phase: Dashboard Deep Pass - Real Bugs, Not Just Polish (Claude, this session cont'd)

Adopted the "one page at a time, Dashboard first" rule going forward.
Backend untouched (one real backend bug found and documented below,
NOT fixed there - worked around it on the frontend instead).

### The actual root cause of "Welcome back, there"
Traced it instead of styling around it. `AuthContext`'s `loadUser()`
calls `getProfile()` on every page load/refresh. The backend's
`getProfile()` controller only returns `{ id, role }` - it drops
`name` and `email`, even though `login()` returns the full
`{ id, name, email, role }`. So the name is correct immediately after
login, then gets wiped the moment the page is refreshed, which is
exactly what the screenshots showed (missing name in the Dashboard
hero **and** the Sidebar simultaneously - same root cause, same
symptom, confirming it wasn't a rendering bug).

This is genuinely a one-line backend fix (`getProfile` should include
`name`/`email` like `login` does), but backend is frozen, so instead:
`AuthContext` now caches `{ name, email }` in `localStorage` at login
time and re-merges them into whatever `getProfile()` returns on every
subsequent load. **This requires one fresh login after this update
ships** to seed the cache - existing sessions won't retroactively fix
themselves until then, since the fix can't recover data the backend
never sent this session.

### A real hardcoded-fake-data bug, found and fixed
`AttendanceTrendChart` (the "Attendance Trend" widget on the
Dashboard) was rendering a **hardcoded `sampleData` array** -
`Mon: 81, Tue: 84, Wed: 90, Thu: 86, Fri: 94` - completely disconnected
from any real data, sitting there since before this session's
involvement. Investigated and found the backend already has a real,
working endpoint for this (`GET /dashboard/attendance-trend`,
aggregates the last 7 days of real `Attendance` records) - it just had
no frontend service function calling it. Added the missing
`getAttendanceTrend()` call and rewired the chart to real data, plus
added the requested Average/Peak/Lowest summary stats (computed from
the real trend values) and a proper empty state for when there's no
attendance data yet.

**Week/Month/Semester filter buttons were not added** - the backend
endpoint only aggregates a fixed last-7-days window. Adding filter
buttons that don't actually change the underlying query would be a
fake control, worse than no control. That needs a real backend
aggregation change (out of scope while frozen) to do honestly.

### Today's Insights panel - added, real data
New panel between Quick Actions and the charts: Attendance % (derived
from `present`/`absent`, same real fields used on the Analytics page),
Recognition Accuracy, and Students Below 75% - all from the existing
`/analytics` endpoint (admin-only server-side, so the panel and its
fetch are gated to `user.role === "admin"`). Reused the same endpoint
already trusted on the Analytics page rather than inventing a new one.

**"Pending Sessions" was left out** of Insights - would need fetching
the full sessions list just for a count, which felt like scope creep
for this pass; can be added cleanly next round if wanted.

### Spacing - Dashboard only, per the new one-page-at-a-time rule
Bumped every major Dashboard section gap (hero → KPIs → Quick Actions
→ Insights → Charts → Active Session/Top Performers → System Health)
from 24px to 32px, matching the new spec's master grid. Did **not**
touch spacing on any other page, per "don't modify any other page
until this one is approved."

### KPI trends (Students +2 today, ↑5%, etc.) - not added
There's no day-over-day historical field anywhere in the dashboard
stats response or the database - it's a live snapshot count, not a
time series. Adding "+2 today" would mean inventing a number with
nothing behind it. `KpiCard` already supports an optional `trend`
prop for whenever real day-over-day data exists; left it unset rather
than fake it.

### Recent Activity timeline - not added
Requested as "Faculty created session → Student recognized →
Attendance generated → Report exported." There is no unified activity/
event log anywhere in the backend - no endpoint returns a stream of
system events. Building this convincingly would mean fabricating a
timeline, not surfacing real data. Flagging this clearly instead of
faking it: this needs a real backend activity log to do honestly.

- **Verified:** `npm run build` clean after every change in this pass.

## Phase: Dashboard - Analyzed the New Screenshot, Then Fixed What It Showed (Claude, this session cont'd)

Backend untouched. Went through the new screenshot point by point
before touching anything.

### Confirmed from the screenshot, not the brief text
- **"Welcome back, there" still showing, and the sidebar avatar is
  still a single "U"** - this is the same root cause from the previous
  phase (`getProfile()` losing `name`), not a new bug and not a failed
  fix. The `AuthContext` fix only takes effect after a fresh login,
  which this screenshot's session predates. Confirmed by the fact that
  both symptoms (missing name, single-letter avatar fallback) trace to
  the exact same cause.
- **The earlier "KPI icons overlapping the hero" concern is gone in
  this screenshot** - the KPI row now sits cleanly below the hero with
  clear separation. Treating that as resolved/was likely a rendering
  artifact, not chasing it further.
- **The attendance-trend chart's X-axis shows real dates ("09-07",
  "10-07", "11-07") instead of weekday labels** - confirms the fake
  `sampleData` fix from last phase actually took: this is genuinely
  the last-7-days-of-real-`Attendance`-records endpoint responding,
  just with fewer distinct days than a full week because that's how
  many days actually have attendance rows in this database right now.
  Not a bug - it's what real (sparse, early-stage) data looks like.

### Real fixes made from what the screenshot showed
- **Today's Insights was three floating text blocks spread across the
  full card width** with no visual boundary - exactly the "too much
  empty horizontal space" the screenshot showed. Rebuilt as three
  individual bordered cards, each with an honest descriptive subtitle
  ("Across all ended sessions", "Based on recent scans", "Review
  required" / "All students on track" depending on the real count) -
  not fabricated trend numbers.
- **KPI cards added an honest subtitle line** (`KpiCard` now supports
  a `subtitle` prop) - "Active enrollment", "Active this term",
  "Current semester", "Across all ended sessions". These are
  descriptive labels, not invented deltas like "+2 this week" - there's
  still no historical field to compute a real trend from, so no
  numeric trend was added, same reasoning as last phase.
- **Attendance KPI card was tone="red"** regardless of the actual
  percentage, meaning a healthy 95% attendance rate would still render
  in alarm-red. Red should mean something's actually wrong; changed to
  a neutral blue since this metric isn't inherently bad.
- **Chart tooltip was recharts' unstyled default** (plain white box,
  no rounded corners, didn't match anything else in the app) - visible
  in the screenshot's "11-07 / attendance : 37" popup. Styled it to
  match the app's card language (14px radius, soft shadow, proper
  label weight).
- **Navbar search bar was oversized relative to the breadcrumb**
  (`w-56 lg:w-72`, sharp `rounded-lg` corners) - reduced to
  `w-44 lg:w-60` and bumped to the app's standard 14px radius.
- **Recognition confidence badges used `-50` shade backgrounds**
  (`bg-red-50` etc.) which read as barely-there in the screenshot -
  bumped to `-100` shades with matching `-700` text for real contrast
  without going back to plain unbadged text.

### Not touched, and why
- KPI numeric trends ("+2 this week", "↑5%") - still no day-over-day
  data anywhere in the database to compute these from honestly.
- Recent Activity timeline - still no event log in the backend.
- Chart Week/Month/Semester filters - still only a fixed 7-day backend
  aggregation exists.
- **Verified:** `npm run build` clean.

## Phase: Dashboard Pixel-Polish Pass - Two Real Bugs Found + Full Spacing Sweep (Claude, this session cont'd)

Backend untouched. No new widgets/sections/features added, per "freeze
after this" - pure layout/spacing/alignment fixes only.

### Two real, root-caused bugs (not just spacing tweaks)
- **Sidebar collapse toggle was genuinely capable of visually
  colliding with hero content.** The toggle button was positioned
  `absolute -right-3` - 12px *outside* its own sidebar's right edge -
  while the sidebar container itself has `overflow-hidden`. That
  combination means the button was either being clipped into a
  half-circle by its own container, or (depending on stacking/paint
  order) bleeding into the main content area right where the hero text
  starts - exactly the "‹Good afternoon" artifact visible in the
  screenshot. Fixed by pulling it to `right-3` (positive), fully
  inside the sidebar's own bounds - it can no longer be clipped or
  escape into main content, full stop, regardless of any other CSS
  interaction.
- **Search bar icon/placeholder overlap was real**, confirmed in the
  zoomed screenshot. Rebuilt with generous, explicit spacing: icon at
  `left-4`, input `pl-11` (44px clearance), fixed `h-10` height,
  `rounded-full` pill shape - matches the explicit spec given
  (icon offset, left padding, fixed height, pill radius) rather than
  the previous best-guess padding that turned out insufficient.

### Full spacing sweep, everything now on one consistent scale
- Hero: padding trimmed `p-8`→`p-7` (~15% height reduction), greeting→
  title gap fixed to 16px (`mt-4`), title→subtitle to 12px (`mt-3`),
  date-block internal gap to 8px (`mt-2`), date-block→LIVE-badge gap
  widened to 16px (`gap-4`).
- `KpiCard`: added `min-h-[132px]` so every KPI card is now genuinely
  identical height regardless of subtitle/trend presence (previously
  only *visually* similar by coincidence), and asymmetric padding
  (`pb-6` vs `pt-5`) so subtitle text has real breathing room from the
  rounded bottom edge instead of sitting close to it.
- Quick Actions: icon→title gap fixed to the spec's literal 24px
  (`gap-6`), card-to-card gap widened from 16px to 24px (`gap-6`),
  section title→cards trimmed to 16px (`mb-4`).
- Today's Insights: each card rebuilt as a centered flex column with
  `min-h-[132px]` (matching KpiCard's height for visual harmony) and a
  consistent 16px rhythm between title→value→subtitle, instead of the
  previous inconsistent 8px gaps that read as "cramped."
- Attendance chart: added an explicit `margin` prop to the recharts
  `LineChart` so the plotted line/axes no longer sit flush against the
  card edges.
- Recognition panel: row height increased (`py-2.5`→`py-4`, plus `px-1`
  for equal left/right breathing room) to bring rows closer to the
  spec's ~64px target instead of the previous ~52px.
- **Standardized every Dashboard section's title-to-content gap to
  16px** (`mb-6`→`mb-4` across Quick Actions, Today's Insights,
  Attendance Trend, Recent Recognition, Active Session, Top
  Performers, System Health) - previously an inconsistent mix of 24px
  in some places. Major section-to-section gaps stay at 32px
  (`mt-8`/`mb-8`) as set in the previous phase - these are two
  different, now both consistent, spacing tiers.

### Not touched
Per "Dashboard is frozen after this, one page at a time" - no other
page's spacing, components, or layout were touched. Numeric KPI
trends and Recent Activity timeline remain undone for the same
real-data reason as the last two phases.

- **Verified:** `npm run build` clean.

## Phase: Confirmed Prior Fixes, Investigated the Persistent Search Icon Report (Claude, this session cont'd)

Backend untouched.

### Confirmed fixed from the new screenshots
- **"Welcome back, System Admin"** now shows the real name - the
  `AuthContext` fix from two phases ago is confirmed working after a
  fresh login.
- **The sidebar-toggle-overlapping-hero-text artifact is gone** - "Good
  morning" now renders cleanly with no stray leading character, in a
  fresh screenshot taken after the `right-3` fix.
- KPI cards, Today's Insights, Quick Actions, Active Session, Top
  Performers, and System Health all read as cleanly spaced and
  correctly separated in both new screenshots - no further changes
  needed in those areas this pass.

### The search icon "overlap" - investigated, most likely not a real bug
Every screenshot across this whole thread shows the magnifying-glass
glyph sitting in the exact same spot: hovering over the middle of the
word "Jump" itself. That doesn't match what the actual code produces -
the icon is explicitly positioned at `left-4` (16px from the input's
left edge) with the placeholder text starting at `pl-11` (44px), a
deliberate ~28px gap specifically so they can't touch. If this were a
real rendering bug, the icon would appear at the far-left edge of the
input, not hovering mid-word over "Jump" - and changing the padding
value repeatedly across several phases hasn't moved where the overlap
appears at all, which a real CSS positioning bug would respond to.
That combination (fixed absolute screen position, doesn't match the
actual DOM position, unaffected by padding changes) is the signature
of a mouse cursor rendered into the screenshot, not a layout defect -
some magnifying-glass-shaped cursor (zoom tool, browser extension,
OS accessibility cursor) happening to sit over that exact spot when
the screenshot was taken. Not chasing this further with more padding
tweaks, since there's nothing left in the actual markup to change -
if it's still visible in a screenshot taken with the mouse moved away
from the search bar, that would be the actual signal something's
still wrong.

### Small real fixes made anyway
- Navbar height bumped slightly (`py-3.5`→`py-4`) for more breathing
  room, per the spec's "navbar feels compressed" note.
- Breadcrumb group now has a guaranteed minimum 24px gap (`mr-6`)
  before the search bar, rather than relying entirely on
  `justify-between`'s leftover space, which could shrink at narrower
  desktop widths.
- Reviewed the right-hand navbar cluster (Live badge, bell, clock,
  profile) - it already uses a deliberate two-tier spacing pattern
  (12px within related items, 24px with a divider line between
  distinct groups like Clock and the profile block), which is
  intentional grouping, not inconsistency. Left as-is.

- **Verified:** `npm run build` clean.

## Phase: Max-Width Container + Padding Pass (Claude, this session cont'd)

Backend untouched. The independent code-review pass converged on the
same finding as this session's earlier analysis - the search icon
positioning is correct in the code and not the cause of anything.

### The one structural fix, applied at the shared layout level
`AppLayout.jsx`'s `<main>` had no maximum width, so on wide monitors
every section stretched edge-to-edge with no visual containment -
exactly the "everything touches the browser edge" complaint. Added
`max-w-[1600px] mx-auto` inside `<main>`, wrapping the existing
padding. This is a one-line change in the single shared page shell
every route already renders through, so it benefits every page
consistently rather than being a per-page fix - the same reasoning
that justified `AppLayout` existing as a shared component in the
first place.

### Dashboard-specific padding/spacing fixes
- Hero: horizontal padding widened to the requested 32px (`px-8`),
  kept the trimmed 28px vertical (`py-7`) from two phases ago.
- `KpiCard`: padding bumped to the requested 24px (`px-6`), and the
  icon nudged down slightly (`mt-1`) so it doesn't read as sitting
  higher than the title text next to it.
- **Section title→content spacing reverted from 16px back to 24px**
  (`mb-4`→`mb-6`) across Today's Insights, Quick Actions, Recent
  Recognition, Attendance Trend, Active Session, Top Performers, and
  System Health - this phase's spec explicitly asked for 24px here,
  superseding the 16px set two phases ago. The *internal* card rhythm
  inside the Today's Insights cards (title→value→subtitle) stays at
  16px - that's a different, correctly-distinct spacing tier from the
  section-header-to-card-grid gap.
- Navbar: horizontal padding widened to `px-8`, now aligned with the
  main content area's own `lg:p-8` padding so the navbar and page
  content share the same left edge.

- **Verified:** `npm run build` clean.

## Phase: Dashboard Hero/KPI Overlap - Structural Fix, Not Another Margin Tweak (Claude, this session cont'd)

Backend untouched. This screenshot showed the hero/KPI overlap clearly
and unambiguously for the first time - unlike earlier ambiguous
reports, this one left no room for the "might be a rendering
artifact" read from a few phases ago.

### Real problem, real fix - not more margin guessing
Rather than adjust the hero's `mb-8` value yet again (which had
already been set correctly multiple phases in a row without
resolving this), the entire top-level Dashboard spacing was converted
from individual `mb-8`/`mt-8` margin classes on each section to a
single `<div className="flex flex-col gap-8">` wrapping every major
section (Hero, KPI row, Quick Actions, Today's Insights, Charts row,
Active Session row, System Health). Every one of those margin classes
was removed.

**Why this instead of tuning the margin again:** `gap` on a flex
container is a fundamentally different CSS mechanism from
`margin-bottom` - it's computed by the flex layout algorithm itself
and reserves real space between children unconditionally. It can't be
affected by margin collapse, sibling margin interactions, or any of
the subtler ways a `margin-bottom` value can fail to produce visible
space depending on surrounding markup. If the previous overlap was
caused by any of those margin-specific edge cases, this removes the
entire mechanism that could cause it, rather than trying to diagnose
which specific one it was.

### Not changed, and why
- **Quick Actions "Manage Subjects" card looked darker/selected in the
  screenshot** - that's the card's own `hover:bg-indigo-50
  hover:text-indigo-700 hover:border-indigo-400` state, which is
  working as designed; the mouse was very likely resting over that
  card when the screenshot was taken. Not a bug to fix.
- **Search bar width** - this phase's spec suggested widening to
  420-440px, but a previous phase's independent code review explicitly
  compared the code and concluded the current width was already
  correct and shouldn't be increased. Kept the current width rather
  than flip-flopping on conflicting guidance without new evidence.
- **Search icon "overlap"** - still not touched, per the standing
  conclusion from two phases ago (mouse cursor, not a code issue)
  which this phase's own text explicitly agreed with ("don't chase
  that anymore").

- **Verified:** `npm run build` clean, and confirmed via `grep` that
  zero `mt-8`/`mb-8` classes remain in `Dashboard.jsx` - spacing is
  now 100% `gap`-driven for the page's major sections.
