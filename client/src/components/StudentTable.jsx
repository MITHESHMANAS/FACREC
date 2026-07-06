import { Link } from "react-router-dom";
import { FaUserGraduate, FaEye } from "react-icons/fa";

import ActionButtons from "./ActionButtons";
import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";

const StudentTable = ({ students, onEdit, onDelete }) => {

    if (students.length === 0) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">

                <div className="text-6xl mb-4">

                    📭

                </div>

                <h2 className="text-2xl font-bold">

                    No Students Found

                </h2>

                <p className="text-gray-500 mt-3">

                    Try changing your search or add a new student.

                </p>

            </div>

        );

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">

                        <tr>

                            <th className="px-6 py-4 text-left">

                                Student

                            </th>

                            <th className="px-6 py-4 text-left">

                                Roll No

                            </th>

                            <th className="px-6 py-4 text-left">

                                Branch

                            </th>

                            <th className="px-6 py-4 text-center">

                                Semester

                            </th>

                            <th className="px-6 py-4 text-left">

                                Email

                            </th>

                            <th className="px-6 py-4 text-center">

                                Status

                            </th>

                            <th className="px-6 py-4 text-center">

                                Profile

                            </th>

                            <RoleGuard roles={["admin"]}>

                                <th className="px-6 py-4 text-center">

                                    Actions

                                </th>

                            </RoleGuard>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            students.map((student, index) => (

                                <tr

                                    key={student._id}

                                    className={`border-b transition hover:bg-indigo-50 ${

                                        index % 2 === 0

                                            ? "bg-white"

                                            : "bg-slate-50"

                                    }`}

                                >

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-4">

                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">

                                                <FaUserGraduate

                                                    className="text-indigo-600 text-xl"

                                                />

                                            </div>

                                            <div>

                                                <h3 className="font-bold">

                                                    {student.name}

                                                </h3>

                                                <p className="text-sm text-gray-500">

                                                    Student

                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="px-6 py-5 font-semibold">

                                        {student.rollNo}

                                    </td>

                                    <td className="px-6 py-5">

                                        {student.branch}

                                    </td>

                                    <td className="px-6 py-5 text-center">

                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">

                                            {student.semester}

                                        </span>

                                    </td>

                                    <td className="px-6 py-5">

                                        {student.email}

                                    </td>

                                    <td className="px-6 py-5 text-center">

                                        <StatusBadge

                                            active={student.isActive}

                                        />

                                    </td>

                                    <td className="px-6 py-5 text-center">

                                        <Link

                                            to={`/students/${student._id}`}

                                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"

                                        >

                                            <FaEye />

                                            View

                                        </Link>

                                    </td>

                                    <RoleGuard roles={["admin"]}>

                                        <td className="px-6 py-5 text-center">

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

        </div>

    );

};

export default StudentTable;