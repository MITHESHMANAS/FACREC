import api from "./api";

// PDF Report for specific session
export const downloadPdfReport = async (sessionId = null) => {
    const response = await api.get("/reports/pdf", {
        responseType: "blob",
        params: sessionId ? { sessionId } : {}
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Attendance_Report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Excel Report for specific session
export const downloadExcelReport = async (sessionId = null) => {
    const response = await api.get("/reports/excel", {
        responseType: "blob",
        params: sessionId ? { sessionId } : {}
    });

    const blob = new Blob([response.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Attendance_Report.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// NEW: PDF Report for students below 75% attendance
export const downloadShortageReport = async () => {
    try {
        const response = await api.get("/reports/shortage", {
            responseType: "blob"
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Shortage_Report.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Shortage Report Error:", error);
        throw error; // Re-throw to handle it in the UI toast
    }
};