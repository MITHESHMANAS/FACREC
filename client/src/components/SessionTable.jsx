import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";

const SessionTable = ({
    sessions,
    onEdit,
    onDelete,
    onStart,
    onComplete
}) => {

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

const getStatusBadge = (status) => {

    switch (status) {

        case "SCHEDULED":

            return (
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                    SCHEDULED
                </span>
            );

        case "ACTIVE":

            return (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    ACTIVE
                </span>
            );

        case "ENDED":

            return (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    ENDED
                </span>
            );

        default:

            return (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    UNKNOWN
                </span>
            );
    }
};
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

                            <th className="text-center">
                                Actions
                            </th>

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
                                {getStatusBadge(session.status)}
                            </td>

                            <RoleGuard roles={["admin"]}>

                                <td>

                                    <div className="flex justify-center gap-2">

                                        {session.status === "ENDED" ? null : (

                                            session.status === "ACTIVE" ? (

                                                <button
                                                    onClick={() => onComplete(session)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    End
                                                </button>

                                            ) : (

                                                <button
                                                    onClick={() => onStart(session)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    Start
                                                </button>

                                            )

                                        )}

                                        <ActionButtons
                                            onEdit={() => onEdit(session)}
                                            onDelete={() => onDelete(session)}
                                        />

                                    </div>

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