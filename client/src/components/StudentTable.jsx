import { Link } from "react-router-dom";
import { FaUserGraduate, FaEye, FaInbox, FaBuilding } from "react-icons/fa";

import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (student, field) => {
    switch (field) {
        case "name": return student.name?.toLowerCase();
        case "rollNo": return student.rollNo?.toLowerCase();
        case "branch": return student.branch?.toLowerCase();
        case "semester": return student.semester;
        case "email": return student.email?.toLowerCase();
        case "status": return student.isActive ? 1 : 0;
        default: return null;
    }
};

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const StudentTable = ({ students, onEdit, onDelete }) => {
    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(students, { pageSize: 8, getSortValue });

    if (students.length === 0) {
        return (
            <EmptyState
                icon={FaInbox}
                title="No students found"
                message="Try changing your search or add a new student."
            />
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 text-xs uppercase tracking-wide border-b border-slate-200">
                        <tr>
                            {/* Injected layout spacing directly into the component class wrapper */}
                            <SortableTh field="name" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="!pl-6 py-4">
                                Student
                            </SortableTh>
                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Roll No
                            </SortableTh>
                            <SortableTh field="branch" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Branch
                            </SortableTh>
                            <SortableTh field="semester" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center" className="py-4">
                                Semester
                            </SortableTh>
                            <SortableTh field="email" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Email
                            </SortableTh>
                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center" className="py-4">
                                Status
                            </SortableTh>
                            <th className="py-4 text-center font-semibold text-slate-500 normal-case tracking-normal">
                                Profile
                            </th>
                            <RoleGuard roles={["admin"]}>
                                <th className="py-4 !pr-6 text-center font-semibold text-slate-500 normal-case tracking-normal">
                                    Actions
                                </th>
                            </RoleGuard>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((student) => (
                            <tr
                                key={student._id}
                                className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/60"
                            >
                                <td className="!pl-6 pr-4 py-3">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                                            {getInitials(student.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-slate-800 truncate">
                                                {student.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                Roll No. {student.rollNo || "N/A"} • Sem {student.semester || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3 font-medium text-slate-600">
                                    {student.rollNo}
                                </td>

                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                        <FaBuilding className="text-[10px]" />
                                        {student.branch}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                        {student.semester}
                                    </span>
                                </td>

                                <td className="px-4 py-3 max-w-[220px] truncate text-slate-600">
                                    {student.email}
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <StatusBadge active={student.isActive} />
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <Link
                                        to={`/students/${student._id}`}
                                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                                    >
                                        <FaEye />
                                        View
                                    </Link>
                                </td>

                                <RoleGuard roles={["admin"]}>
                                    <td className="pl-4 !pr-6 py-3 text-center">
                                        <div className="scale-90 origin-center flex items-center justify-center">
                                            <ActionButtons
                                                onEdit={() => onEdit(student)}
                                                onDelete={() => onDelete(student)}
                                            />
                                        </div>
                                    </td>
                                </RoleGuard>
                            </tr>
                        ))}
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

export default StudentTable;