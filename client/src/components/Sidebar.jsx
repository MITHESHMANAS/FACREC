import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getNavGroups } from "../config/navConfig";
import getInitials from "../utils/getInitials";

const Sidebar = ({ collapsed, onToggle }) => {
    const { user, logoutUser } = useAuth();
    const groups = getNavGroups(user?.role, user?.id) || [];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 84 : 272 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            // ⭐ ONE CHANGE: pl-6 on the sidebar itself
            className="relative flex h-screen flex-col bg-[#0B1120] text-white shadow-2xl overflow-hidden pl-6"
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute right-4 top-8 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 transition-all duration-200 hover:bg-slate-700 hover:scale-105"
            >
                <motion.div
                    animate={{ rotate: collapsed ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <FaChevronLeft className="text-xs text-slate-300" />
                </motion.div>
            </button>

            {/* Logo – REMOVED pl-24, just pr-6 */}
            <div className="pr-6 py-6 border-b border-slate-800/80">
                {!collapsed && (
                    <>
                        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                            FACREC
                        </h1>
                        <p className="mt-1 text-sm text-slate-400 font-light">
                            Attendance Platform
                        </p>
                    </>
                )}
            </div>

            {/* Navigation – unchanged vertical distribution */}
            <nav className="flex-1 overflow-y-auto px-0 py-6 flex flex-col justify-evenly">
                {groups.map((group) => (
                    <div key={group.label} className="flex flex-col">
                        {!collapsed && (
                            // Section title – REMOVED pl-24
                            <p className="pr-6 mb-6 text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
                                {group.label}
                            </p>
                        )}
                        <div className="flex flex-col gap-6 w-full">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={({ isActive }) =>
                                        // REMOVED pl-24, kept all other classes
                                        `relative flex items-center gap-4 pr-6 py-6 text-sm transition-all duration-200 w-full ${
                                            isActive
                                                ? "text-white bg-slate-800/60"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Active indicator – stays at left-0 */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeBar"
                                                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
                                                />
                                            )}
                                            <item.icon
                                                className={`text-lg shrink-0 transition-colors ${
                                                    isActive ? "text-indigo-400" : "text-slate-400"
                                                }`}
                                            />
                                            {!collapsed && (
                                                <span className="font-medium">{item.name}</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer – REMOVED pl-24 */}
            <div className="shrink-0 pr-6 py-6 border-t border-slate-800/80 bg-[#0B1120]">
                {!collapsed && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/20 p-4 backdrop-blur-sm border border-slate-700/30 shadow-lg">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/30">
                            {getInitials(user?.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm">{user?.name}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={logoutUser}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-4 font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                >
                    <FaSignOutAlt className="text-sm" />
                    {!collapsed && "Logout"}
                </button>
                {!collapsed && (
                    <p className="mt-5 text-center text-[10px] font-light tracking-wider text-slate-500/70">
                        FACREC v2.0
                    </p>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;