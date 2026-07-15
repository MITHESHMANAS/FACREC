import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
    FaCalendarCheck, FaUserCheck, FaUserTimes, 
    FaFilePdf, FaFileExcel, FaListAlt, FaExclamationTriangle 
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import KpiCard from "../components/ui/KpiCard";
import TableSkeleton from "../components/ui/TableSkeleton";
import EmptyState from "../components/ui/EmptyState";
import { 
    downloadPdfReport, 
    downloadExcelReport,
    downloadShortageReport 
} from "../services/reportService";
import { getSessions } from "../services/sessionService";
import useAttendanceSocket from "../hooks/useAttendanceSocket";

/* ---------------------------------------------------------
   Professional Primitives
--------------------------------------------------------- */

const SectionHeading = ({ children }) => (
    <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-5">{children}</h2>
);

const Reports = () => {
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [downloadingKey, setDownloadingKey] = useState(null);

    const loadSessions = async () => {
        try {
            const data = await getSessions();
            const sessionList = data?.sessions || [];
            const sorted = [...sessionList].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setSessions(sorted);
        } catch (err) {
            toast.error("Unable to load sessions");
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => { loadSessions(); }, []);
    useAttendanceSocket(null, () => { loadSessions(); });

    const handleDownload = async (session, format) => {
        const key = `${session._id}-${format}`;
        try {
            setDownloadingKey(key);
            if (format === "pdf") await downloadPdfReport(session._id);
            else await downloadExcelReport(session._id);
            toast.success(`${format.toUpperCase()} downloaded`);
        } catch (err) {
            toast.error(`Unable to generate ${format.toUpperCase()}`);
        } finally {
            setDownloadingKey(null);
        }
    };

    // Logic for Shortage Report
    const handleDownloadShortage = async () => {
        try {
            setDownloadingKey("shortage");
            await downloadShortageReport();
            toast.success("Shortage report downloaded successfully");
        } catch (err) {
            toast.error("Failed to generate shortage report");
        } finally {
            setDownloadingKey(null);
        }
    };

    const endedSessions = Array.isArray(sessions) ? sessions.filter((s) => s?.status === "ENDED") : [];
    const activeSession = Array.isArray(sessions) ? sessions.find((s) => s?.status === "ACTIVE") : null;

    const totalPresent = endedSessions.reduce((sum, s) => sum + (s?.presentStudents || 0), 0);
    const totalAbsent = endedSessions.reduce((sum, s) => sum + (s?.absentStudents || 0), 0);

    return (
        <AppLayout>
            <div className="flex flex-col gap-y-8 p-1">
                
                {/* Header with Shortage Report Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                        <p className="text-sm text-slate-500 mt-1">Download attendance reports for any session.</p>
                    </div>
                    <button 
                        onClick={handleDownloadShortage}
                        disabled={downloadingKey === "shortage"}
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold uppercase text-red-600 transition disabled:opacity-50"
                    >
                        <FaExclamationTriangle /> {downloadingKey === "shortage" ? "Generating..." : "Shortage Report (<75%)"}
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Completed Sessions" value={endedSessions.length} icon={FaCalendarCheck} tone="indigo" />
                    <KpiCard title="Total Present" value={totalPresent} icon={FaUserCheck} tone="emerald" />
                    <KpiCard title="Total Absent" value={totalAbsent} icon={FaUserTimes} tone="red" />
                </div>

                {/* Active Session Alert */}
                {activeSession && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">Active Session</p>
                        <h2 className="text-lg font-bold text-slate-900 mt-1">{activeSession.subject?.name || "Unknown"}</h2>
                    </div>
                )}

                {/* Completed Sessions Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <FaListAlt className="text-indigo-600" />
                        <SectionHeading>Completed Sessions</SectionHeading>
                    </div>

                    {loadingSessions ? (
                        <TableSkeleton rows={4} columns={6} />
                    ) : endedSessions.length === 0 ? (
                        <EmptyState icon={FaCalendarCheck} title="No sessions yet" message="Reports appear after sessions end." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-[11px] uppercase text-slate-400 tracking-wider bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Subject</th>
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold text-right">Expected</th>
                                        <th className="px-6 py-4 font-bold text-right">Present</th>
                                        <th className="px-6 py-4 font-bold text-right">Absent</th>
                                        <th className="px-6 py-4 font-bold text-right">Attendance %</th>
                                        <th className="px-6 py-4 font-bold text-center">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {endedSessions.map((s) => {
                                        const expected = s.expectedStudents || 0;
                                        const present = s.presentStudents || 0;
                                        const pct = expected > 0 ? ((present / expected) * 100).toFixed(1) : "0.0";
                                        
                                        return (
                                            <tr key={s._id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-semibold text-slate-900">{s.subject?.name || "—"}</td>
                                                <td className="px-6 py-4 text-slate-600">{s.date || "—"}</td>
                                                <td className="px-6 py-4 text-right text-slate-600">{expected}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-emerald-600">{present}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-red-600">{s.absentStudents || 0}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-800">{pct}%</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 justify-center">
                                                        <button 
                                                            onClick={() => handleDownload(s, "pdf")}
                                                            disabled={downloadingKey === `${s._id}-pdf`}
                                                            className="text-red-500 hover:text-red-700 p-2 transition disabled:opacity-50"
                                                            title="PDF"
                                                        >
                                                            <FaFilePdf size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(s, "excel")}
                                                            disabled={downloadingKey === `${s._id}-excel`}
                                                            className="text-emerald-600 hover:text-emerald-800 p-2 transition disabled:opacity-50"
                                                            title="Excel"
                                                        >
                                                            <FaFileExcel size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Reports;