import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const StudentTable = ({ students, onEdit, onDelete }) => {

    if (students.length === 0) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

                📭

                <p className="mt-4 text-xl font-semibold">

                    No Students Found

                </p>

                <p className="text-gray-400 mt-2">

                    Try changing your search.

                </p>

            </div>

        );

    }

    return (

        <div className="overflow-x-auto rounded-xl shadow bg-white">

            <table className="min-w-full">

                <thead className="bg-indigo-600 text-white">

                    <tr>

                        <th className="p-4 text-left">Roll No</th>

                        <th className="text-left">Name</th>

                        <th className="text-left">Branch</th>

                        <th className="text-left">Semester</th>

                        <th className="text-left">Email</th>

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

                        students.map((student) => (

                            <tr
                                key={student._id}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="p-4">

                                    {student.rollNo}

                                </td>

                                <td>

                                    {student.name}

                                </td>

                                <td>

                                    {student.branch}

                                </td>

                                <td>

                                    {student.semester}

                                </td>

                                <td>

                                    {student.email}

                                </td>

                                <td className="text-center">

                                    <StatusBadge
                                        active={student.isActive}
                                    />

                                </td>

                                <RoleGuard roles={["admin"]}>

                                    <td className="text-center">

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

    );

};

export default StudentTable;