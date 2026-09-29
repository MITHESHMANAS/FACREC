import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

export const SHORTAGE_LIMIT = 75;

export const getPercent = (session) =>
    session.expectedStudents > 0
        ? (session.presentStudents / session.expectedStudents) * 100
        : 0;

const getSortValue = (s, field) => {
    switch (field) {
        case "subject": return s.subject?.name?.toLowerCase();
        case "faculty": return s.facultyName?.toLowerCase();
        case "date": return `${s.date || ""}T${s.startTime || ""}`;
        case "expected": return s.expectedStudents || 0;
        case "present": return s.presentStudents || 0;
        case "absent": return s.absentStudents || 0;
        case "pct": return getPercent(s);
        default: return null;
    }
};

const barTone = (pct) =>
    pct >= 90 ? "bg-emerald-500" : pct >= SHORTAGE_LIMIT ? "bg-amber-500" : "bg-rose-500";

const textTone = (pct) =>
    pct >= 90 ? "text-emerald-600" : pct >= SHORTAGE_LIMIT ? "text-amber-600" : "text-rose-600";

const ReportTable = ({ sessions = [], downloadingKey, onDownload, emptyState = null }) => {
    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(sessions, { pageSize: 10, getSortValue });

    if (sessions.length === 0) {
        return emptyState;
    }

    const th = "px-3 py-4 font-bold";

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-y border-slate-200">
                        <tr>
                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className={`!pl-6 ${th}`}>Subject</SortableTh>
                            <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className={th}>Faculty</SortableTh>
                            <SortableTh field="date" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className={th}>Date</SortableTh>
                            <SortableTh field="present" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center" className={th}>Present / Absent</SortableTh>
                            <SortableTh field="pct" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className={`${th} w-36`}>Attendance</SortableTh>
                            <th className="px-3 py-4 !pr-6 text-center font-bold text-slate-500">Download</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((session) => {
                            const pct = getPercent(session);
                            const hasRecords = (session.presentStudents || 0) + (session.absentStudents || 0) > 0;
                            const pdfKey = `${session._id}-pdf`;
                            const xlsKey = `${session._id}-excel`;

                            return (
                                <tr key={session._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                                    <td className="!pl-6 px-3 py-4 font-semibold text-slate-800">
                                        {session.subject?.code && (
                                            <span className="text-indigo-600 font-bold mr-2">{session.subject.code}</span>
                                        )}
                                        {session.subject?.name || "Unknown Subject"}
                                    </td>

                                    <td className="px-3 py-4 text-slate-600">
                                        {session.facultyName || "—"}
                                    </td>

                                    <td className="px-3 py-4 text-slate-600 whitespace-nowrap">
                                        <span className="block font-medium">{session.date}</span>
                                        {session.startTime && (
                                            <span className="block text-xs text-slate-400">
                                                {session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-3 py-4 text-center font-semibold tabular-nums whitespace-nowrap">
                                        <span className="text-emerald-600">{session.presentStudents}</span>
                                        <span className="mx-1.5 text-slate-300">/</span>
                                        <span className="text-red-600">{session.absentStudents}</span>
                                    </td>

                                    <td className="px-3 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                                <div className={`h-full rounded-full ${barTone(pct)}`} style={{ width: `${Math.min(100, pct)}%` }} />
                                            </div>
                                            <span className="w-16 text-right leading-tight">
                                                <span className={`block font-bold tabular-nums ${textTone(pct)}`}>{pct.toFixed(1)}%</span>
                                                <span className="block text-[10px] text-slate-400">{session.presentStudents} of {session.expectedStudents}</span>
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-3 py-4 !pr-6">
                                        <div className="flex gap-1.5 justify-center">
                                            <button
                                                onClick={() => onDownload(session, "pdf")}
                                                disabled={!hasRecords || downloadingKey === pdfKey}
                                                title={hasRecords ? "Download PDF report" : "No attendance records to report"}
                                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                                            >
                                                <FaFilePdf />
                                                {downloadingKey === pdfKey ? "..." : "PDF"}
                                            </button>

                                            <button
                                                onClick={() => onDownload(session, "excel")}
                                                disabled={!hasRecords || downloadingKey === xlsKey}
                                                title={hasRecords ? "Download Excel report" : "No attendance records to report"}
                                                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                                            >
                                                <FaFileExcel />
                                                {downloadingKey === xlsKey ? "..." : "Excel"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
        </div>
    );
};

export default ReportTable;