import {
    FaHome,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaCalendarAlt,
    FaClipboardCheck,
    FaChartBar,
    FaFilePdf,
    FaUser,
    FaHistory,
    FaLayerGroup,
    FaUserCheck
} from "react-icons/fa";

const NAV_GROUPS = {

    admin: [
        {
            label: "Overview",
            items: [
                { name: "Dashboard", icon: FaHome, path: "/" }
            ]
        },
        {
            label: "Academics",
            items: [
                { name: "Students", icon: FaUserGraduate, path: "/students" },
                { name: "Faculty", icon: FaChalkboardTeacher, path: "/faculty" },
                { name: "Subjects", icon: FaBook, path: "/subjects" },
                { name: "Enrollments", icon: FaLayerGroup, path: "/enrollments" },
                { name: "Faculty Assignments", icon: FaUserCheck, path: "/faculty-assignments" }
            ]
        },
        {
            label: "Attendance",
            items: [
                { name: "Sessions", icon: FaCalendarAlt, path: "/sessions" },
                { name: "Attendance", icon: FaClipboardCheck, path: "/attendance" },
                { name: "Recognition History", icon: FaHistory, path: "/recognition-history" }
            ]
        },
        {
            label: "Insights",
            items: [
                { name: "Analytics", icon: FaChartBar, path: "/analytics" },
                { name: "Reports", icon: FaFilePdf, path: "/reports" }
            ]
        }
    ],

    faculty: [
        {
            label: "Overview",
            items: [
                { name: "Dashboard", icon: FaHome, path: "/" }
            ]
        },
        {
            label: "Attendance",
            items: [
                { name: "Attendance", icon: FaClipboardCheck, path: "/attendance" },
                { name: "Recognition History", icon: FaHistory, path: "/recognition-history" }
            ]
        },
        {
            label: "Insights",
            items: [
                { name: "Reports", icon: FaFilePdf, path: "/reports" }
            ]
        }
    ],

    student: (userId) => [
        {
            label: "Overview",
            items: [
                { name: "Dashboard", icon: FaHome, path: "/" },
                { name: "My Profile", icon: FaUser, path: `/students/${userId}` }
            ]
        },
        {
            label: "Insights",
            items: [
                { name: "Reports", icon: FaFilePdf, path: "/reports" }
            ]
        }
    ]

};

export const getNavGroups = (role, userId) => {

    if (role === "faculty") return NAV_GROUPS.faculty;
    if (role === "student") return NAV_GROUPS.student(userId);

    return NAV_GROUPS.admin;

};

export const ALL_NAV_ITEMS = NAV_GROUPS.admin.flatMap(group => group.items);

export default NAV_GROUPS;