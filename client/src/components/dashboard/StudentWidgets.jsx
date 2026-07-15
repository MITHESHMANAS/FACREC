import {
    FaUserGraduate,
    FaClipboardCheck,
    FaBook,
    FaCheckCircle
} from "react-icons/fa";

import KpiCard from "../ui/KpiCard";

const StudentWidgets = ({ stats }) => {

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <KpiCard
                index={0}
                title="Overall Attendance %"
                value={`${stats.attendancePercentage ?? 0}%`}
                icon={FaClipboardCheck}
                tone="emerald"
            />

            <KpiCard
                index={1}
                title="Subjects"
                value={stats.subjects}
                icon={FaBook}
                tone="indigo"
            />

            <KpiCard
                index={2}
                title="Status"
                value="ACTIVE"
                icon={FaCheckCircle}
                tone="emerald"
            />

            <KpiCard
                index={3}
                title="Profile"
                value="VIEW"
                icon={FaUserGraduate}
                tone="amber"
            />

        </div>

    );

};

export default StudentWidgets;
