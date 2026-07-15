import { FaHistory, FaCalendarAlt } from "react-icons/fa";

import Badge from "./Badge";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import SortableTh from "./ui/SortableTh";
import useDataTable from "../hooks/useDataTable";

const getSortValue = (record, field) => {

    switch (field) {
        case "date": return record.session?.date;
        case "subject": return record.session?.subject?.name?.toLowerCase();
        case "faculty": return record.session?.faculty?.toLowerCase();
        case "status": return record.status === "Present" ? 1 : 0;
        default: return null;
    }

};

const AttendanceHistory = ({ history }) => {

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(history, { pageSize: 8, getSortValue });

    return (

        <Card padding="none" className="overflow-hidden">

            <div className="p-6 pb-0">
                <h2 className="text-lg font-bold flex items-center gap-2.5 text-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                        <FaHistory />
                    </span>
                    Attendance History
                </h2>
            </div>

            {
                history.length === 0
                    ?
                    <EmptyState
                        icon={FaCalendarAlt}
                        title="No attendance records yet"
                        message="This fills up once sessions are marked for this student."
                    />
                    :
                    <>
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                                    <tr>
                                        <SortableTh field="date" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Date</SortableTh>
                                        <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Subject</SortableTh>
                                        <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Faculty</SortableTh>
                                        <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Status</SortableTh>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        rows.map((record) => (
                                            <tr
                                                key={record._id}
                                                className="border-t border-slate-100 hover:bg-slate-50 transition"
                                            >
                                                <td className="px-6 py-3.5 text-slate-600">
                                                    {record.session?.date}
                                                </td>
                                                <td className="px-6 py-3.5 font-medium text-slate-700">
                                                    {record.session?.subject?.name}
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-600">
                                                    {record.session?.faculty}
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <Badge status={record.status} />
                                                </td>
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
                    </>
            }

        </Card>

    );

};

export default AttendanceHistory;
