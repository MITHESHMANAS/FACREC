const AttendanceHistory = ({ history }) => {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Attendance History

            </h2>

            <table className="w-full">

                <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">

                            Date

                        </th>

                        <th className="text-left">

                            Subject

                        </th>

                        <th className="text-left">

                            Faculty

                        </th>

                        <th className="text-left">

                            Status

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        history.map((record) => (

                            <tr
                                key={record._id}
                                className="border-b"
                            >

                                <td className="py-3">

                                    {record.session?.date}

                                </td>

                                <td>

                                    {record.session?.subject?.name}

                                </td>

                                <td>

                                    {record.session?.faculty}

                                </td>

                                <td>

                                    <span
                                        className={`px-3 py-1 rounded-full text-white ${
                                            record.status === "Present"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        }`}
                                    >

                                        {record.status}

                                    </span>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

};

export default AttendanceHistory;