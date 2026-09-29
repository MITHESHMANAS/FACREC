import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AppLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-100 p-3 gap-4">

            {/* Sidebar */}
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
            />

            {/* MAIN APPLICATION AREA */}
            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-sm
                "
            >
                <Navbar />

                {/* PAGE SCROLL AREA */}
                <main
                    className="
                        min-w-0
                        flex-1
                        overflow-x-hidden
                        overflow-y-auto
                        p-5
                        lg:p-6
                    "
                >
                    <div className="mx-auto w-full min-w-0 max-w-none">

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                className="min-w-0 w-full"
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