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
const CARD_BG = "#f1f5f9";
const ACCENT = "#0891b2";

const PAGE_X = 45;
const PAGE_WIDTH = 510;

// ==========================================================
// Report ID
// ==========================================================

function generateReportId() {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(100 + Math.random() * 900);
    return `FACREC-${datePart}-${rand}`;
}

// ==========================================================
// Header / Title / Metadata
// ==========================================================

function drawTitle(doc) {
    doc
        .fillColor(PRIMARY)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("FACREC ENTERPRISE", { align: "center" });

    doc
        .moveDown(0.2)
        .fillColor(DARK)
        .font("Helvetica")
        .fontSize(11)
        .text("Face Recognition Attendance Management System", { align: "center" });

    doc.moveDown(0.4);

    doc
        .strokeColor(PRIMARY)
        .lineWidth(2)
        .moveTo(PAGE_X, doc.y)
        .lineTo(PAGE_X + PAGE_WIDTH, doc.y)
        .stroke();

    doc.moveDown(0.8);
}

function drawReportMeta(doc, reportId) {
    const y = doc.y;
    const metaX = 340;
    const metaWidth = 215;

    doc.fillColor(LIGHT).font("Helvetica-Bold").fontSize(8.5)
        .text("REPORT ID", metaX, y, { width: metaWidth, align: "right" });

    doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10)
        .text(reportId, metaX, y + 11, { width: metaWidth, align: "right" });

    doc.fillColor(LIGHT).font("Helvetica-Bold").fontSize(8.5)
        .text("GENERATED", metaX, y + 27, { width: metaWidth, align: "right" });

    doc.fillColor(DARK).font("Helvetica").fontSize(9.5)
        .text(new Date().toLocaleString(), metaX, y + 39, { width: metaWidth, align: "right" });

    doc.y = y + 58;
}

function sectionTitle(doc, title) {
    doc
        .fillColor(PRIMARY)
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(title);

    doc.moveDown(0.4);
}

// ==========================================================
// Session Card
// ==========================================================

function drawSessionCard(doc, session) {
    sectionTitle(doc, "Session Details");

    const rows = [
        ["Subject", session.subject?.name || "-"],
        ["Faculty", session.faculty || "-"],
        ["Branch", session.branch || "-"],
        ["Semester", String(session.semester ?? "-")],
        ["Date", session.date || "-"]
    ];

    const rowHeight = 21;
    const paddingTop = 14;
    const height = rows.length * rowHeight + paddingTop;
    const y = doc.y;

    doc.roundedRect(PAGE_X, y, PAGE_WIDTH, height, 8).fillColor(CARD_BG).fill();
    doc.roundedRect(PAGE_X, y, PAGE_WIDTH, height, 8).lineWidth(1).strokeColor(BORDER).stroke();

    let rowY = y + paddingTop - 2;

    rows.forEach(([label, value]) => {
        doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10)
            .text(label, PAGE_X + 25, rowY, { width: 110 });

        doc.fillColor(DARK).font("Helvetica").fontSize(10)
            .text(value, PAGE_X + 150, rowY, { width: PAGE_WIDTH - 175 });

        rowY += rowHeight;
    });

    doc.y = y + height + 18;
}

// ==========================================================
// Attendance Table (bordered grid, centered text, status pills)
// ==========================================================

function drawAttendanceTable(doc, attendance) {
    const cols = [
        { label: "Roll", width: 50 },
        { label: "Student", width: 140 },
        { label: "Email", width: 210 },
        { label: "Status", width: 110 }
    ];

    const rowHeight = 30;
    const headerHeight = 30;
    const bottomLimit = 700;

    let y = doc.y + 6;
    let segmentStart = y;

    drawHeaderRow(y);
    y += headerHeight;

    attendance.forEach((record, idx) => {
        if (y + rowHeight > bottomLimit) {
            drawGrid(segmentStart, y);
            doc.addPage();
            y = 60;
            segmentStart = y;
            drawHeaderRow(y);
            y += headerHeight;
        }

        if (idx % 2 === 0) {
            doc.fillColor("#f8fafc").rect(PAGE_X, y, PAGE_WIDTH, rowHeight).fill();
        }

        drawRow(record, y);
        y += rowHeight;
    });

    drawGrid(segmentStart, y);
    doc.y = y + 15;

    function drawHeaderRow(yPos) {
        doc.fillColor(PRIMARY).rect(PAGE_X, yPos, PAGE_WIDTH, headerHeight).fill();
        doc.fillColor("white").font("Helvetica-Bold").fontSize(9.5);

        let x = PAGE_X;
        cols.forEach(col => {
            doc.text(col.label, x, yPos + 11, { width: col.width, align: "center" });
            x += col.width;
        });
    }

    function drawRow(record, yPos) {
        let x = PAGE_X;
        const textY = yPos + 10;

        doc.fillColor(DARK).font("Helvetica").fontSize(9.5);

        doc.text(record.student?.rollNo || "-", x, textY, { width: cols[0].width, align: "center" });
        x += cols[0].width;

        doc.text(record.student?.name || "-", x, textY, { width: cols[1].width, align: "center" });
        x += cols[1].width;

        doc.text(record.student?.email || "-", x, textY, { width: cols[2].width, align: "center" });
        x += cols[2].width;

        const isPresent = record.status === "Present";
        const pillWidth = 74;
        const pillHeight = 16;
        const pillX = x + (cols[3].width - pillWidth) / 2;
        const pillY = yPos + (rowHeight - pillHeight) / 2;

        doc.fillColor(isPresent ? SUCCESS : DANGER)
            .roundedRect(pillX, pillY, pillWidth, pillHeight, 8)
            .fill();

        doc.fillColor("white").font("Helvetica-Bold").fontSize(8)
            .text(isPresent ? "PRESENT" : "ABSENT", pillX, pillY + 4, { width: pillWidth, align: "center" });
    }

    function drawGrid(top, bottom) {
        doc.strokeColor(BORDER).lineWidth(0.5);
        doc.rect(PAGE_X, top, PAGE_WIDTH, bottom - top).stroke();

        let x = PAGE_X;
        cols.forEach((col, i) => {
            if (i > 0) {
                doc.moveTo(x, top).lineTo(x, bottom).stroke();
            }
            x += col.width;
        });
    }
}

