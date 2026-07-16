import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AppLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        // 1️⃣ Outer container: full viewport height, no scrolling here
        <div className="flex h-screen w-full overflow-hidden bg-slate-50">
            {/* Sidebar – flex child, stretches to full height */}
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
            />

            {/* Right panel: takes remaining width, prevents overflow */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Navbar – stays fixed at top (not scrollable) */}
                <Navbar />

                {/* 2️⃣ Only this main content scrolls */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-[1500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;