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

const AttendanceTable = ({ attendance, onDelete }) => {

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(attendance, { pageSize: 10, getSortValue });

    if (attendance.length === 0) {

        return (
            <EmptyState
                icon={FaClipboardList}
                title="No attendance records"
                message="Mark attendance to see records here."
            />
        );

    }

    return (

        <div className="overflow-hidden bg-white rounded-[20px] shadow-sm border border-slate-200">

            <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-slate-50 text-slate-600 sticky top-0 text-xs uppercase tracking-wide">
                        <tr>
                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Roll No</SortableTh>
                            <SortableTh field="student" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Student</SortableTh>
                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Subject</SortableTh>
                            <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Faculty</SortableTh>
                            <SortableTh field="date" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Date</SortableTh>
                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Status</SortableTh>
                            <RoleGuard roles={["admin"]}>
                                <SortableTh align="center">Actions</SortableTh>
                            </RoleGuard>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            rows.map((record) => (
                                <tr
                                    key={record._id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-600">
                                        {record.student?.rollNo}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {record.student?.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {record.session?.subject?.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {record.session?.faculty}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {record.session?.date}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge active={record.status === "Present"} />
                                    </td>
                                    <RoleGuard roles={["admin"]}>
                                        <td className="px-6 py-4 text-center">
                                            <ActionButtons onDelete={() => onDelete(record)} />
                                        </td>
                                    </RoleGuard>
                                </tr>
                            ))
                        }
                    </tbody>

                </table>

            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
            />

        </div>

    );

};

export default AttendanceTable;
