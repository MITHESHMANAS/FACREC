/**
 * FACREC orphan cleanup script.
 *
 * Deleting a Student now cascades to Enrollment/Attendance/
 * RecognitionLog (see server/src/services/studentService.js), but
 * that fix only prevents *new* orphans. Anything deleted before that
 * fix existed left behind Enrollment/Attendance/RecognitionLog
 * documents whose `student` (or `subject`) ObjectId no longer
 * resolves to anything - those render as blank rows in the UI.
 *
 * This script finds and removes exactly those orphaned documents.
 * It only deletes records whose referenced Student/Subject is
 * actually gone - it never touches records that still resolve
 * correctly, so it's safe to run at any time, repeatedly.
 *
 * Usage: npm run cleanup-orphans   (from server/)
 */

require("dotenv").config();

const path = require("path");
const mongoose = require("mongoose");

const Student = require(path.join(__dirname, "..", "src", "models", "Student"));
const Subject = require(path.join(__dirname, "..", "src", "models", "Subject"));
const Enrollment = require(path.join(__dirname, "..", "src", "models", "Enrollment"));
const Attendance = require(path.join(__dirname, "..", "src", "models", "Attendance"));
const RecognitionLog = require(path.join(__dirname, "..", "src", "models", "RecognitionLog"));

const log = (label) => console.log(`✔ ${label}`);

async function findOrphanedIds(Model, field, existingIds) {

    const docs = await Model.find({}, { [field]: 1 });

    const existingSet = new Set(existingIds.map((id) => id.toString()));

    return docs
        .filter((doc) => {

            const ref = doc[field];

            // RecognitionLog.student is nullable by design (unknown
            // faces) - a null student there is correct, not an orphan.
            if (!ref) return false;

            return !existingSet.has(ref.toString());

        })
        .map((doc) => doc._id);

}

async function run() {

    if (!process.env.MONGODB_URI) {
        console.error(
            "MONGODB_URI is not set. Add it to server/.env before running this."
        );
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    log("Connected to MongoDB");

    const studentIds = await Student.find({}, { _id: 1 }).then(
        (docs) => docs.map((d) => d._id)
    );

    const subjectIds = await Subject.find({}, { _id: 1 }).then(
        (docs) => docs.map((d) => d._id)
    );

    // Enrollment: orphaned if either side is gone
    const orphanedEnrollmentsByStudent = await findOrphanedIds(
        Enrollment, "student", studentIds
    );

    const orphanedEnrollmentsBySubject = await findOrphanedIds(
        Enrollment, "subject", subjectIds
    );

    const orphanedEnrollmentIds = [
        ...new Set([
            ...orphanedEnrollmentsByStudent.map(String),
            ...orphanedEnrollmentsBySubject.map(String)
        ])
    ];

    const enrollmentResult = await Enrollment.deleteMany({
        _id: { $in: orphanedEnrollmentIds }
    });

    log(`Removed ${enrollmentResult.deletedCount} orphaned Enrollment record(s)`);

    // Attendance: orphaned if the student is gone
    const orphanedAttendanceIds = await findOrphanedIds(
        Attendance, "student", studentIds
    );

    const attendanceResult = await Attendance.deleteMany({
        _id: { $in: orphanedAttendanceIds }
    });

    log(`Removed ${attendanceResult.deletedCount} orphaned Attendance record(s)`);

    // RecognitionLog: orphaned only if student is set but doesn't
    // resolve. A null student (unknown face) is intentional, not
    // touched here.
    const orphanedLogIds = await findOrphanedIds(
        RecognitionLog, "student", studentIds
    );

    const logResult = await RecognitionLog.deleteMany({
        _id: { $in: orphanedLogIds }
    });

    log(`Removed ${logResult.deletedCount} orphaned RecognitionLog record(s)`);

    log("Cleanup complete");

    await mongoose.disconnect();

    process.exit(0);

}

run().catch((err) => {

    console.error("Cleanup failed:", err.message);

    process.exit(1);

});
