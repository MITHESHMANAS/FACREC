import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaCalendarAlt,
    FaClipboardCheck,
    FaChartBar,
    FaSignOutAlt
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {

    const { logoutUser } = useAuth();

    const menus = [
        { name: "Dashboard", icon: <FaHome />, path: "/" },
        { name: "Students", icon: <FaUserGraduate />, path: "/students" },
        { name: "Faculty", icon: <FaChalkboardTeacher />, path: "/faculty" },
        { name: "Subjects", icon: <FaBook />, path: "/subjects" },
        { name: "Sessions", icon: <FaCalendarAlt />, path: "/sessions" },
        { name: "Attendance", icon: <FaClipboardCheck />, path: "/attendance" },
        { name: "Analytics", icon: <FaChartBar />, path: "/analytics" }
    ];

    return (

        <aside className="w-64 bg-slate-900 text-white min-h-screen">

            <div className="text-center py-6 text-3xl font-bold">
                FACREC
            </div>

            <nav className="flex flex-col">

                {
                    menus.map((item) => (

                        <NavLink
                            key={item.name}
                            to={item.path}
                            className="flex items-center gap-3 px-6 py-4 hover:bg-indigo-600"
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>

                    ))
                }

            </nav>

            <button
                onClick={logoutUser}
                className="flex items-center gap-3 px-6 py-4 mt-8 hover:bg-red-600 w-full"
            >
                <FaSignOutAlt />
                Logout
            </button>

        </aside>

    );

};

export default Sidebar;