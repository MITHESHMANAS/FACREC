import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getFaculty } from "../services/facultyService";

const SubjectForm = ({ initialData, onSubmit, loading }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        branch: "CSE",
        semester: "1",
        faculty: "",
        isActive: true
    });

    useEffect(() => {
        const fetchFacultyList = async () => {
            try {
                const data = await getFaculty();
                setFacultyList(data.faculty || []);
            } catch {
                toast.error("Failed to populate faculty assignment parameters");
            }
        };
        fetchFacultyList();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                code: initialData.code || "",
                branch: initialData.branch || "CSE",
                semester: initialData.semester ? String(initialData.semester) : "1",
                faculty: initialData.faculty?._id || initialData.faculty || "",
                isActive: initialData.isActive ?? true
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-slate-700 p-1">
            
            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Course Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Operating Systems"
                    className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Course Code</label>
                <input
                    type="text"
                    name="code"
                    required
                    disabled={loading}
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., CS401"
                    className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition uppercase"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600">Branch</label>
                    <input
                        type="text"
                        name="branch"
                        required
                        disabled={loading}
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="e.g., CSE"
                        className="h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition uppercase"
                    />
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
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={String(s)}>Semester {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Assign Faculty</label>
                <select
                    name="faculty"
                    disabled={loading}
                    value={formData.faculty}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition"
                >
                    <option value="">Select Faculty Member</option>
                    {facultyList.map(fac => (
                        <option key={fac._id} value={fac._id}>
                            {fac.name} ({fac.employeeId})
                        </option>
                    ))}
                </select>
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
                    Active Curriculum Status
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? "Saving..." : initialData ? "Update Subject" : "Create Subject"}
                </button>
            </div>
        </form>
    );
};

export default SubjectForm;