const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");
const enrollmentService = require("./enrollmentService");
const facultySubjectService = require("./facultySubjectService");
const { getIO } = require("../socket/socket");

// Session start/end/reopen changes what every other open page should
// be showing (Attendance's "is there an active session" banner,
// Reports' list of ended sessions, Dashboard's active-session widget
// and stats). Rather than each page silently going stale until the
// user manually refreshes, broadcast a lightweight event they can all
// listen for and reload on - reuses the same Socket.IO connection
// attendanceService already opened, no new infrastructure.
const broadcastSessionUpdate = (session) => {

    try {

        getIO().emit("sessionUpdated", {

            id: session._id,

            status: session.status

        });

    } catch (err) {

        console.log("Socket not initialized.");

    }

};

const createSession = async (data, requestingUser = null) => {

    // Faculty must be assigned to a subject before they can create a
    // session for it. Admins bypass this (they can schedule for anyone).
    // requestingUser is optional so this stays backward compatible with
    // any internal/script callers that don't have a request context.
    if (requestingUser) {
        await facultySubjectService.assertFacultyCanAccessSubject(
            requestingUser,
            data.subject
        );
    }

    const session = await AttendanceSession.create(data);

    return await AttendanceSession.findById(session._id)
        .populate("subject");

};

const getSessions = async () => {

    return await AttendanceSession.find()
        .populate("subject");

};

const updateSession = async (id, data) => {

    return await AttendanceSession.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

};

const deleteSession = async (id) => {

    return await AttendanceSession.findByIdAndDelete(id);

};

const startSession = async (id, requestingUser = null) => {

    const targetSession = await AttendanceSession.findById(id);

    if (!targetSession) {
        throw new Error("Session not found");
    }

    // Same enforcement as createSession - admins bypass, faculty must
    // be assigned to the session's subject. This closes the gap where
    // a faculty member could start someone else's scheduled session
    // just because session creation itself is admin-only.
    if (requestingUser) {
        await facultySubjectService.assertFacultyCanAccessSubject(
            requestingUser,
            targetSession.subject
        );
    }

    // End any currently active sessions
    await AttendanceSession.updateMany(
        {
            status: "ACTIVE"
        },
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
    );

    const existingSession = targetSession;

    // Expected Students = everyone actively enrolled in this subject
    const enrolledStudentIds = await enrollmentService.getEnrolledStudentIds(
        existingSession.subject
    );

    // Start selected session
    const session = await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ACTIVE",
            startTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            }),
            endTime: null,
            expectedStudents: enrolledStudentIds.length,
            presentStudents: 0,
            absentStudents: 0
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

    if (!session) {
        throw new Error("Session not found");
    }

    broadcastSessionUpdate(session);

    return session;

};

const completeSession = async (id) => {

    const existingSession = await AttendanceSession.findById(id);

    if (!existingSession) {
        throw new Error("Session not found");
    }

    // Everyone enrolled in this subject was "expected"
    const enrolledStudentIds = await enrollmentService.getEnrolledStudentIds(
        existingSession.subject
    );

    // Everyone already marked (by face recognition) during the session
    const presentRecords = await Attendance.find({
        session: id,
        status: "Present"
    });

    const presentStudentIds = new Set(
        presentRecords.map((r) => r.student.toString())
    );

    // Whoever is enrolled but was never marked present -> Absent
    const absentStudentIds = enrolledStudentIds.filter(
        (studentId) => !presentStudentIds.has(studentId)
    );

    if (absentStudentIds.length) {

        const absentRecords = absentStudentIds.map((studentId) => ({
            student: studentId,
            session: id,
            status: "Absent"
        }));

        try {
            // ordered:false so one duplicate doesn't block the rest
            await Attendance.insertMany(absentRecords, { ordered: false });
        } catch (err) {
            // Duplicate key errors are expected if a student was already
            // marked in a race condition; anything else should surface.
            if (err.code !== 11000 && !err.writeErrors) {
                throw err;
            }
        }

    }

    const session = await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            }),
            expectedStudents: enrolledStudentIds.length,
            presentStudents: presentStudentIds.size,
            absentStudents: absentStudentIds.length
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

    if (!session) {
        throw new Error("Session not found");
    }

    broadcastSessionUpdate(session);

    return session;

};

// ======================================================
// Reopen an ended session (admin only - enforced at the
// route/controller level via authorize("admin")).
// Simply moves status back to ACTIVE - three states total
// (SCHEDULED/ACTIVE/ENDED), no separate locked concept.
// Does not touch presence/absence counts; a follow-up call
// to completeSession will recompute them once corrections
// are made and the faculty/admin ends the session again.
// ======================================================

const reopenSession = async (id) => {

    // Same invariant as startSession: only one ACTIVE session at a
    // time. Reopening now moves a session to ACTIVE, so it needs the
    // same guard or you could end up with two sessions active
    // simultaneously.
    await AttendanceSession.updateMany(
        {
            status: "ACTIVE",
            _id: { $ne: id }
        },
        {
            status: "ENDED",
            endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
    );

    const session = await AttendanceSession.findByIdAndUpdate(
        id,
        {
            status: "ACTIVE"
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("subject");

    if (!session) {
        throw new Error("Session not found");
    }

    broadcastSessionUpdate(session);

    return session;

};

module.exports = {
    createSession,
    getSessions,
    updateSession,
    deleteSession,
    startSession,
    completeSession,
    reopenSession
};