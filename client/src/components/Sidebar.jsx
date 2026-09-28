import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaChevronLeft,
    FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { getNavGroups } from "../config/navConfig";
import getInitials from "../utils/getInitials";

const Sidebar = ({ collapsed, onToggle }) => {
    const { user, logoutUser } = useAuth();

    const groups = getNavGroups(user?.role, user?.id) || [];

    /*
     * Flatten all navigation groups.
     *
     * Before:
     *
     * OVERVIEW
     * Dashboard
     *
     * ACADEMICS
     * Students
     * Faculty
     * Subjects
     *
     * ATTENDANCE
     * Sessions
     * Attendance
     *
     * REPORTS
     * Reports
     *
     * Now:
     *
     * Dashboard
     * Students
     * Faculty
     * Subjects
     * Enrollments
     * Faculty Assignments
     * Sessions
     * Attendance
     * Recognition History
     * Reports
     */
    const navItems = groups.flatMap((group) => group.items || []);

    return (
        <motion.aside
            initial={false}
            animate={{
                width: collapsed ? 82 : 280,
            }}
            transition={{
                duration: 0.2,
                ease: "easeInOut",
            }}
            className="
                relative
                flex
                h-screen
                shrink-0
                flex-col
                overflow-hidden
                border-r
                border-slate-800/80
                bg-[#0B1220]
                text-white
            "
        >

            {/* =====================================================
                BRAND HEADER
            ====================================================== */}

            <div
                className="
                    relative
                    flex
                    h-[112px]
                    shrink-0
                    flex-col
                    justify-center
                    border-b
                    border-slate-800/80
                    px-6
                "
            >

                {!collapsed ? (
                    <div className="pr-14">

                        <h1
                            className="
                                text-[25px]
                                font-extrabold
                                leading-none
                                tracking-[-0.02em]
                                text-indigo-400
                            "
                        >
                            FACREC
                        </h1>

                        <p
                            className="
                                mt-2
                                text-[13px]
                                font-medium
                                tracking-wide
                                text-slate-400
                            "
                        >
                            Attendance Platform
                        </p>

                    </div>
                ) : (
                    <div
                        className="
                            flex
                            items-center
                            justify-center
                            text-xl
                            font-extrabold
                            text-indigo-400
                        "
                    >
                        F
                    </div>
                )}


                {/* =================================================
                    COLLAPSE BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="
                        absolute
                        right-5
                        top-1/2
                        flex
                        h-11
                        w-11
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-700
                        bg-slate-800/50
                        text-slate-400
                        shadow-sm
                        transition-all
                        duration-200
                        hover:border-slate-600
                        hover:bg-slate-700/70
                        hover:text-white
                    "
                >
                    <motion.div
                        animate={{
                            rotate: collapsed ? 180 : 0,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                    >
                        <FaChevronLeft className="text-sm" />
                    </motion.div>
                </button>

            </div>


            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <nav
                className="
                    flex-1
                    overflow-x-hidden
                    overflow-y-auto
                    px-3
                    py-5
                    scrollbar-thin
                    scrollbar-track-transparent
                    scrollbar-thumb-slate-700
                "
            >

                <div className="space-y-1.5">

                    {navItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) => `
                                group
                                relative
                                flex
                                h-11
                                items-center
                                rounded-xl
                                transition-all
                                duration-150
                                ${
                                    collapsed
                                        ? "justify-center px-0"
                                        : "px-3"
                                }
                                ${
                                    isActive
                                        ? "bg-indigo-500/[0.13] text-white"
                                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>

                                    {/* =================================
                                        ACTIVE INDICATOR
                                    ================================== */}

                                    {isActive && (
                                        <motion.div
                                            layoutId="facrec-sidebar-active"
                                            className="
                                                absolute
                                                left-0
                                                top-1/2
                                                h-7
                                                w-1
                                                -translate-y-1/2
                                                rounded-r-full
                                                bg-indigo-500
                                            "
                                        />
                                    )}


                                    {/* =================================
                                        ICON
                                    ================================== */}

                                    <div
                                        className="
                                            flex
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                        "
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={`
                                                    text-[18px]
                                                    transition-colors
                                                    duration-150
                                                    ${
                                                        isActive
                                                            ? "text-indigo-400"
                                                            : "text-slate-500 group-hover:text-slate-300"
                                                    }
                                                `}
                                            />
                                        )}
                                    </div>


                                    {/* =================================
                                        LABEL
                                    ================================== */}

                                    {!collapsed && (
                                        <span
                                            className="
                                                ml-3
                                                truncate
                                                text-[14px]
                                                font-medium
                                                tracking-[-0.01em]
                                            "
                                        >
                                            {item.name}
                                        </span>
                                    )}

                                </>
                            )}
                        </NavLink>

                    ))}

                </div>

            </nav>


            {/* =====================================================
                SIDEBAR FOOTER
            ====================================================== */}

            <div
                className="
                    shrink-0
                    border-t
                    border-slate-800/80
                    px-4
                    py-4
                "
            >

                {/* ================================================
                    USER CARD
                ================================================= */}

                {!collapsed && (
                    <div
                        className="
                            mb-3
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-900/50
                            px-3
                            py-2.5
                        "
                    >

                        {/* Avatar */}

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-500/15
                                text-sm
                                font-bold
                                text-indigo-300
                                ring-1
                                ring-indigo-500/20
                            "
                        >
                            {getInitials(user?.name)}
                        </div>


                        {/* User details */}

                        <div className="min-w-0">

                            <p
                                className="
                                    truncate
                                    text-[13px]
                                    font-semibold
                                    text-slate-100
                                "
                            >
                                {user?.name || "System Admin"}
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                "
                            >
                                {user?.role || "ADMIN"}
                            </p>

                        </div>

                    </div>
                )}


                {/* ================================================
                    COLLAPSED AVATAR
                ================================================= */}

                {collapsed && (
                    <div
                        className="
                            mb-3
                            flex
                            justify-center
                        "
                    >
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-500/15
                                text-sm
                                font-bold
                                text-indigo-300
                                ring-1
                                ring-indigo-500/20
                            "
                        >
                            {getInitials(user?.name)}
                        </div>
                    </div>
                )}


                {/* ================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
                    onClick={logoutUser}
                    aria-label="Logout"
                    className="
                        group
                        flex
                        h-10
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        text-slate-400
                        transition-all
                        duration-150
                        hover:bg-slate-800/70
                        hover:text-slate-100
                    "
                >

                    <FaSignOutAlt
                        className="
                            text-sm
                            text-slate-500
                            transition-colors
                            duration-150
                            group-hover:text-slate-300
                        "
                    />

                    {!collapsed && (
                        <span
                            className="
                                text-[13px]
                                font-medium
                            "
                        >
                            Logout
                        </span>
                    )}

                </button>


                {/* ================================================
                    VERSION
                ================================================= */}

                {!collapsed && (
                    <p
                        className="
                            mt-3
                            text-center
                            text-[9px]
                            font-medium
                            tracking-[0.14em]
                            text-slate-600
                        "
                    >
                        FACREC v2.0
                    </p>
                )}

            </div>

        </motion.aside>
    );
};

export default Sidebar;