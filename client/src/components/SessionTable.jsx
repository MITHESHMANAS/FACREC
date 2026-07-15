import { FaCalendarAlt, FaPlay, FaStop, FaRedo } from "react-icons/fa";

import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import Badge from "./Badge";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (session, field) => {

    switch (field) {
        case "subject": return session.subject?.name?.toLowerCase();
        case "faculty": return session.faculty?.toLowerCase();
        case "date": return session.date;
        case "expected": return session.expectedStudents ?? -1;
        case "present": return session.presentStudents ?? -1;
        case "absent": return session.absentStudents ?? -1;
        case "status": return session.status;
        default: return null;
    }

};

const SessionTable = ({
    sessions,
    onEdit,
    onDelete,
    onStart,
    onComplete,
    onReopen
}) => {

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(sessions, { pageSize: 8, getSortValue });

    if (sessions.length === 0) {

        return (
            <EmptyState
                icon={FaCalendarAlt}
                title="No sessions yet"
                message="Create your first attendance session to get started."
            />
        );

    }

    return (

        <div className="overflow-hidden rounded-[20px] shadow-sm border border-slate-200 bg-white">

            <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-slate-50 text-slate-600 sticky top-0 text-xs uppercase tracking-wide">
                        <tr>
                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Subject</SortableTh>
                            <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Faculty</SortableTh>
                            <SortableTh field="date" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Date</SortableTh>
                            <SortableTh field="expected" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Expected</SortableTh>
                            <SortableTh field="present" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Present</SortableTh>
                            <SortableTh field="absent" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Absent</SortableTh>
                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Status</SortableTh>
                            <SortableTh align="center">Actions</SortableTh>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            rows.map((session) => {

                                const canStart = session.status === "SCHEDULED";
                                const canEnd = session.status === "ACTIVE";
                                const canReopen = session.status === "ENDED";

                                return (

                                    <tr
                                        key={session._id}
                                        className={`border-b border-slate-100 last:border-0 transition hover:bg-slate-50 ${
                                            session.status === "ACTIVE" ? "bg-emerald-50/50" : ""
                                        }`}
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {session.subject?.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {session.faculty}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {session.date}
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-700">
                                            {session.expectedStudents ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-emerald-700">
                                            {session.presentStudents ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-red-600">
                                            {session.absentStudents ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge status={session.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2 flex-wrap">
                                                <RoleGuard roles={["admin", "faculty"]}>
                                                    {
                                                        canStart &&
                                                        <button
                                                            onClick={() => onStart(session)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition"
                                                        >
                                                            <FaPlay className="text-[10px]" />
                                                            Start
                                                        </button>
                                                    }
                                                    {
                                                        canEnd &&
                                                        <button
                                                            onClick={() => onComplete(session)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 transition"
                                                        >
                                                            <FaStop className="text-[10px]" />
                                                            End
                                                        </button>
                                                    }
                                                </RoleGuard>
                                                <RoleGuard roles={["admin"]}>
                                                    {
                                                        canReopen &&
                                                        <button
                                                            onClick={() => onReopen(session)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 transition"
                                                        >
                                                            <FaRedo className="text-[10px]" />
                                                            Reopen
                                                        </button>
                                                    }
                                                    <ActionButtons
                                                        onEdit={() => onEdit(session)}
                                                        onDelete={() => onDelete(session)}
                                                    />
                                                </RoleGuard>
                                            </div>
                                        </td>
                                    </tr>

                                );

                            })
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

export default SessionTable;
