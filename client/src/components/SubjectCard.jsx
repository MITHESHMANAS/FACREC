import { FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

import RoleGuard from "./RoleGuard";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

const SubjectCard = ({ subject, onEdit, onDelete }) => {

    const attendancePct = subject.attendancePercentage ?? 0;

    // The backend only reports 0% when a subject has no *ended*
    // sessions yet - it can't be told apart from a genuine 0% once
    // sessions have run, because that breakdown isn't exposed by the
    // API. enrolledCount is the only real signal available client-side:
    // a subject with nobody enrolled definitely has no attendance data,
    // and given how rare a true 0% is, treating any 0% as "not started"
    // is the more honest read than flagging it as an alarming failure.
    const notStarted = attendancePct === 0;

    const attendanceColor =
        attendancePct >= 75
            ? "text-emerald-600"
            : attendancePct >= 50
                ? "text-amber-500"
                : "text-red-600";

    const barColor =
        attendancePct >= 75
            ? "bg-emerald-500"
            : attendancePct >= 50
                ? "bg-amber-400"
                : "bg-red-500";

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-6 flex flex-col gap-4">

            <div className="flex justify-between items-start">

                <div className="flex items-start gap-3 min-w-0">

                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FaBookOpen />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-800 leading-tight truncate">
                            {subject.name}
                        </h3>
                        <p className="text-xs font-semibold text-indigo-600 tracking-wide mt-0.5">
                            {subject.code}
                        </p>
                    </div>

                </div>

                <StatusBadge active={subject.isActive} />

            </div>

            <div className="flex gap-2 flex-wrap text-xs">

                <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                    Sem {subject.semester}
                </span>

                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                    {subject.branch}
                </span>

            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">

                <div className="flex items-center gap-2.5 text-sm">

                    <FaChalkboardTeacher className="text-slate-400 shrink-0" />

                    <span className="text-gray-500">
                        Faculty
                    </span>

                    <span className="font-medium text-slate-700 ml-auto truncate">
                        {subject.faculty || "Not Assigned"}
                    </span>

                </div>

                <div className="flex items-center gap-2.5 text-sm">

                    <FaUserGraduate className="text-slate-400 shrink-0" />

                    <span className="text-gray-500">
                        Enrolled Students
                    </span>

                    <span className="font-semibold text-indigo-600 ml-auto">
                        {subject.enrolledCount ?? 0}
                    </span>

                </div>

                <div>

                    <div className="flex items-center justify-between text-sm mb-1.5">

                        <span className="text-gray-500">
                            Attendance
                        </span>

                        {
                            notStarted
                                ?
                                <span className="text-slate-400 font-medium text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                    Not Started
                                </span>
                                :
                                <span className={`font-semibold ${attendanceColor}`}>
                                    {attendancePct}%
                                </span>
                        }

                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2">

                        {
                            !notStarted &&
                            <div
                                className={`h-2 rounded-full ${barColor}`}
                                style={{ width: `${Math.min(attendancePct, 100)}%` }}
                            />
                        }

                    </div>

                </div>

            </div>

            <RoleGuard roles={["admin"]}>

                <div className="border-t border-slate-100 pt-4 flex justify-end">

                    <ActionButtons
                        onEdit={() => onEdit(subject)}
                        onDelete={() => onDelete(subject)}
                    />

                </div>

            </RoleGuard>

        </div>

    );

};

export default SubjectCard;
