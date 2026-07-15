import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaChevronLeft, FaBolt } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { getNavGroups } from "../config/navConfig";
import getInitials from "../utils/getInitials";

const Sidebar = ({ collapsed, onToggle }) => {

    const { user, logoutUser } = useAuth();
    const [hoveredPath, setHoveredPath] = useState(null);

    const groups = getNavGroups(user?.role, user?.id);

    return (

        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 84 : 272 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="relative bg-slate-900 text-white min-h-screen sticky top-0 flex flex-col shadow-2xl shrink-0 overflow-hidden"
        >

            {/* Collapse toggle */}

            <button
                onClick={onToggle}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="absolute right-3 top-9 z-20 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-transform"
            >
                <motion.span
                    animate={{ rotate: collapsed ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    className="text-[10px]"
                >
                    <FaChevronLeft />
                </motion.span>
            </button>

            {/* Logo */}

            <div className="py-7 border-b border-slate-800 flex items-center justify-center gap-2 px-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0">
                    <FaBolt className="text-sm" />
                </div>
                {
                    !collapsed &&
                    <div className="overflow-hidden">
                        <h1 className="text-lg font-extrabold tracking-wide leading-none whitespace-nowrap">
                            FACREC
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-1 whitespace-nowrap">
                            Attendance Platform
                        </p>
                    </div>
                }
            </div>

            {/* User */}

            <div className={`border-b border-slate-800 ${collapsed ? "px-3 py-4" : "px-5 py-5"}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {getInitials(user?.name)}
                    </div>
                    {
                        !collapsed &&
                        <div className="overflow-hidden">
                            <h3 className="font-semibold text-sm truncate">
                                {user?.name}
                            </h3>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-700/60 text-[10px] font-semibold uppercase tracking-wide">
                                {user?.role}
                            </span>
                        </div>
                    }
                </div>
            </div>

            {/* Navigation */}

            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
                {
                    groups.map((group) => (
                        <div key={group.label} className="mb-4">
                            {
                                !collapsed &&
                                <p className="px-5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {group.label}
                                </p>
                            }
                            {
                                group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === "/"}
                                        title={collapsed ? item.name : undefined}
                                        onMouseEnter={() => setHoveredPath(item.path)}
                                        onMouseLeave={() => setHoveredPath(null)}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 mx-3 my-0.5 px-3.5 py-2.5 rounded-lg text-sm transition-colors duration-150 ` +
                                            (isActive
                                                ? "bg-indigo-600/90 text-white font-medium"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white")
                                        }
                                    >
                                        <span className="text-base shrink-0">
                                            <item.icon />
                                        </span>
                                        {
                                            !collapsed &&
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                {item.name}
                                            </span>
                                        }
                                        {
                                            collapsed && hoveredPath === item.path &&
                                            <span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg z-30">
                                                {item.name}
                                            </span>
                                        }
                                    </NavLink>
                                ))
                            }
                        </div>
                    ))
                }
            </nav>

            {/* Footer */}

            <div className={`border-t border-slate-800 ${collapsed ? "p-3" : "p-4"}`}>
                <button
                    onClick={logoutUser}
                    title="Logout"
                    className="w-full bg-red-600/90 hover:bg-red-600 transition-colors rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                    <FaSignOutAlt />
                    {!collapsed && "Logout"}
                </button>
                {
                    !collapsed &&
                    <p className="text-center text-[10px] text-slate-600 mt-3">
                        FACREC v2.0
                    </p>
                }
            </div>

        </motion.aside>

    );

};

export default Sidebar;
