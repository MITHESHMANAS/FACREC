import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import Badge from "./Badge";
import Pagination from "./ui/Pagination";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (record, field) => {
    switch (field) {
        case "rollNo": return record.student?.rollNo?.toLowerCase();
        case "student": return record.student?.name?.toLowerCase();
        case "subject": return record.session?.subject?.name?.toLowerCase();
        case "faculty": return record.session?.faculty?.toLowerCase();
        case "date": return record.session?.date;
        case "status": return record.status === "Present" ? 1 : 0;
        default: return null;
    }
};

const formatMarkedTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AttendanceTable = ({ attendance, onDelete, facultyMap = {}, emptyState = null }) => {
    const { rows, page, setPage, totalPages, pageSize, total } =
        useDataTable(attendance, { pageSize: 10, getSortValue });

    if (attendance.length === 0) {
        return (
            <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {emptyState}
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="!pl-8 pr-6 py-5 text-left">Roll No</th>
                            <th className="px-6 py-5 text-left">Student</th>
                            <th className="px-6 py-5 text-left">Subject</th>
                            <th className="px-6 py-5 text-left">Faculty</th>
                            <th className="px-6 py-5 text-left">Date</th>
                            <th className="px-6 py-5 text-left">Marked</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <RoleGuard roles={["admin"]}>
                                <th className="px-6 py-5 text-center">Actions</th>
                            </RoleGuard>
                        </tr>
                    </thead>
                    {/* divide-y adds the visual separation lines between rows */}
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((record) => {
                            const isLive = record.session?.status === "ACTIVE";

                            return (
                            <tr key={record._id} className={`transition-colors ${isLive ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-slate-50/50"}`}>
                                <td className={`!pl-8 pr-6 py-5 font-bold text-slate-900 text-sm border-l-4 ${isLive ? "border-emerald-500" : "border-transparent"}`}>{record.student?.rollNo || "—"}</td>
                                <td className="px-6 py-5 font-medium text-slate-700 text-sm">{record.student?.name || "—"}</td>
                                <td className="px-6 py-5 text-slate-600 text-sm">{record.session?.subject?.name || "—"}</td>
                                <td className="px-6 py-5 text-slate-600 text-sm">
                                    {facultyMap[record.session?.faculty] || record.session?.faculty || "—"}
                                </td>
                                <td className="px-6 py-5 text-slate-600 text-sm whitespace-nowrap">{record.session?.date || "—"}</td>
                                <td className="px-6 py-5 text-slate-500 text-sm whitespace-nowrap">{formatMarkedTime(record.markedAt)}</td>
                                <td className="px-6 py-5 text-center"><Badge status={record.status} /></td>
                                <RoleGuard roles={["admin"]}>
                                    <td className="px-6 py-5 text-center">
                                        <ActionButtons onDelete={() => onDelete(record)} />
                                    </td>
                                </RoleGuard>
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

export default AttendanceTable;