import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const SessionTable = ({ sessions, onEdit, onDelete }) => {

    if (sessions.length === 0) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

                📅

                <p className="mt-4 text-xl font-semibold">
                    No Sessions Found
                </p>

                <p className="text-gray-400 mt-2">
                    Create your first class session.
                </p>

            </div>

        );

    }

    return (

        <div className="overflow-x-auto rounded-xl shadow bg-white">

            <table className="min-w-full">

                <thead className="bg-indigo-600 text-white">

                    <tr>

                        <th className="p-4 text-left">Subject</th>
                        <th className="text-left">Faculty</th>
                        <th className="text-left">Semester</th>
                        <th className="text-left">Branch</th>
                        <th className="text-left">Date</th>
                        <th className="text-left">Start</th>
                        <th className="text-left">End</th>
                        <th className="text-center">Status</th>

                        <RoleGuard roles={["admin"]}>
                            <th className="text-center">Actions</th>
                        </RoleGuard>

                    </tr>

                </thead>

                <tbody>

                    {sessions.map((session) => (

                        <tr
                            key={session._id}
                            className="border-b hover:bg-slate-50 transition"
                        >

                            <td className="p-4">

                                {session.subject?.name}

                            </td>

                            <td>

                                {session.faculty}

                            </td>

                            <td>

                                {session.semester}

                            </td>

                            <td>

                                {session.branch}

                            </td>

                            <td>

                                {session.date}

                            </td>

                            <td>

                                {session.startTime}

                            </td>

                            <td>

                                {session.endTime || "--"}

                            </td>

                            <td className="text-center">

                                <StatusBadge
                                    active={session.status === "ACTIVE"}
                                />

                            </td>

                            <RoleGuard roles={["admin"]}>

                                <td className="text-center">

                                    <ActionButtons
                                        onEdit={() => onEdit(session)}
                                        onDelete={() => onDelete(session)}
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

export default SessionTable;