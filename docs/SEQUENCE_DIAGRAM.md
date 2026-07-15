# FACREC — Sequence Diagram: Recognition → Attendance

This is the core workflow examiners tend to ask about. Mermaid renders
this natively on GitHub; if viewing elsewhere, paste it into
https://mermaid.live.

```mermaid
sequenceDiagram
    actor Faculty
    participant React as React (Recognition.jsx)
    participant API as Express (recognitionEngineController)
    participant Mongo as MongoDB
    participant Py as face_recognition.py
    participant Cam as Webcam / OpenCV

    Faculty->>React: Click "Start Recognition"
    React->>API: POST /api/engine/start (JWT)
    API->>Mongo: find ACTIVE AttendanceSession
    alt no active session
        API-->>React: 400 "No active attendance session"
    else session found
        API->>Py: spawn child process
        Py->>Py: load_face_dataset() → {label: roll_no}
        loop up to MAX_FRAMES
            Py->>Cam: read frame
            Py->>Py: Haar Cascade detect_faces()
            alt face detected
                Py->>Py: KNN predict() against dataset
                alt match found
                    Py->>Py: encode snapshot, scale bounding box,<br/>compute duration_ms
                    Py-->>API: stdout JSON {roll_no, confidence,<br/>snapshot, bounding_box, duration_ms}
                end
            end
        end
        API->>Mongo: Student.findOne(faceDatasetId or rollNo)
        alt student found
            API->>Mongo: RecognitionLog.create(status=RECOGNIZED, ...)
            API->>Mongo: Attendance.create / reuse existing<br/>(attendanceService.markAttendance)
            API->>Mongo: AttendanceSession.presentStudents += 1 (implicit via query on complete)
        else no match
            API->>Mongo: RecognitionLog.create(status=UNKNOWN, ...)
        end
        API-->>React: 200 { recognized, attendance, recognitionLogs }
        React->>React: toast + update UI
    end
```

## Session completion (auto-absent detection)

```mermaid
sequenceDiagram
    actor Faculty
    participant React
    participant API as Express (sessionController)
    participant Mongo as MongoDB

    Faculty->>React: Click "End Session"
    React->>API: PATCH /api/sessions/:id/complete
    API->>Mongo: enrollmentService.getEnrolledStudentIds(subject)
    API->>Mongo: Attendance.find({session, status: "Present"})
    API->>API: absentIds = enrolled - present
    API->>Mongo: Attendance.insertMany(absentIds, status: "Absent")
    API->>Mongo: AttendanceSession.update(<br/>expectedStudents, presentStudents,<br/>absentStudents, status: ENDED, isLocked: true)
    API-->>React: 200 updated session
```
