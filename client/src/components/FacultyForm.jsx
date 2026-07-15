import { useState, useEffect } from "react";

const FacultyForm = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: "",
        employeeId: "",
        email: "",
        department: "",
        designation: "",
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                employeeId: initialData.employeeId || "",
                email: initialData.email || "",
                department: initialData.department || "",
                designation: initialData.designation || "",
                isActive: initialData.isActive ?? true,
            });
        } else {
            setFormData({
                name: "",
                employeeId: "",
                email: "",
                department: "",
                designation: "",
                isActive: true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-slate-700 p-1">
            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Employee ID</label>
                <input
                    type="text"
                    name="employeeId"
                    required
                    disabled={!!initialData || loading}
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g., FAC-003"
                    className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Full Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Dr. Rajesh Kumar"
                    className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Email Address</label>
                <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@facrec.edu"
                    className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600">Department</label>
                    <input
                        type="text"
                        name="department"
                        required
                        disabled={loading}
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                        className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600">Designation</label>
                    <input
                        type="text"
                        name="designation"
                        required
                        disabled={loading}
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Assistant Professor"
                        className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 py-1">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    disabled={loading}
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-50"
                />
                <label htmlFor="isActive" className="font-medium text-slate-600 select-none">
                    Active Status (Permit system logins)
                </label>
            </div>

            {/* Resolved clipping overflow by using items-center and cleaning vertical margin boundaries */}
            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? "Saving..." : initialData ? "Update Account" : "Register Faculty"}
                </button>
            </div>
        </form>
    );
};

export default FacultyForm;