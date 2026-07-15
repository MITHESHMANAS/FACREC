import {
    FaCalendarAlt,
    FaClipboardCheck,
    FaCamera,
    FaUsers
} from "react-icons/fa";

import KpiCard from "../ui/KpiCard";

const FacultyWidgets = ({ stats }) => {

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <KpiCard
                index={0}
                title="Today's Sessions"
                value={stats.sessions}
                icon={FaCalendarAlt}
                tone="indigo"
            />

            <KpiCard
                index={1}
                title="Overall Attendance %"
                value={`${stats.attendancePercentage ?? 0}%`}
                icon={FaClipboardCheck}
                tone="emerald"
            />

            <KpiCard
                index={2}
                title="Recognition"
                value="ONLINE"
                icon={FaCamera}
                tone="amber"
            />

            <KpiCard
                index={3}
                title="Students"
                value={stats.students}
                icon={FaUsers}
                tone="red"
            />

        </div>

    );

};

export default FacultyWidgets;
