import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaClipboardCheck
} from "react-icons/fa";

import KpiCard from "../ui/KpiCard";

const AdminWidgets = ({ stats }) => {

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <KpiCard
                index={0}
                title="Students"
                value={stats.students}
                subtitle="Active enrollment"
                icon={FaUserGraduate}
                tone="indigo"
            />

            <KpiCard
                index={1}
                title="Faculty"
                value={stats.faculty}
                subtitle="Active this term"
                icon={FaChalkboardTeacher}
                tone="emerald"
            />

            <KpiCard
                index={2}
                title="Subjects"
                value={stats.subjects}
                subtitle="Current semester"
                icon={FaBook}
                tone="amber"
            />

            <KpiCard
                index={3}
                title="Overall Attendance %"
                value={`${stats.attendancePercentage ?? 0}%`}
                subtitle="Across all ended sessions"
                icon={FaClipboardCheck}
                tone="blue"
            />

        </div>

    );

};

export default AdminWidgets;
