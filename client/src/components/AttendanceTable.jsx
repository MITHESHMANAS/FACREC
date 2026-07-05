import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const AttendanceTable = ({ attendance, onDelete }) => {

    if (attendance.length === 0) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center">

                <h2 className="text-2xl font-semibold">
                    No Attendance Records
                </h2>

                <p className="text-gray-500 mt-2">
                    Mark attendance to see records here.
                </p>

            </div>

        );

    }

    return (

        <div className="overflow-x-auto bg-white rounded-xl shadow">

            <table className="min-w-full">

                <thead className="bg-indigo-600 text-white">

                    <tr>

                        <th className="p-4 text-left">Roll No</th>

                        <th className="text-left">Student</th>

                        <th className="text-left">Subject</th>

                        <th className="text-left">Faculty</th>

                        <th className="text-left">Date</th>

                        <th className="text-center">Status</th>

                        <RoleGuard roles={["admin"]}>

                            <th className="text-center">
                                Actions
                            </th>

                        </RoleGuard>

                    </tr>

                </thead>

                <tbody>

                    {

                        attendance.map((record) => (

                            <tr
                                key={record._id}
                                className="border-b hover:bg-slate-50"
                            >

                                <td className="p-4">

                                    {record.student?.rollNo}

                                </td>

                                <td>

                                    {record.student?.name}

                                </td>

                                <td>

                                    {record.session?.subject?.name}

                                </td>

                                <td>

                                    {record.session?.faculty}

                                </td>

                                <td>

                                    {record.session?.date}

                                </td>

                                <td className="text-center">

                                    <StatusBadge
                                        active={record.status === "Present"}
                                    />

                                </td>

                                <RoleGuard roles={["admin"]}>

                                    <td className="text-center">

                                        <ActionButtons
                                            onDelete={() => onDelete(record)}
                                        />

                                    </td>

                                </RoleGuard>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

};

export default AttendanceTable;