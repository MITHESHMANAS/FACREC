import api from "./api";

export const downloadPdfReport = async (sessionId = null) => {

    const response = await api.get(
        "/reports/pdf",
        {
            responseType: "blob",
            params: sessionId ? { sessionId } : {}
        }
    );

    const blob = new Blob(
        [response.data],
        {
            type: "application/pdf"
        }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Attendance_Report.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

};

export const downloadExcelReport = async (sessionId = null) => {

    const response = await api.get(
        "/reports/excel",
        {
            responseType: "blob",
            params: sessionId ? { sessionId } : {}
        }
    );

    const blob = new Blob([response.data]);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Attendance_Report.xlsx";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

};
