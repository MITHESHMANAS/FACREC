import {
    FaCalendarAlt,
    FaClipboardCheck,
    FaUsers
} from "react-icons/fa";

import KpiCard from "../ui/KpiCard";

const FacultyWidgets = ({ stats }) => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <KpiCard
                index={0}
                title="Today's Sessions"
                // Force a 0 if stats.sessions is null, undefined, or empty
                value={stats.sessions ?? 0}
                icon={FaCalendarAlt}
                tone="indigo"
            />

            <KpiCard
                index={1}
                title="Overall Attendance %"
                // Keep the existing logic or force 0
                value={`${stats.attendancePercentage ?? 0}%`}
                icon={FaClipboardCheck}
                tone="emerald"
            />

            <KpiCard
                index={2}
                title="Students"
                // Force a 0 if stats.students is null, undefined, or empty
                value={stats.students ?? 0}
                icon={FaUsers}
                tone="red"
            />

        </div>
    );
};

export default FacultyWidgets;