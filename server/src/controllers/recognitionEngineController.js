const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const recognitionEngineService = require(
    "../services/recognitionEngineService"
);
const attendanceService = require(
    "../services/attendanceService"
);
const recognitionLogService = require(
    "../services/recognitionLogService"
);
const Student = require(
    "../models/Student"
);
const AttendanceSession = require(
    "../models/AttendanceSession"
);

const startRecognition = async (req, res) => {
    const startTime = Date.now();

    try {
        const result = await recognitionEngineService.startRecognition();

        // ---------------------------------------------
        // Nothing recognized
        // ---------------------------------------------
        if (!result.recognized || result.recognized.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No face recognized.",
                executionTime: `${Date.now() - startTime} ms`,
                timestamp: new Date(),
                recognized: [],
                total: 0
            });
        }

        const attendanceResults = [];
        const recognitionLogs = [];

        // ---------------------------------------------
        // Active Session (Latest Active Session Safeguard)
        // ---------------------------------------------
        const activeSession = await AttendanceSession.findOne({
            status: "ACTIVE"
        }).sort({ createdAt: -1 }).populate("subject");

        if (!activeSession) {
            return res.status(400).json({
                success: false,
                message: "No active attendance session."
            });
        }

        // ---------------------------------------------
        // Process each recognized student
        // ---------------------------------------------
        for (const face of result.recognized) {
            // face_recognition.py only knows the roll number (the
            // .npy filename) - it never talks to a database. Match
            // against faceDatasetId first, falling back to rollNo for
            // students registered before faceDatasetId existed.
            const student = await Student.findOne({
                $or: [
                    { faceDatasetId: face.roll_no },
                    { rollNo: face.roll_no }
                ],
                isActive: true
            });

            const displayName = student ? student.name : face.roll_no;

            // Safe database logging boundary
            try {
                await recognitionLogService.createLog({
                    student: student ? student._id : null,
                    session: activeSession ? activeSession._id : null,
                    recognizedName: displayName,
                    confidence: face.confidence,
                    subject: activeSession.subject?.name || "Unknown",
                    camera: "Camera 1",
                    status: student ? "RECOGNIZED" : "UNKNOWN",
                    snapshot: face.snapshot || null,
                    durationMs: face.duration_ms ?? null,
                    boundingBox: face.bounding_box ? {
                        x: face.bounding_box.x,
                        y: face.bounding_box.y,
                        width: face.bounding_box.width,
                        height: face.bounding_box.height,
                        frameWidth: face.bounding_box.frame_width,
                        frameHeight: face.bounding_box.frame_height
                    } : undefined
                });
            } catch (err) {
                console.error("Recognition Log Error:", err.message);
            }

            // Track localized logs for the runtime payload array
            recognitionLogs.push({
                name: displayName,
                confidence: face.confidence,
                subject: activeSession.subject?.name || "Unknown",
                status: student ? "RECOGNIZED" : "UNKNOWN"
            });

            if (!student) {
                attendanceResults.push({
                    student: face.roll_no,
                    status: "Student Not Found"
                });
                continue;
            }

            try {
                const attendance = await attendanceService.markAttendance({
                    student: student._id,
                    session: activeSession._id,
                    status: "Present"
                });

                attendanceResults.push({
                    student: student.name,
                    status: "Attendance Marked",
                    attendance
                });
            } catch (err) {
                attendanceResults.push({
                    student: student.name,
                    status: err.message
                });
            }
        }

        // Enhanced telemetry payload mapping
        return res.status(200).json({
            success: true,
            message: "Recognition completed successfully.",
            executionTime: `${Date.now() - startTime} ms`,
            timestamp: new Date(),
            recognized: result.recognized,
            attendance: attendanceResults,
            recognitionLogs,
            recognitionLogCount: recognitionLogs.length,
            total: result.total
        });

    } catch (err) {
        console.error("Recognition Engine Error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message,
            executionTime: `${Date.now() - startTime} ms`
        });
    }
};

const healthCheck = (req, res) => {

    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const mongoConnected = mongoose.connection.readyState === 1;

    const projectRoot = path.join(__dirname, "..", "..", "..");

    const cascadeExists = fs.existsSync(
        path.join(projectRoot, "haarcascade_frontalface_alt.xml")
    );

    const recognitionScriptExists = fs.existsSync(
        path.join(projectRoot, "face_recognition.py")
    );

    const datasetDir = path.join(projectRoot, "face_dataset");

    const datasetCount = fs.existsSync(datasetDir)
        ? fs.readdirSync(datasetDir).filter((f) => f.endsWith(".npy")).length
        : 0;

    // This confirms the vision module's *files* are in place, not that
    // a camera is physically connected - actually opening the webcam
    // just to answer a status poll would be invasive and could
    // interfere with a recognition pass in progress, so "ready" here
    // means "the pipeline would run if you clicked Start", not
    // "hardware confirmed present".
    const visionReady = cascadeExists && recognitionScriptExists && datasetCount > 0;

    res.json({
        success: true,
        service: "FACREC Recognition Engine",
        status: visionReady && mongoConnected ? "ONLINE" : "DEGRADED",
        mongodb: mongoConnected ? "CONNECTED" : "DISCONNECTED",
        visionModule: visionReady ? "READY" : "NOT READY",
        registeredFaces: datasetCount,
        timestamp: new Date()
    });
};

module.exports = {
    startRecognition,
    healthCheck
};