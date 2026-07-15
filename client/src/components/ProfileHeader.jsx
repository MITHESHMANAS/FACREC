import {
    FaUserGraduate,
    FaEnvelope,
    FaCodeBranch,
    FaLayerGroup,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";

const ProfileHeader = ({ student }) => {

    return (

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8">

            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">

                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center shrink-0">

                    <FaUserGraduate

                        size={34}

                        className="text-indigo-300"

                    />

                </div>

                <div className="flex-1">

                    <h1 className="text-2xl font-semibold tracking-tight">

                        {student.name}

                    </h1>

                    <p className="text-slate-400 text-sm mt-0.5">

                        Roll No: {student.rollNo}

                    </p>

                </div>

                <div
                    className={
                        `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur ` +
                        (student.faceDatasetId
                            ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                            : "bg-red-400/10 text-red-300 border border-red-400/20")
                    }
                >

                    {

                        student.faceDatasetId ? (

                            <FaCheckCircle />

                        ) : (

                            <FaTimesCircle />

                        )

                    }

                    {

                        student.faceDatasetId

                            ? "Dataset Registered"

                            : "Dataset Not Registered"

                    }

                </div>

            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">

                <div className="flex items-center gap-3">

                    <FaEnvelope className="text-slate-500" />

                    <div>

                        <p className="text-xs text-slate-500">Email</p>

                        <p className="text-sm font-medium text-slate-200 break-all">

                            {student.email}

                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <FaCodeBranch className="text-slate-500" />

                    <div>

                        <p className="text-xs text-slate-500">Branch</p>

                        <p className="text-sm font-medium text-slate-200">

                            {student.branch}

                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <FaLayerGroup className="text-slate-500" />

                    <div>

                        <p className="text-xs text-slate-500">Semester</p>

                        <p className="text-sm font-medium text-slate-200">

                            Semester {student.semester}

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default ProfileHeader;
