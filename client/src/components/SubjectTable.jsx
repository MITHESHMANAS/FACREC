import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const SubjectTable = ({ subjects, onEdit, onDelete }) => {

    if (subjects.length === 0) {

        return (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

                📚

                <p className="mt-4 text-xl font-semibold">
                    No Subjects Found
                </p>

                <p className="text-gray-400 mt-2">
                    Add your first subject.
                </p>

            </div>
        );

    }

    return (

        <div className="overflow-x-auto rounded-xl shadow bg-white">

            <table className="min-w-full">

                <thead className="bg-indigo-600 text-white">

                    <tr>

                        <th className="p-4 text-left">Code</th>
                        <th className="text-left">Subject</th>
                        <th className="text-left">Semester</th>
                        <th className="text-left">Branch</th>
                        <th className="text-left">Faculty</th>
                        <th className="text-center">Status</th>

                        <RoleGuard roles={["admin"]}>
                            <th className="text-center">Actions</th>
                        </RoleGuard>

                    </tr>

                </thead>

                <tbody>

                    {subjects.map((subject) => (

                        <tr
                            key={subject._id}
                            className="border-b hover:bg-slate-50 transition"
                        >

                            <td className="p-4">
                                {subject.code}
                            </td>

                            <td>
                                {subject.name}
                            </td>

                            <td>
                                {subject.semester}
                            </td>

                            <td>
                                {subject.branch}
                            </td>

                            <td>
                                {subject.faculty}
                            </td>

                            <td className="text-center">
                                <StatusBadge active={subject.isActive} />
                            </td>

                            <RoleGuard roles={["admin"]}>

                                <td className="text-center">

                                    <ActionButtons
                                        onEdit={() => onEdit(subject)}
                                        onDelete={() => onDelete(subject)}
                                    />

                                </td>

                            </RoleGuard>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

};

export default SubjectTable;