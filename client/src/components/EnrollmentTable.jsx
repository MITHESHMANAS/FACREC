import { FaInbox, FaTrashAlt } from "react-icons/fa";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (item, field) => {
    switch (field) {
        case "rollNo":
            return typeof item.student === "object" ? item.student?.rollNo : item.studentRollNo;
        case "student":
            return typeof item.student === "object" ? item.student?.name?.toLowerCase() : item.studentName?.toLowerCase();
        case "subject":
            return typeof item.subject === "object" ? item.subject?.name?.toLowerCase() : item.subjectName?.toLowerCase();
        case "branch":
            return item.branch?.toLowerCase() || (typeof item.student === "object" ? item.student?.branch?.toLowerCase() : "");
        case "semester":
            return item.semester || (typeof item.student === "object" ? item.student?.semester : 0);
        default:
            return null;
    }
};

const EnrollmentTable = ({ enrollments, onRemove }) => {
    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(enrollments, { pageSize: 8, getSortValue });

    if (enrollments.length === 0) {
        return (
            <EmptyState
                icon={FaInbox}
                title="No enrollments tracked"
                message="No records match your active filtering configuration properties."
            />
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide border-b border-slate-200">
                        <tr>
                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="!pl-6 py-4">
                                Roll No
                            </SortableTh>
                            <SortableTh field="student" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Student
                            </SortableTh>
                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Subject
                            </SortableTh>
                            <SortableTh field="branch" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Branch
                            </SortableTh>
                            <SortableTh field="semester" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Semester
                            </SortableTh>
                            <th className="py-4 text-center font-semibold text-slate-500 normal-case tracking-normal">
                                Status
                            </th>
                            <th className="py-4 !pr-6 text-center font-semibold text-slate-500 normal-case tracking-normal">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {rows.map((item, idx) => {
                            // Backend API integration safety fallbacks
                            const sRoll = typeof item.student === "object" ? item.student?.rollNo : item.studentRollNo || "-";
                            const sName = typeof item.student === "object" ? item.student?.name : item.studentName || "Unknown";
                            
                            const subCode = typeof item.subject === "object" ? item.subject?.code : item.subjectCode || "";
                            const subName = typeof item.subject === "object" ? item.subject?.name : item.subjectName || "Unknown";
                            
                            const displayBranch = item.branch || (typeof item.student === "object" ? item.student?.branch : "-");
                            const displaySem = item.semester || (typeof item.student === "object" ? item.student?.semester : "-");

                            return (
                                <tr key={item._id || idx} className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/40">
                                    <td className="!pl-6 pr-4 py-3.5 font-semibold text-slate-700 tabular-nums">
                                        {sRoll}
                                    </td>
                                    <td className="px-4 py-3.5 font-bold text-slate-800">
                                        {sName}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                                        {subCode ? <span className="text-indigo-600 font-bold mr-1.5">{subCode}</span> : null}
                                        {subName}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600 font-semibold uppercase">
                                        {displayBranch}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600 font-semibold tabular-nums">
                                        {displaySem}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-normal">
                                            Active
                                        </span>
                                    </td>
                                    <td className="pl-4 !pr-6 py-3.5 text-center">
                                        <button
                                            onClick={() => onRemove(item._id)}
                                            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold transition-all text-sm py-1 px-2.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                        >
                                            <FaTrashAlt className="text-xs" />
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
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

export default EnrollmentTable;