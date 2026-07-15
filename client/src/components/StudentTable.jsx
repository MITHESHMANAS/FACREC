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

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">

            <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-slate-50 text-slate-600 sticky top-0 text-xs uppercase tracking-wide">

                        <tr>

                            <SortableTh field="name" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Student
                            </SortableTh>

                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Roll No
                            </SortableTh>

                            <SortableTh field="branch" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Branch
                            </SortableTh>

                            <SortableTh field="semester" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">
                                Semester
                            </SortableTh>

                            <SortableTh field="email" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Email
                            </SortableTh>

                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">
                                Status
                            </SortableTh>

                            <SortableTh align="center">
                                Profile
                            </SortableTh>

                            <RoleGuard roles={["admin"]}>
                                <SortableTh align="center">
                                    Actions
                                </SortableTh>
                            </RoleGuard>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            rows.map((student) => (
                                <tr
                                    key={student._id}
                                    className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/60"
                                >

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                <FaUserGraduate className="text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-slate-800 truncate">
                                                    {student.name}
                                                </h3>
                                                <p className="text-xs text-slate-400">
                                                    Student
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-600">
                                        {student.rollNo}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            <FaBuilding className="text-[10px]" />
                                            {student.branch}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            {student.semester}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {student.email}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge active={student.isActive} />
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            to={`/students/${student._id}`}
                                            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                                        >
                                            <FaEye />
                                            View
                                        </Link>
                                    </td>

                                    <RoleGuard roles={["admin"]}>
                                        <td className="px-6 py-4 text-center">
                                            <ActionButtons
                                                onEdit={() => onEdit(student)}
                                                onDelete={() => onDelete(student)}
                                            />
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

export default StudentTable;
