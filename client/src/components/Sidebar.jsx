import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaCalendarAlt,
    FaClipboardCheck,
    FaChartBar,
    FaFilePdf,
    FaCamera,
    FaSignOutAlt
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {

    const { logoutUser } = useAuth();

    const menus = [

        {
            name: "Dashboard",
            icon: <FaHome />,
            path: "/"
        },

        {
            name: "Students",
            icon: <FaUserGraduate />,
            path: "/students"
        },

        {
            name: "Faculty",
            icon: <FaChalkboardTeacher />,
            path: "/faculty"
        },

        {
            name: "Subjects",
            icon: <FaBook />,
            path: "/subjects"
        },

        {
            name: "Sessions",
            icon: <FaCalendarAlt />,
            path: "/sessions"
        },

        {
            name: "Attendance",
            icon: <FaClipboardCheck />,
            path: "/attendance"
        },

        {
            name: "Recognition",
            icon: <FaCamera />,
            path: "/recognition"
        },

        {
            name: "Analytics",
            icon: <FaChartBar />,
            path: "/analytics"
        },

        {
            name: "Reports",
            icon: <FaFilePdf />,
            path: "/reports"
        }

    ];

    return (

        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-2xl">

            <div className="py-8 text-center border-b border-slate-700">

                <h1 className="text-3xl font-extrabold tracking-wide">

                    FACREC

                </h1>

                <p className="text-sm text-slate-400 mt-2">

                    Enterprise Edition

                </p>

            </div>

            <nav className="flex-1 py-4">

                {

                    menus.map((item) => (

                        <NavLink

                            key={item.name}

                            to={item.path}

                            className={({ isActive }) =>

                                `flex items-center gap-4 px-6 py-4 mx-3 rounded-xl transition-all duration-300

                                ${

                                    isActive

                                        ? "bg-indigo-600 text-white shadow-lg"

                                        : "hover:bg-slate-800 text-slate-300"

                                }`

                            }

                        >

                            <span className="text-lg">

                                {item.icon}

                            </span>

                            <span className="font-medium">

                                {item.name}

                            </span>

                        </NavLink>

                    ))

                }

            </nav>

            <div className="border-t border-slate-700 p-4">

                <button

                    onClick={logoutUser}

                    className="flex items-center justify-center gap-3 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"

                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </aside>

    );

};

export default Sidebar;