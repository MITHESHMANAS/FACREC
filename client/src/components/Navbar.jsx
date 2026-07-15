import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaSearch, FaBell, FaChevronRight, FaClock } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { ALL_NAV_ITEMS } from "../config/navConfig";
import socket from "../socket/socket";

const getPageTitle = (pathname) => {
    const exact = ALL_NAV_ITEMS.find((item) => item.path === pathname);
    if (exact) return exact.name;

    const base = "/" + pathname.split("/")[1];
    const match = ALL_NAV_ITEMS.find((item) => item.path === base);

    return match?.name || "FACREC";
};

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [socketConnected, setSocketConnected] = useState(socket.connected);
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const searchRef = useRef(null);
    const notifRef = useRef(null);

    const pageTitle = getPageTitle(location.pathname);

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000 * 30);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        const handleConnect = () => setSocketConnected(true);
        const handleDisconnect = () => setSocketConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const results = query.trim()
        ? ALL_NAV_ITEMS.filter((item) =>
            item.name.toLowerCase().includes(query.trim().toLowerCase())
        )
        : [];

    const goTo = (path) => {
        navigate(path);
        setQuery("");
        setSearchOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 flex items-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex w-full items-center justify-between gap-8">
                
                {/* Left group: Breadcrumb / title */}
                <div className="flex items-center gap-2 min-w-[260px]">
                    <span className="text-sm text-slate-400 hidden sm:inline">
                        FACREC
                    </span>
                    <FaChevronRight className="text-[10px] text-slate-300 hidden sm:inline" />
                    <h2 className="text-xl font-bold text-slate-800 truncate">
                        {pageTitle}
                    </h2>
                </div>

                {/* Middle group: Centered Search */}
                <div className="flex-1 min-w-0 flex items-center justify-center px-8">
                    <div className="relative hidden md:block w-full max-w-[420px]" ref={searchRef}>
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Jump to a page..."
                            className="w-full h-11 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-full !pl-12 !pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200"
                        />
                        <AnimatePresence>
                            {searchOpen && results.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute mt-3 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1"
                                >
                                    {results.map((item) => (
                                        <button
                                            key={item.path}
                                            onClick={() => goTo(item.path)}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-left"
                                        >
                                            <item.icon className="text-slate-400" />
                                            {item.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right group: Actions & Profile */}
                <div className="flex items-center gap-5 shrink-0">
                    
                    {/* Live status */}
                    <span
                        className={
                            `hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold ` +
                            (socketConnected
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-500")
                        }
                    >
                        <span
                            className={
                                `w-1.5 h-1.5 rounded-full ` +
                                (socketConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400")
                            }
                        />
                        {socketConnected ? "Live" : "Offline"}
                    </span>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setNotifOpen((o) => !o)}
                            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm transition"
                        >
                            <FaBell />
                        </button>
                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4"
                                >
                                    <p className="text-sm font-semibold text-slate-700">
                                        Notifications
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        You're all caught up - nothing new right now.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Clock */}
                    <div className="hidden md:flex items-center gap-3 pl-5 pr-2 border-l border-slate-200 text-slate-500">
                        <FaClock className="text-sm" />
                        <span className="text-sm font-medium tabular-nums">
                            {now.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="hidden lg:block leading-[1.15]">
                            <p className="text-sm font-semibold text-slate-700 truncate max-w-[11rem]">
                                {user?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                {user?.role}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};
