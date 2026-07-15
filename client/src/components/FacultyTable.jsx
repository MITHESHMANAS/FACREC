import { motion } from "framer-motion";
import { FaEye, FaInbox, FaBuilding } from "react-icons/fa";
import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (fac, field) => {
    switch (field) {
        case "name": return fac.name?.toLowerCase();
        case "employeeId": return fac.employeeId?.toLowerCase();
        case "department": return fac.department?.toLowerCase();
        case "designation": return fac.designation?.toLowerCase();
        case "email": return fac.email?.toLowerCase();
        case "status": return fac.isActive ? 1 : 0;
        default: return null;
    }
};

const getInitials = (name) => {
    if (!name) return "";
    const cleanName = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s+/i, "");
    const parts = cleanName.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const FacultyTable = ({ faculty, onEdit, onDelete }) => {
    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(faculty, { pageSize: 8, getSortValue });

    if (faculty.length === 0) {
        return (
            <EmptyState
                icon={FaInbox}
                title="No faculty members found"
                message="Try tweaking your filters or register a new staff account."
            />
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 text-xs uppercase tracking-wide border-b border-slate-200">
                        <tr>
                            {/* Modified to inject spacing parameters directly into the sort component */}
                            <SortableTh field="employeeId" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="!pl-6 py-4">
                                Employee ID
                            </SortableTh>
                            <SortableTh field="name" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Name
                            </SortableTh>
                            <SortableTh field="email" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Email
                            </SortableTh>
                            <SortableTh field="department" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Department
                            </SortableTh>
                            <SortableTh field="designation" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="py-4">
                                Designation
                            </SortableTh>
                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center" className="py-4">
                                Status
                            </SortableTh>
                            <RoleGuard roles={["admin"]}>
                                <th className="py-4 !pr-6 text-center font-semibold text-slate-500 normal-case tracking-normal">
                                    Actions
                                </th>
                            </RoleGuard>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {rows.map((fac, idx) => (
                            <tr
                                key={fac._id || idx}
                                className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/60"
                            >
                                {/* Locked content boundary track alignment */}
                                <td className="!pl-6 pr-4 py-3.5 font-semibold text-slate-700 tabular-nums">
                                    {fac.employeeId}
                                </td>

                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100/40">
                                            {getInitials(fac.name)}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 truncate">
                                            {fac.name}
                                        </h3>
                                    </div>
                                </td>

                                <td className="px-4 py-3.5 max-w-[240px] truncate text-slate-600">
                                    {fac.email}
                                </td>

                                <td className="px-4 py-3.5">
                                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                        <FaBuilding className="text-[10px]" />
                                        {fac.department}
                                    </span>
                                </td>

                                <td className="px-4 py-3.5 font-medium text-slate-600">
                                    {fac.designation}
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                    <StatusBadge active={fac.isActive} />
                                </td>

                                <RoleGuard roles={["admin"]}>
                                    <td className="pl-4 !pr-6 py-3.5 text-center">
                                        <div className="scale-90 origin-center flex items-center justify-center">
                                            <ActionButtons
                                                onEdit={() => onEdit(fac)}
                                                onDelete={() => onDelete(fac)}
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

export default FacultyTable;