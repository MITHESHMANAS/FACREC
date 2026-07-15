# FACREC — Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| FACULTY : "linked login (optional)"
    FACULTY ||--o{ FACULTYSUBJECT : "teaches"
    SUBJECT ||--o{ FACULTYSUBJECT : "taught by"
    STUDENT ||--o{ ENROLLMENT : "enrolls"
    SUBJECT ||--o{ ENROLLMENT : "has students"
    SUBJECT ||--o{ ATTENDANCESESSION : "scheduled for"
    ATTENDANCESESSION ||--o{ ATTENDANCE : "records"
    STUDENT ||--o{ ATTENDANCE : "marked in"
    ATTENDANCESESSION ||--o{ RECOGNITIONLOG : "captured during"
    STUDENT ||--o{ RECOGNITIONLOG : "recognized as (nullable)"

    USER {
        string name
        string email UK
        string password "bcrypt hash"
        string role "admin | faculty | student"
        boolean isActive
    }

    FACULTY {
        string name
        string email UK
        string employeeId UK
        string department
        string designation
        ObjectId user FK "nullable, links to USER"
        boolean isActive
    }

    SUBJECT {
        string code UK
        string name
        number semester
        string branch
        string faculty "display string, kept in sync by seed/assignment"
        boolean isActive
    }

    FACULTYSUBJECT {
        ObjectId faculty FK
        ObjectId subject FK
        string academicYear
        string status "ACTIVE | INACTIVE"
    }

    STUDENT {
        string name
        string rollNo UK
        string email UK
        string branch
        number semester
        string faceDatasetId "matches face_dataset/<id>.npy"
        boolean isActive
    }

    ENROLLMENT {
        ObjectId student FK
        ObjectId subject FK
        string status "ACTIVE | TRANSFERRED | REMOVED"
    }

    ATTENDANCESESSION {
        ObjectId subject FK
        string faculty
        number semester
        string branch
        string date
        string startTime
        string endTime
        string status "SCHEDULED | ACTIVE | ENDED"
        number expectedStudents
        number presentStudents
        number absentStudents
        boolean isLocked
    }

    ATTENDANCE {
        ObjectId student FK
        ObjectId session FK
        string status "Present | Absent"
        date markedAt
    }

    RECOGNITIONLOG {
        ObjectId student FK "nullable - null means unmatched"
        ObjectId session FK
        string recognizedName
        number confidence
        string subject
        string camera
        string status "RECOGNIZED | UNKNOWN"
        string snapshot "base64 JPEG data URI, nullable"
        object boundingBox "x, y, width, height, frameWidth, frameHeight"
        number durationMs
        date capturedAt
    }
```

## Uniqueness constraints (duplicate prevention)

| Model | Constraint |
|---|---|
| `User.email` | unique |
| `Student.rollNo`, `Student.email` | unique |
| `Faculty.email`, `Faculty.employeeId` | unique |
| `Subject.code` | unique |
| `Enrollment` | compound unique on `(student, subject)` — a student can't double-enroll in the same subject |
| `FacultySubject` | compound unique on `(faculty, subject, academicYear)` — same assignment can't be created twice |
| `Attendance` | enforced at the service layer (`attendanceService.markAttendance` checks for an existing Present record for that student+session before inserting) rather than a DB index, so "already marked" can return a friendly message instead of a raw duplicate-key error |

## Why `Enrollment` doesn't duplicate `branch`/`semester`

`Enrollment` only stores `student` and `subject` references plus
`status`. Branch and semester live on `Student` and `Subject`
respectively. Storing them again on `Enrollment` would be denormalized
data that silently goes stale if a student changes branch — populate
`student`/`subject` when that info is needed instead.
