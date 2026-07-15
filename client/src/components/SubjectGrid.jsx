import { useEffect, useState } from "react";
import { FaInbox, FaUserTie, FaGraduationCap, FaEdit, FaTrash } from "react-icons/fa";
import RoleGuard from "./RoleGuard";
import EmptyState from "./ui/EmptyState";
import { getFaculty } from "../services/facultyService";

const SubjectGrid = ({ subjects, onEdit, onDelete }) => {
    const [facultyMap, setFacultyMap] = useState({});

    // Fetch the faculty directory to match raw IDs against real names
    useEffect(() => {
        const loadFacultyMapping = async () => {
            try {
                const data = await getFaculty();
                const list = data.faculty || [];
                const mapping = {};
                list.forEach(fac => {
                    if (fac._id) mapping[fac._id] = fac.name;
                });
                setFacultyMap(mapping);
            } catch (err) {
                console.error("Failed to fetch faculty names for ID matching", err);
            }
        };
        loadFacultyMapping();
    }, []);

    if (subjects.length === 0) {
        return (
            <EmptyState
                icon={FaInbox}
                title="No subjects found"
                message="Try tweaking your search parameters or register a new course."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {subjects.map((sub) => {
                const attendancePct = sub.attendancePercentage ?? null;

                // 1. Check if populated object
                // 2. Check if raw ID matches our loaded faculty map
                // 3. Fall back to the raw value
                let displayFaculty = "Unassigned";
                if (typeof sub.faculty === "object" && sub.faculty?.name) {
                    displayFaculty = sub.faculty.name;
                } else if (typeof sub.faculty === "string" && sub.faculty.trim() !== "") {
                    displayFaculty = facultyMap[sub.faculty] || sub.faculty;
                }

                return (
                    <div 
                        key={sub._id} 
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[220px]"
                    >
                        <div>
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-slate-800 truncate" title={sub.name}>
                                        {sub.name}
                                    </h3>
                                    <span className="text-xs font-bold text-indigo-600 block mt-0.5 uppercase">
                                        {sub.code}
                                    </span>
                                </div>
                                <span className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                                    sub.isActive !== false 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}>
                                    {sub.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold">
                                <span className="bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                                    Sem {sub.semester}
                                </span>
                                <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase">
                                    {sub.branch}
                                </span>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <FaUserTie className="text-slate-400 text-xs shrink-0" />
                                    <span className="truncate">
                                        Faculty: <strong className="text-slate-700 font-semibold">{displayFaculty}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaGraduationCap className="text-slate-400 text-xs shrink-0" />
                                    <span>
                                        Enrolled Students: <strong className="text-slate-700 font-semibold tabular-nums">{sub.enrolledCount ?? sub.enrolledStudents?.length ?? 0}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-normal">Attendance Status</p>
                                <p className={`text-sm font-bold mt-0.5 ${attendancePct !== null ? "text-slate-800 tabular-nums" : "text-slate-400 font-semibold"}`}>
                                    {attendancePct !== null ? `${attendancePct}%` : "Not Started"}
                                </p>
                            </div>

                            <RoleGuard roles={["admin"]}>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={() => onEdit(sub)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-center transition shadow-sm"
                                        title="Edit Subject"
                                    >
                                        <FaEdit className="text-xs" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(sub)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
                                        title="Delete Subject"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            </RoleGuard>
                        </div>

                    </div>
                );
            })}
        </div>
    );
};

export default SubjectGrid;