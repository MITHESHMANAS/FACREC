# FACREC — API Documentation

Base URL: `http://localhost:5000/api` (or `PORT` from `.env`)

All routes except `/auth/register` and `/auth/login` require an
`Authorization: Bearer <token>` header. Tokens come from `/auth/login`
and are role-scoped (`admin`, `faculty`, `student`) — routes reject
with `403` if your role isn't in the allowed list shown below.

## Auth — `/api/auth`
| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/register` | public | creates a `User` (bcrypt-hashed password) |
| POST | `/login` | public | returns `{ token, user }` |
| GET | `/profile` | any authenticated | current user from the token |

## Students — `/api/students`
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin |
| GET | `/` | admin, faculty |
| GET | `/:id` | admin, faculty |
| PUT | `/:id` | admin |
| DELETE | `/:id` | admin |

## Subjects — `/api/subjects`
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin |
| GET | `/` | admin, faculty — returns `enrolledCount` and `attendancePercentage` per subject (see `subjectService.getSubjects`) |
| PUT | `/:id` | admin |
| DELETE | `/:id` | admin |

## Faculty — `/api/faculty`
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin |
| GET | `/` | admin, faculty |
| PUT | `/:id` | admin |
| DELETE | `/:id` | admin |
| PATCH | `/:id/link-user` | admin — links a Faculty record to a login `User` |

## Faculty ↔ Subject assignment — `/api/faculty-subjects`
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin |
| GET | `/` | admin, faculty |
| GET | `/mine` | faculty — the logged-in faculty's own assignments |
| PATCH | `/:id/remove` | admin |

## Enrollments — `/api/enrollments`
| Method | Path | Roles |
|---|---|---|
| GET | `/` | admin, faculty |
| POST | `/` | admin |
| PATCH | `/:id/remove` | admin |

## Sessions — `/api/sessions`
| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/` | admin | faculty must already be assigned to the subject (unless caller is admin) |
| GET | `/` | admin, faculty | |
| PUT | `/:id` | admin | |
| DELETE | `/:id` | admin | |
| PATCH | `/:id/start` | admin, faculty | ends any other ACTIVE session first, snapshots `expectedStudents` |
| PATCH | `/:id/complete` | admin, faculty | computes present/absent, bulk-inserts Absent records, locks session |
| PATCH | `/:id/reopen` | admin | unlocks a completed session for correction |

## Attendance — `/api/attendance`
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin, faculty — manual mark (recognition also calls this internally) |
| GET | `/` | admin, faculty |
| DELETE | `/:id` | admin |

## Recognition engine — `/api/engine`
| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/health` | admin, faculty | liveness check |
| POST | `/start` | admin, faculty | requires an ACTIVE session (400 otherwise). Runs one webcam recognition pass, logs every attempt (matched or unknown) to `RecognitionLog`, marks Attendance for matches |

## Recognition logs — `/api/recognitions`
| Method | Path | Roles |
|---|---|---|
| GET | `/` | admin, faculty — full history with student/session/subject populated |
| GET | `/recent` | admin, faculty — last 10 |
| DELETE | `/:id` | admin |

## Reports — `/api/reports`
| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/pdf` | admin, faculty | PDF for the current ACTIVE session's attendance |
| GET | `/excel` | admin, faculty | same, as .xlsx |

## Analytics — `/api/analytics`
| Method | Path | Roles |
|---|---|---|
| GET | `/` | admin, faculty — totals, attendance trend, subject distribution, branch breakdown, shortage list (<75%), weekly heatmap |

## Dashboard — `/api/dashboard`
| Method | Path | Roles |
|---|---|---|
| GET | `/stats` | admin, faculty |
| (additional live-widget endpoints under `dashboardAnalyticsRoutes`, also mounted at `/api/dashboard`) | | admin, faculty |

## Student profile — `/api/student-profile`
| Method | Path | Roles |
|---|---|---|
| GET | `/:id` | admin, faculty, student (own profile) |

---

**Note on the deleted `/api/recognition/*` path:** an earlier version of
this codebase had a second, unused recognition endpoint at
`/api/recognition/start`. It was dead code (the frontend only ever
called `/api/engine/start`) and has been removed along with its
controller, service, and the `vision/app.py` entry point it used. See
`docs/ARCHITECTURE.md` for why.
