import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

/**
 * The one page shell the whole app should use. Every page previously
 * hand-rolled `<div className="flex min-h-screen bg-slate-100">
 * <Sidebar /><div className="flex-1"><Navbar />...` - this is that
 * markup, once, with the sidebar's collapsed state lifted up here so
 * it doesn't reset when navigating between pages.
 */
const AppLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen w-full bg-slate-100 overflow-x-hidden">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
            />

            {/* 
              * FIXED: Added max-w-full and overflow-hidden to enforce 
              * structural boundaries and prevent deep-nested flex items 
              * (like the search input and user block) from stretching the page.
              */}
            <div className="flex flex-1 min-w-0 flex-col max-w-full overflow-hidden">
                <Navbar />

                <main className="flex-1 px-8 py-8 lg:px-10 lg:py-8">
                    <div className="mx-auto w-full max-w-[1500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut"
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