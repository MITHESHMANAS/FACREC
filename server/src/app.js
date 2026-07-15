const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes=require("./routes/subjectRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes=require("./routes/attendanceRoutes");
const facultyRoutes=require("./routes/facultyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();
const studentProfileRoutes =require("./routes/studentProfileRoutes");
const recognitionEngineRoutes =
require("./routes/recognitionEngineRoutes");
const recognitionLogRoutes = require(
    "./routes/recognitionLogRoutes"
);
const dashboardAnalyticsRoutes = require(
    "./routes/dashboardAnalyticsRoutes"
);
const enrollmentRoutes = require(
    "./routes/enrollmentRoutes"
);
const facultySubjectRoutes = require(
    "./routes/facultySubjectRoutes"
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    
    res.json({
        project: "FACREC Enterprise",
        version: "1.0.0",
        status: "Running"
    });
    
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects",subjectRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/faculty",facultyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use(

    "/api/reports",

    reportRoutes

);
app.use(
    "/api/student-profile",
    studentProfileRoutes
);
app.use(
    "/api/engine",
    recognitionEngineRoutes
);
app.use(

    "/api/recognitions",

    recognitionLogRoutes

);
app.use(

    "/api/dashboard",

    dashboardAnalyticsRoutes

);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/faculty-subjects", facultySubjectRoutes);

// ==========================================================
// Global error handler
// ==========================================================
// Route handlers here mostly try/catch their own service calls
// already, but a handful of edge cases still bubble up raw
// Mongoose errors (a malformed :id in a URL throws a CastError,
// a bad request body throws a ValidationError). Left unhandled
// those crash out as an opaque 500 with a stack-trace message.
// This turns the common ones into clean, predictable 400s instead.
app.use((err, req, res, next) => {

    if (res.headersSent) {
        return next(err);
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: '${err.value}'.`
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors)
                .map((e) => e.message)
                .join(" ")
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "A record with that value already exists."
        });
    }

    console.error("Unhandled error:", err);

    return res.status(500).json({
        success: false,
        message: "Something went wrong on the server."
    });

});

module.exports = app;

