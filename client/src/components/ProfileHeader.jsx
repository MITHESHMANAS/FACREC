import {
    FaUserGraduate,
    FaEnvelope,
    FaCodeBranch,
    FaLayerGroup,
    FaCheckCircle,
    FaCalendarCheck
} from "react-icons/fa";

const ProfileHeader = ({ student, attendance }) => {

    return (

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 h-36 relative">

                <div className="absolute -bottom-14 left-8">

                    <div className="w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center">

                        <FaUserGraduate
                            size={50}
                            className="text-indigo-600"
                        />

                    </div>

                </div>

            </div>

            <div className="pt-20 pb-8 px-8">

                <div className="flex flex-col lg:flex-row justify-between">

                    <div>

                        <h1 className="text-3xl font-bold">

                            {student.name}

                        </h1>

                        <p className="text-gray-500 mt-1">

                            Roll No : {student.rollNo}

                        </p>

                    </div>

                    <div>

                        <span
                            className={`px-5 py-2 rounded-full text-white font-semibold ${
                                attendance.percentage >= 75
                                    ? "bg-green-600"
                                    : "bg-red-600"
                            }`}
                        >

                            {attendance.percentage}%

                        </span>

                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

                    <div className="border rounded-xl p-5">

                        <FaEnvelope
                            className="text-indigo-600 text-2xl mb-3"
                        />

                        <h2 className="font-semibold">

                            Email

                        </h2>

                        <p className="text-gray-500 break-all">

                            {student.email}

                        </p>

                    </div>

                    <div className="border rounded-xl p-5">

                        <FaCodeBranch
                            className="text-green-600 text-2xl mb-3"
                        />

                        <h2 className="font-semibold">

                            Branch

                        </h2>

                        <p className="text-gray-500">

                            {student.branch}

                        </p>

                    </div>

                    <div className="border rounded-xl p-5">

                        <FaLayerGroup
                            className="text-orange-500 text-2xl mb-3"
                        />

                        <h2 className="font-semibold">

                            Semester

                        </h2>

                        <p className="text-gray-500">

                            Semester {student.semester}

                        </p>

                    </div>

                    <div className="border rounded-xl p-5">

                        <FaCheckCircle
                            className="text-cyan-600 text-2xl mb-3"
                        />

                        <h2 className="font-semibold">

                            Dataset

                        </h2>

                        <p
                            className={
                                student.faceDatasetId
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            }
                        >

                            {student.faceDatasetId

                                ? "Registered"

                                : "Not Registered"}

                        </p>

                    </div>

                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

                    <div className="bg-indigo-50 rounded-xl p-5 text-center">

                        <FaCalendarCheck
                            className="mx-auto text-indigo-600 text-3xl mb-2"
                        />

                        <h2 className="text-3xl font-bold">

                            {attendance.total}

                        </h2>

                        <p className="text-gray-500">

                            Total Classes

                        </p>

                    </div>

                    <div className="bg-green-50 rounded-xl p-5 text-center">

                        <h2 className="text-3xl font-bold text-green-600">

                            {attendance.present}

                        </h2>

                        <p>

                            Present

                        </p>

                    </div>

                    <div className="bg-red-50 rounded-xl p-5 text-center">

                        <h2 className="text-3xl font-bold text-red-600">

                            {attendance.absent}

                        </h2>

                        <p>

                            Absent

                        </p>

                    </div>

                    <div className="bg-cyan-50 rounded-xl p-5 text-center">

                        <h2 className="text-3xl font-bold text-cyan-600">

                            {attendance.percentage}%

                        </h2>

                        <p>

                            Attendance

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default ProfileHeader;