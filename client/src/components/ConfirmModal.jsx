import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
    isOpen,
    title = "Confirm",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onClose
}) => {

    useEffect(() => {

        if (!isOpen) return;

        const handleKey = (e) => {
            if (e.key === "Escape" && !loading) onClose();
        };

        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);

    }, [isOpen, loading, onClose]);

    return (

        <AnimatePresence>
            {
                isOpen &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => !loading && onClose()}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                >

                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[20px] shadow-2xl w-full max-w-md"
                    >

                        <div className="p-6">

                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl mb-4">
                                <FaExclamationTriangle />
                            </div>

                            <h2 className="text-lg font-bold text-slate-800">
                                {title}
                            </h2>

                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                {message}
                            </p>

                            <div className="flex justify-end gap-3 mt-7">

                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-[14px] border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {cancelText}
                                </button>

                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-[14px] bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2"
                                >
                                    {
                                        loading &&
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    }
                                    {loading ? "Deleting..." : confirmText}
                                </button>

                            </div>

                        </div>

                    </motion.div>

                </motion.div>
            }
        </AnimatePresence>

    );

};

export default ConfirmModal;
