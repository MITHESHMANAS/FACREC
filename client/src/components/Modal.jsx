import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, title, children, onClose }) => {

    useEffect(() => {

        if (!isOpen) return;

        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);

    }, [isOpen, onClose]);

    return (

        <AnimatePresence>
            {
                isOpen &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                >

                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >

                        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4 sticky top-0 bg-white rounded-t-[20px]">

                            <h2 className="text-lg font-bold text-slate-800">
                                {title}
                            </h2>

                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="p-6">
                            {children}
                        </div>

                    </motion.div>

                </motion.div>
            }
        </AnimatePresence>

    );

};

export default Modal;
