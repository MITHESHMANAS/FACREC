import { useState, useEffect } from "react";
import { FaUser, FaIdCard, FaEnvelope } from "react-icons/fa";

const StudentForm = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        email: "",
        branch: "CSE",
        semester: "1",
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                rollNo: initialData.rollNo || "",
                email: initialData.email || "",
                branch: initialData.branch || "CSE",
                semester: initialData.semester ? String(initialData.semester) : "1",
                isActive: initialData.isActive ?? true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-slate-700 p-1">
            
            {/* Section Header */}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-normal mb-1">
                Personal Information
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Name</label>
                <div className="relative w-full">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
                    <input
                        type="text"
                        name="name"
                        required
                        disabled={loading}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full h-10 border border-slate-200 rounded-xl !pl-11 pr-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition"
                    />
                </div>
            </div>

            {/* Roll No Input */}
            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Roll No</label>
                <div className="relative w-full">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
                    <input
                        type="text"
                        name="rollNo"
                        required
                        disabled={loading}
                        value={formData.rollNo}
                        onChange={handleChange}
                        placeholder="e.g., 21CSE045"
                        className="w-full h-10 border border-slate-200 rounded-xl !pl-11 pr-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition"
                    />
                </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Email</label>
                <div className="relative w-full">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
                    <input
                        type="email"
                        name="email"
                        required
                        disabled={loading}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@college.edu"
                        className="w-full h-10 border border-slate-200 rounded-xl !pl-11 pr-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition"
                    />
                </div>
            </div>

            {/* Section Header */}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-normal mt-2 mb-1">
                Academic Details
            </div>

            {/* Branch and Semester Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600">Branch</label>
                    <select
                        name="branch"
                        disabled={loading}
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                    >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600">Semester</label>
                    <select
                        name="semester"
                        disabled={loading}
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={String(sem)}>
                                {sem}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Footer Button Group */}
            <div className="flex justify-end gap-3 pt-4 mt-3 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? "Saving..." : initialData ? "Save Changes" : "Add Student"}
                </button>
            </div>
        </form>
    );
};

export default StudentForm;