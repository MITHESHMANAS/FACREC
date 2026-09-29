import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getNavGroups } from "../config/navConfig";
import getInitials from "../utils/getInitials";

/*
  Sizing is driven by viewport HEIGHT (clamp + vh) so the whole menu
  always fits on screen with no inner scrolling - from a 600px laptop
  window up to a 4K monitor. Non-essential chrome (group titles,
  version tag, role line) drops away on short screens before anything
  would ever need to scroll.
*/

const Sidebar = ({ collapsed, onToggle }) => {
    const { user, logoutUser } = useAuth();
    const groups = getNavGroups(user?.role, user?.id) || [];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 76 : 272 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full shrink-0 flex-col overflow-hidden rounded-3xl bg-[#0B1120] text-white shadow-2xl"
        >
            {/* ---------------- Header ---------------- */}
            <div
                className={`flex shrink-0 items-center border-b border-slate-800/80 py-[clamp(0.5rem,2.2vh,1.5rem)] ${
                    collapsed ? "justify-center px-3" : "justify-between px-5"
                }`}
            >
                {!collapsed && (
                    <div className="min-w-0">
                        <h1 className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-[clamp(1.25rem,3vh,1.5rem)] font-extrabold leading-none tracking-tight text-transparent">
                            FACREC
                        </h1>
                        <p className="mt-1 truncate text-[clamp(0.7rem,1.6vh,0.8125rem)] text-slate-400">
                            Attendance Platform
                        </p>
                    </div>
                )}

                <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 transition-all duration-200 hover:scale-105 hover:bg-slate-700"
                >
                    <motion.span
                        animate={{ rotate: collapsed ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex"
                    >
                        <FaChevronLeft className="text-xs text-slate-300" />
                    </motion.span>
                </button>
            </div>

            {/* ---------------- Navigation ---------------- */}
            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-[clamp(0.25rem,1.2vh,0.75rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {groups.map((group, gi) => (
                    <div
                        key={group.label}
                        className={`flex min-h-0 shrink flex-col ${gi === 0 ? "" : "mt-[clamp(0.125rem,1.1vh,1rem)]"}`}
                    >
                        {!collapsed && (
                            <p className="mb-1 shrink-0 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500/80 [@media(max-height:720px)]:hidden">
                                {group.label}
                            </p>
                        )}

                        <div className="flex min-h-0 shrink flex-col gap-0.5">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    title={collapsed ? item.name : undefined}
                                    className={({ isActive }) =>
                                        `relative flex h-11 min-h-7 shrink items-center rounded-xl text-sm transition-colors duration-200 ${
                                            collapsed ? "justify-center" : "gap-3.5 px-3"
                                        } ${
                                            isActive
                                                ? "bg-indigo-500/15 text-white"
                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <motion.span
                                                    layoutId="activeBar"
                                                    className="absolute left-0 top-1/2 h-[55%] w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 shadow-lg shadow-indigo-500/60"
                                                />
                                            )}
                                            <item.icon
                                                className={`shrink-0 text-[17px] transition-colors ${
                                                    isActive ? "text-indigo-400" : "text-slate-400"
                                                }`}
                                            />
                                            {!collapsed && (
                                                <span className="truncate font-medium">
                                                    {item.name}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ---------------- Footer ---------------- */}
            <div className="shrink-0 border-t border-slate-800/80 px-3 py-[clamp(0.375rem,1.4vh,1rem)]">
                {!collapsed ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/60 to-slate-800/20 p-[clamp(0.375rem,1.2vh,0.75rem)]">
                        <div className="flex h-[clamp(1.75rem,4.4vh,2.5rem)] w-[clamp(1.75rem,4.4vh,2.5rem)] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold shadow-lg shadow-indigo-500/30">
                            {getInitials(user?.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-tight">
                                {user?.name || "User"}
                            </p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div
                        title={user?.name}
                        className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold shadow-lg shadow-indigo-500/30"
                    >
                        {getInitials(user?.name)}
                    </div>
                )}

                <button
                    onClick={logoutUser}
                    title={collapsed ? "Logout" : undefined}
                    className="mt-[clamp(0.125rem,0.8vh,0.5rem)] flex h-[clamp(1.75rem,4.2vh,2.5rem)] w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                    <FaSignOutAlt className="text-sm" />
                    {!collapsed && "Logout"}
                </button>

                {!collapsed && (
                    <p className="mt-1 text-center text-[10px] font-light tracking-wider text-slate-500/70 [@media(max-height:760px)]:hidden">
                        FACREC v2.0
                    </p>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;