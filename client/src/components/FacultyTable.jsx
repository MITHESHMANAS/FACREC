import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const FacultyTable = ({ faculty, onEdit, onDelete }) => {

    if (faculty.length === 0) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

                📭

                <p className="mt-4 text-xl font-semibold">

                    No Faculty Found

                </p>

                <p className="text-gray-400 mt-2">

                    Add your first faculty member.

                </p>

            </div>

        );

    }

    return (

        <div className="overflow-x-auto rounded-xl shadow bg-white">

            <table className="min-w-full">

                <thead className="bg-indigo-600 text-white">

                    <tr>

                        <th className="p-4 text-left">

                            Employee ID

                        </th>

                        <th className="text-left">

                            Name

                        </th>

                        <th className="text-left">

                            Email

                        </th>

                        <th className="text-left">

                            Department

                        </th>

                        <th className="text-left">

                            Designation

                        </th>

                        <th className="text-center">

                            Status

                        </th>

                        <RoleGuard roles={["admin"]}>

                            <th className="text-center">

                                Actions

                            </th>

                        </RoleGuard>

                    </tr>

                </thead>

                <tbody>

                    {

                        faculty.map((member) => (

                            <tr
                                key={member._id}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="p-4">

                                    {member.employeeId}

                                </td>

                                <td>

                                    {member.name}

                                </td>

                                <td>

                                    {member.email}

                                </td>

                                <td>

                                    {member.department}

                                </td>

                                <td>

                                    {member.designation}

                                </td>

                                <td className="text-center">

                                    <StatusBadge
                                        active={member.isActive}
                                    />

                                </td>

                                <RoleGuard roles={["admin"]}>

                                    <td className="text-center">

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

    );

};

export default FacultyTable;