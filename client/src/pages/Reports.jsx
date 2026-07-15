import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import {
    FaCalendarCheck,
    FaUserCheck,
    FaUserTimes,
    FaFilePdf,
    FaFileExcel,
    FaListAlt
} from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

import {
    downloadPdfReport,
    downloadExcelReport
} from "../services/reportService";

import { getSessions } from "../services/sessionService";
import useAttendanceSocket from "../hooks/useAttendanceSocket";

const Reports = () => {

    const [sessions, setSessions] = useState([]);

    const [loadingSessions, setLoadingSessions] = useState(true);

    // Tracks which specific session + format is downloading, so only
    // that row's button shows a spinner instead of the whole page.
    const [downloadingKey, setDownloadingKey] = useState(null);

    const loadSessions = async () => {

        try {

            const data = await getSessions();

            // Newest first, so the most relevant sessions are on top.
            const sorted = [...(data.sessions || [])].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setSessions(sorted);

        }

        catch (err) {

            console.error(err);

            toast.error("Unable to load sessions");

        }

        finally {

            setLoadingSessions(false);

        }

    };

    useEffect(() => {

        loadSessions();

    }, []);

    // A session ending in the Sessions page (or reopened, corrected,
    // and ended again) should make it appear here without the user
    // having to manually refresh the Reports page.
    useAttendanceSocket(null, () => {

        loadSessions();

    });

    const handleDownload = async (session, format) => {

        const key = `${session._id}-${format}`;

        try {

            setDownloadingKey(key);

            if (format === "pdf") {
                await downloadPdfReport(session._id);
            } else {
                await downloadExcelReport(session._id);
            }

            toast.success(
                `${format.toUpperCase()} downloaded successfully`
            );

        }

        catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.message ||
                err.message ||
                `Unable to generate ${format.toUpperCase()}`
            );

        }

        finally {

            setDownloadingKey(null);

        }

    };

    const endedSessions = sessions.filter((s) => s.status === "ENDED");
    const activeSession = sessions.find((s) => s.status === "ACTIVE");

    const totalPresent = endedSessions.reduce(
        (sum, s) => sum + (s.presentStudents || 0),
        0
    );

    const totalAbsent = endedSessions.reduce(
        (sum, s) => sum + (s.absentStudents || 0),
        0
    );

    return (

        <AppLayout>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                Reports
            </h1>

            <p className="text-gray-500 mt-2">
                Download attendance reports for any session.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                <KpiCard index={0} title="Completed Sessions" value={endedSessions.length} icon={FaCalendarCheck} tone="indigo" />
                <KpiCard index={1} title="Total Present (all time)" value={totalPresent} icon={FaUserCheck} tone="emerald" />
                <KpiCard index={2} title="Total Absent (all time)" value={totalAbsent} icon={FaUserTimes} tone="red" />

            </div>

            {
                activeSession &&

                <Card accent="border-l-indigo-600" className="mt-6">

                    <div className="flex justify-between items-center flex-wrap gap-4">

                        <div>

                            <p className="text-sm text-gray-500">
                                Active Session
                            </p>

                            <h2 className="text-xl font-bold text-slate-800">
                                {activeSession.subject?.name || "Unknown Subject"}
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {activeSession.date} &middot; {activeSession.startTime}
                                {" "}&middot; Expected {activeSession.expectedStudents}
                            </p>

                        </div>

                        <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-4 py-2 rounded-lg text-sm font-medium">

                            End this session to generate a report

                        </div>

                    </div>

                </Card>
            }

            <Card padding="none" className="mt-6 overflow-hidden">

                <div className="p-6 pb-0">
                    <h2 className="text-lg font-bold flex items-center gap-2.5 text-slate-800">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                            <FaListAlt />
                        </span>
                        Completed Sessions
                    </h2>
                </div>

                {
                    loadingSessions
                        ?
                        <TableSkeleton rows={4} columns={5} />
                        :
                        endedSessions.length === 0
                            ?
                            <EmptyState
                                icon={FaCalendarCheck}
                                title="No completed sessions yet"
                                message="Reports become available once a session is started and ended."
                            />
                            :
                            <div className="overflow-x-auto mt-4">

                                <table className="min-w-full text-sm">

                                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">

                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Subject</th>
                                            <th className="px-6 py-4 text-left font-semibold">Date</th>
                                            <th className="px-6 py-4 text-right font-semibold">Expected</th>
                                            <th className="px-6 py-4 text-right font-semibold">Present</th>
                                            <th className="px-6 py-4 text-right font-semibold">Absent</th>
                                            <th className="px-6 py-4 text-right font-semibold">Attendance %</th>
                                            <th className="px-6 py-4 text-center font-semibold">Download</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {
                                            endedSessions.map((session) => {

                                                const pct = session.expectedStudents > 0
                                                    ? (
                                                        (session.presentStudents / session.expectedStudents) * 100
                                                    ).toFixed(1)
                                                    : "0.0";

                                                return (

                                                    <tr
                                                        key={session._id}
                                                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                                                    >

                                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                                            {session.subject?.name || "Unknown Subject"}
                                                        </td>

                                                        <td className="px-6 py-4 text-slate-600">
                                                            {session.date}
                                                        </td>

                                                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                                                            {session.expectedStudents}
                                                        </td>

                                                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                                                            {session.presentStudents}
                                                        </td>

                                                        <td className="px-6 py-4 text-right font-semibold text-red-600">
                                                            {session.absentStudents}
                                                        </td>

                                                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                                                            {pct}%
                                                        </td>

                                                        <td className="px-6 py-4">

                                                            <div className="flex gap-2 justify-center">

                                                                <button
                                                                    onClick={() => handleDownload(session, "pdf")}
                                                                    disabled={downloadingKey === `${session._id}-pdf`}
                                                                    className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                                                >
                                                                    <FaFilePdf />
                                                                    {downloadingKey === `${session._id}-pdf` ? "..." : "PDF"}
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDownload(session, "excel")}
                                                                    disabled={downloadingKey === `${session._id}-excel`}
                                                                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-40 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                                                >
                                                                    <FaFileExcel />
                                                                    {downloadingKey === `${session._id}-excel` ? "..." : "Excel"}
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            })
                                        }

                                    </tbody>

                                </table>

                            </div>
                }

            </Card>

        </AppLayout>

    );

};

export default Reports;
