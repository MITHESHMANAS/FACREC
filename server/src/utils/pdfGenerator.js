const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORTS_DIR = path.join(__dirname, "../../reports");

if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const PRIMARY = "#2563eb";
const SUCCESS = "#16a34a";
const DANGER = "#dc2626";
const DARK = "#1e293b";
const LIGHT = "#64748b";
const BORDER = "#cbd5e1";

// ==========================================================
// Header / Title
// ==========================================================

function drawTitle(doc) {
    doc
        .fillColor(PRIMARY)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("FACREC ENTERPRISE", { align: "center" });

    doc
        .moveDown(0.2)
        .fillColor(DARK)
        .font("Helvetica")
        .fontSize(12)
        .text("Face Recognition Attendance Management System", { align: "center" });

    doc.moveDown(0.5);

    doc
        .strokeColor(PRIMARY)
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

    doc.moveDown(1);
}

function sectionTitle(doc, title) {
    doc
        .fillColor(PRIMARY)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(title);

    doc.moveDown(0.5);
}

function labelValue(doc, label, value) {
    doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`${label}: `, { continued: true });

    doc.font("Helvetica").text(value);
}

function drawSessionInfo(doc, session) {
    sectionTitle(doc, "Session Information");

    labelValue(doc, "Subject", session.subject?.name || "-");
    labelValue(doc, "Faculty", session.faculty || "-");
    labelValue(doc, "Semester", String(session.semester ?? "-"));
    labelValue(doc, "Branch", session.branch || "-");
    labelValue(doc, "Date", session.date || "-");
    labelValue(doc, "Generated", new Date().toLocaleString());

    doc.moveDown();
}

// ==========================================================
// Attendance Table
// ==========================================================

function drawTableHeader(doc, y) {
    doc.fillColor(PRIMARY).rect(45, y, 510, 25).fill();

    doc.fillColor("white").font("Helvetica-Bold").fontSize(10);

    doc.text("Roll", 55, y + 8, { width: 45 });
    doc.text("Student", 105, y + 8, { width: 110 });
    doc.text("Email", 215, y + 8, { width: 170 });
    doc.text("Status", 395, y + 8, { width: 70 });
    doc.text("Time", 470, y + 8, { width: 70 });
}

function drawAttendanceRows(doc, attendance) {
    let y = doc.y + 5;

    drawTableHeader(doc, y);
    y += 30;

    attendance.forEach((record, index) => {
        // Page break check — leave room for a row before the footer zone
        if (y > 720) {
            doc.addPage();
            drawTitle(doc);
            drawTableHeader(doc, 90);
            y = 120;
        }

        if (index % 2 === 0) {
            doc.fillColor("#f8fafc").rect(45, y - 5, 510, 25).fill();
        }

        doc.fillColor(DARK).font("Helvetica").fontSize(10);

        doc.text(record.student?.rollNo || "-", 55, y, { width: 45 });
        doc.text(record.student?.name || "-", 105, y, { width: 100 });
        doc.text(record.student?.email || "-", 215, y, { width: 170 });

        doc.fillColor(record.status === "Present" ? SUCCESS : DANGER);
        doc.font("Helvetica-Bold");
        doc.text(record.status, 395, y, { width: 70 });

        doc.fillColor(DARK).font("Helvetica");
        doc.text(
            record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : "--",
            470,
            y,
            { width: 70 }
        );

        doc.strokeColor(BORDER);
        doc.moveTo(45, y + 20).lineTo(555, y + 20).stroke();

        y += 25;
    });

    doc.y = y;
    doc.moveDown(2);
}

// ==========================================================
// Summary
// ==========================================================

function drawSummary(doc, attendance) {
    const total = attendance.length;
    const present = attendance.filter(r => r.status === "Present").length;
    const absent = total - present;
    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    // Ensure the summary box (needs ~150px) fits on the current page
    if (doc.y > 620) {
        doc.addPage();
        drawTitle(doc);
    }

    doc.moveDown();
    sectionTitle(doc, "Attendance Summary");

    const boxY = doc.y;

    doc
        .roundedRect(45, boxY, 510, 110, 8)
        .lineWidth(1)
        .strokeColor(BORDER)
        .stroke();

    doc.font("Helvetica-Bold").fontSize(12).fillColor(DARK);
    doc.text(`Total Students : ${total}`, 70, boxY + 20);

    doc.fillColor(SUCCESS).text(`Present : ${present}`, 70, boxY + 45);
    doc.fillColor(DANGER).text(`Absent : ${absent}`, 70, boxY + 70);

    doc
        .fillColor(PRIMARY)
        .fontSize(16)
        .text(`${percentage}%`, 420, boxY + 40, { width: 100, align: "center" });

    doc
        .fillColor(LIGHT)
        .fontSize(10)
        .text("Attendance Percentage", 395, boxY + 70, { width: 150, align: "center" });

    doc.y = boxY + 130;
}

// ==========================================================
// Footer
// ==========================================================

function drawFooter(doc) {
    const range = doc.bufferedPageRange();

    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);

        doc.font("Helvetica").fontSize(9).fillColor(LIGHT);

        doc.text(
            "Generated by FACREC Enterprise \u2022 SVNIT Surat",
            50,
            770,
            { width: 500, align: "center" }
        );

        doc.text(
            `Page ${i + 1} of ${range.count}`,
            50,
            785,
            { width: 500, align: "center" }
        );
    }
}

// ==========================================================
// Main export
// ==========================================================

const generateAttendancePDF = (session, attendance) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `Attendance_${Date.now()}.pdf`;
            const filePath = path.join(REPORTS_DIR, fileName);

            const doc = new PDFDocument({
                margin: 45,
                size: "A4",
                bufferPages: true
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            drawTitle(doc);
            drawSessionInfo(doc, session);

            sectionTitle(doc, "Attendance Records");
            drawAttendanceRows(doc, attendance);

            drawSummary(doc, attendance);
            drawFooter(doc);

            doc.end();

            stream.on("finish", () => {
                resolve({ success: true, fileName, filePath });
            });

            stream.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    generateAttendancePDF
};