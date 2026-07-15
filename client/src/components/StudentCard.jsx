import {
    FaUserGraduate,
    FaEnvelope,
    FaCodeBranch,
    FaLayerGroup,
    FaEye,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import { Link } from "react-router-dom";

const StudentCard = ({

    student,

    onDelete

}) => {

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 hover:shadow-md transition duration-300 overflow-hidden">

            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 h-20 relative">

                <div className="absolute -bottom-8 left-6">

                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow">

                        <FaUserGraduate
                            className="text-indigo-600 text-3xl"
                        />

                    </div>

                </div>

            </div>

            <div className="pt-12 px-6 pb-6">

                <h2 className="text-2xl font-bold">

                    {student.name}

                </h2>

                <p className="text-gray-500">

                    Roll No : {student.rollNo}

                </p>

                <div className="space-y-3 mt-6">

                    <div className="flex items-center gap-3">

                        <FaEnvelope />

                        {student.email}

                    </div>

                    <div className="flex items-center gap-3">

                        <FaCodeBranch />

                        {student.branch}

                    </div>

                    <div className="flex items-center gap-3">

                        <FaLayerGroup />

                        Semester {student.semester}

                    </div>

                </div>

                <div className="grid grid-cols-3 gap-3 mt-8">

                    <Link

                        to={`/students/${student._id}`}

                        className="bg-indigo-600 text-white rounded-lg py-2 flex justify-center"

                    >

                        <FaEye />

                    </Link>

                    <button

                        className="bg-amber-500 text-white rounded-lg py-2"

                    >

                        <FaEdit />

                    </button>

                    <button

                        onClick={() => onDelete(student._id)}

                        className="bg-red-600 text-white rounded-lg py-2"

                    >

                        <FaTrash />

                    </button>

                </div>

            </div>

        </div>

    );

};

export default StudentCard;