import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AppLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        // ⭐ p-4 gives outer margin, gap-6 separates sidebar & content
        <div className="flex h-screen bg-slate-100 p-4 gap-6 overflow-hidden">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
            />

            {/* Main panel – becomes a floating card */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-[1500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
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