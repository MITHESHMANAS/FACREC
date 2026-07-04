const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes=require("./routes/subjectRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes=require("./routes/attendanceRoutes");
const facultyRoutes=require("./routes/facultyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

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
module.exports = app;

