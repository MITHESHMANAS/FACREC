import api from "./api";

// Save a blob under a meaningful file name.
const saveBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// PDF Report for specific session
export const downloadPdfReport = async (sessionId = null, filename = "Attendance_Report.pdf") => {
    const response = await api.get("/reports/pdf", {
        responseType: "blob",
        params: sessionId ? { sessionId } : {}
    });

    saveBlob(new Blob([response.data], { type: "application/pdf" }), filename);
};

// Excel Report for specific session
export const downloadExcelReport = async (sessionId = null, filename = "Attendance_Report.xlsx") => {
    const response = await api.get("/reports/excel", {
        responseType: "blob",
        params: sessionId ? { sessionId } : {}
    });

    saveBlob(
        new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }),
        filename
    );
};

// PDF Report for students below 75% attendance
export const downloadShortageReport = async () => {
    try {
        const response = await api.get("/reports/shortage", {
            responseType: "blob"
        });

        saveBlob(new Blob([response.data], { type: "application/pdf" }), "Shortage_Report.pdf");
    } catch (error) {
        console.error("Shortage Report Error:", error);
        throw error; // Re-throw to handle it in the UI toast
    }
};