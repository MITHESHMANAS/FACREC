import { FaChalkboardTeacher, FaInbox, FaBuilding } from "react-icons/fa";

import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (member, field) => {

    switch (field) {
        case "employeeId": return member.employeeId?.toLowerCase();
        case "name": return member.name?.toLowerCase();
        case "email": return member.email?.toLowerCase();
        case "department": return member.department?.toLowerCase();
        case "designation": return member.designation?.toLowerCase();
        case "status": return member.isActive ? 1 : 0;
        default: return null;
    }

};

const FacultyTable = ({ faculty, onEdit, onDelete }) => {

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(faculty, { pageSize: 8, getSortValue });

    if (faculty.length === 0) {

        return (
            <EmptyState
                icon={FaInbox}
                title="No faculty found"
                message="Add your first faculty member to get started."
            />
        );

    }

    return (

        <div className="overflow-hidden rounded-[20px] shadow-sm border border-slate-200 bg-white">

            <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-slate-50 text-slate-600 sticky top-0 text-xs uppercase tracking-wide">
                        <tr>
                            <SortableTh field="employeeId" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Employee ID
                            </SortableTh>
                            <SortableTh field="name" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Name
                            </SortableTh>
                            <SortableTh field="email" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Email
                            </SortableTh>
                            <SortableTh field="department" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Department
                            </SortableTh>
                            <SortableTh field="designation" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>
                                Designation
                            </SortableTh>
                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">
                                Status
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
                            rows.map((member) => (
                                <tr
                                    key={member._id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/60 transition"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-600">
                                        {member.employeeId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                <FaChalkboardTeacher className="text-emerald-600 text-sm" />
                                            </div>
                                            <span className="font-semibold text-slate-800">
                                                {member.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {member.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            <FaBuilding className="text-[10px]" />
                                            {member.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {member.designation}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge active={member.isActive} />
                                    </td>
                                    <RoleGuard roles={["admin"]}>
                                        <td className="px-6 py-4 text-center">
                                            <ActionButtons
                                                onEdit={() => onEdit(member)}
                                                onDelete={() => onDelete(member)}
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

export default FacultyTable;
