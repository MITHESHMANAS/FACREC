import { FaClipboardList } from "react-icons/fa";
import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
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

const AttendanceTable = ({ attendance, onDelete, facultyMap = {} }) => {
    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(attendance, { pageSize: 10, getSortValue });

    if (attendance.length === 0) {
        return (
            <div className="mt-6">
                <EmptyState icon={FaClipboardList} title="No attendance records" message="Mark attendance to see records here." />
            </div>
        );
    }

    return (
        // Added mt-6 for separation from the search bar above
        <div className="mt-6 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="!pl-8 pr-6 py-5 text-left">Roll No</th>
                            <th className="px-6 py-5 text-left">Student</th>
                            <th className="px-6 py-5 text-left">Subject</th>
                            <th className="px-6 py-5 text-left">Faculty</th>
                            <th className="px-6 py-5 text-left">Date</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <RoleGuard roles={["admin"]}>
                                <th className="px-6 py-5 text-center">Actions</th>
                            </RoleGuard>
                        </tr>
                    </thead>
                    {/* divide-y adds the visual separation lines between rows */}
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((record) => (
                            <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="!pl-8 pr-6 py-5 font-bold text-slate-900 text-sm">{record.student?.rollNo || "—"}</td>
                                <td className="px-6 py-5 font-medium text-slate-700 text-sm">{record.student?.name || "—"}</td>
                                <td className="px-6 py-5 text-slate-600 text-sm">{record.session?.subject?.name || "—"}</td>
                                <td className="px-6 py-5 text-slate-600 text-sm">
                                    {facultyMap[record.session?.faculty] || record.session?.faculty || "—"}
                                </td>
                                <td className="px-6 py-5 text-slate-600 text-sm">{record.session?.date || "—"}</td>
                                <td className="px-6 py-5 text-center"><StatusBadge active={record.status === "Present"} /></td>
                                <RoleGuard roles={["admin"]}>
                                    <td className="px-6 py-5 text-center">
                                        <ActionButtons onDelete={() => onDelete(record)} />
                                    </td>
                                </RoleGuard>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination wrapper for spacing */}
            <div className="p-4 border-t border-slate-100">
                <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
            </div>
        </div>
    );
};

export default AttendanceTable;