// ==========================================================
// Summary Cards
// ==========================================================

function drawSummaryCards(doc, attendance) {
    const total = attendance.length;
    const present = attendance.filter(r => r.status === "Present").length;
    const absent = total - present;
    const pct = total === 0 ? 0 : ((present / total) * 100).toFixed(1);

    if (doc.y > 640) {
        doc.addPage();
    }

    doc.moveDown(0.5);
    sectionTitle(doc, "Summary");

    const cards = [
        { label: "TOTAL", value: String(total), color: PRIMARY },
        { label: "PRESENT", value: String(present), color: SUCCESS },
        { label: "ABSENT", value: String(absent), color: DANGER },
        { label: "ATTENDANCE %", value: `${pct}%`, color: ACCENT }
    ];

    const cardWidth = 118;
    const gap = 12;
    const y = doc.y;
    const cardHeight = 65;

    cards.forEach((card, i) => {
        const x = PAGE_X + i * (cardWidth + gap);

        doc.fillOpacity(0.1).fillColor(card.color)
            .roundedRect(x, y, cardWidth, cardHeight, 6).fill();

        doc.fillOpacity(1)
            .roundedRect(x, y, cardWidth, cardHeight, 6)
            .lineWidth(1).strokeColor(card.color).stroke();

        doc.fillColor(card.color).font("Helvetica-Bold").fontSize(8.5)
            .text(card.label, x, y + 12, { width: cardWidth, align: "center" });

        doc.fillColor(DARK).font("Helvetica-Bold").fontSize(19)
            .text(card.value, x, y + 30, { width: cardWidth, align: "center" });
    });

    doc.y = y + cardHeight + 22;
}

// ==========================================================
// Signature Area
// ==========================================================

function drawSignatureArea(doc) {
    if (doc.y > 690) {
        doc.addPage();
        doc.y = 60;
    }

    doc.moveDown(1);
    const y = doc.y;

    doc.fillColor(DARK).font("Helvetica").fontSize(10);
    doc.text("Faculty Signature", PAGE_X, y);
    doc.text("HOD Signature", 340, y);

    doc.strokeColor(BORDER).lineWidth(1);
    doc.moveTo(PAGE_X, y + 28).lineTo(PAGE_X + 175, y + 28).stroke();
    doc.moveTo(340, y + 28).lineTo(340 + 175, y + 28).stroke();

    doc.y = y + 45;
}

// ==========================================================
// Footer
// ==========================================================

function drawFooter(doc) {
    const range = doc.bufferedPageRange();

    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);

        doc.strokeColor(BORDER).lineWidth(0.5)
            .moveTo(PAGE_X, 750).lineTo(PAGE_X + PAGE_WIDTH, 750).stroke();

        doc.fillColor(LIGHT).font("Helvetica").fontSize(8);

        doc.text(
            "Generated by FACREC Enterprise  \u2022  SVNIT Surat  \u2022  Confidential",
            PAGE_X,
            758,
            { width: PAGE_WIDTH, align: "center" }
        );

        doc.text(
            `Page ${i + 1} of ${range.count}`,
            PAGE_X,
            770,
            { width: PAGE_WIDTH, align: "center" }
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
            const reportId = generateReportId();

            const doc = new PDFDocument({
                margin: 45,
                size: "A4",
                bufferPages: true
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            drawTitle(doc);
            drawReportMeta(doc, reportId);
            drawSessionCard(doc, session);

            sectionTitle(doc, "Attendance Records");
            drawAttendanceTable(doc, attendance);

            drawSummaryCards(doc, attendance);
            drawSignatureArea(doc);

            drawFooter(doc);
            doc.end();

            stream.on("finish", () => {
                resolve({ success: true, fileName, filePath, reportId });
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