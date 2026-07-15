import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import { useForm } from "react-hook-form";
import { FaChalkboardTeacher, FaBook, FaCalendarAlt, FaPlus, FaUserCheck, FaSyncAlt, FaClipboardList } from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import SearchBar from "../components/SearchBar";
import ConfirmModal from "../components/ConfirmModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormSelect from "../components/ui/FormSelect";
import FormInput from "../components/ui/FormInput";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import SortableTh from "../components/ui/SortableTh";
import useDataTable from "../hooks/useDataTable";
import KpiCard from "../components/ui/KpiCard";

import { getFaculty } from "../services/facultyService";
import { getSubjects } from "../services/masterDataService";
import {
    getAssignments,
    assignSubject,
    removeAssignment
} from "../services/facultySubjectService";

const getSortValue = (a, field) => {
    switch (field) {
        case "faculty": return a.faculty?.name?.toLowerCase();
        case "department": return a.faculty?.department?.toLowerCase();
        case "subject": return a.subject?.name?.toLowerCase();
        case "year": return a.academicYear;
        default: return null;
    }
};

const FacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [removingAssignment, setRemovingAssignment] = useState(null);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            faculty: "",
            subject: "",
            academicYear: "2025-26"
        }
    });

    const loadAll = async () => {
        try {
            setLoading(true);
            const [assignmentData, facultyData, subjectData] =
                await Promise.all([
                    getAssignments(),
                    getFaculty(),
                    getSubjects()
                ]);

            setAssignments(assignmentData.assignments || []);
            setFaculty(facultyData.faculty || []);
            setSubjects(subjectData || []);
        } catch {
            toast.error("Failed to load faculty assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const onAssign = async (formValues) => {
        try {
            setSaving(true);
            await assignSubject({
                faculty: formValues.faculty,
                subject: formValues.subject,
                academicYear: formValues.academicYear || null
            });

            toast.success("Subject assigned to faculty");
            reset({ faculty: "", subject: "", academicYear: "2025-26" });
            loadAll();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Unable to assign subject"
            );
        } finally {
            setSaving(false);
        }
    };

    const confirmRemove = async () => {
        try {
            setSaving(true);
            await removeAssignment(removingAssignment._id);
            toast.success("Assignment removed");
            setRemovingAssignment(null);
            loadAll();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Unable to remove assignment"
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredAssignments = assignments.filter((a) => {
        const text = search.toLowerCase();
        return (
            a.faculty?.name?.toLowerCase().includes(text) ||
            a.faculty?.department?.toLowerCase().includes(text) ||
            a.subject?.name?.toLowerCase().includes(text) ||
            a.subject?.code?.toLowerCase().includes(text)
        );
    });

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(filteredAssignments, { pageSize: 8, getSortValue });

    const uniqueFacultyCount = Array.from(new Set(assignments.map(a => a.faculty?._id).filter(Boolean))).length;

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-2">
                
                {/* 1. Header Information Area */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Faculty Subject Assignments
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Control which subjects a faculty member is allowed to start attendance sessions for.
                    </p>
                </div>

                {/* 2. Top Split Dashboard View Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch w-full">
                    
                    {/* Metrics Cards Container Block */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                        <KpiCard
                            index={0}
                            title="Total Active Mappings"
                            value={assignments.length}
                            icon={FaClipboardList}
                            tone="indigo"
                        />
                        <KpiCard
                            index={1}
                            title="Unique Faculty Assigned"
                            value={uniqueFacultyCount}
                            icon={FaUserCheck}
                            tone="amber"
                        />
                    </div>

                    {/* Uniform Expanded Input Form Frame Container */}
                    <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center h-full">
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-normal">
                            Assign a Subject
                        </h2>
                        <form
                            onSubmit={handleSubmit(onAssign)}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end w-full"
                        >
                            <div className="w-full">
                                <FormSelect
                                    label="Faculty"
                                    icon={FaChalkboardTeacher}
                                    required
                                    {...register("faculty")}
                                >
                                    <option value="">Select Faculty</option>
                                    {faculty.map((f) => (
                                        <option key={f._id} value={f._id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>

                            <div className="w-full">
                                <FormSelect
                                    label="Subject"
                                    icon={FaBook}
                                    required
                                    {...register("subject")}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.code} - {s.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>

                            <div className="w-full">
                                <FormInput
                                    label="Academic Year (optional)"
                                    icon={FaCalendarAlt}
                                    placeholder="2025-26"
                                    {...register("academicYear")}
                                />
                            </div>

                            <div className="w-full">
                                <Button 
                                    type="submit" 
                                    loading={saving} 
                                    icon={<FaPlus />} 
                                    className="h-10 px-6 w-full flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm"
                                >
                                    {saving ? "Assigning..." : "Assign"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 3. Stretched Action Filtering Search Row */}
                <div className="flex items-center justify-between gap-4 bg-white px-5 py-3 border border-slate-100 rounded-2xl shadow-sm w-full">
                    <SearchBar
                        className="flex-1 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by faculty, department or subject..."
                    />

                    <button
                        onClick={loadAll}
                        className="h-10 px-5 flex-shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                    >
                        <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </button>
                </div>

                {/* 4. Symmetrical Grid Layout Processing Table Frame */}
                <div className="w-full">
                    {loading ? (
                        <TableSkeleton rows={5} columns={5} />
                    ) : filteredAssignments.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={FaUserCheck}
                                title="No Assignments Yet"
                                message="Assign a faculty member to a subject above to get started."
                            />
                        </Card>
                    ) : (
                        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm rounded-2xl w-full">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                                        <tr>
                                            <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="!pl-6 pr-4 py-4 font-bold">Faculty</SortableTh>
                                            <SortableTh field="department" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Department</SortableTh>
                                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Subject</SortableTh>
                                            <SortableTh field="year" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Academic Year</SortableTh>
                                            <th className="py-4 !pr-6 text-center font-bold text-slate-500 normal-case tracking-normal">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {rows.map((a) => (
                                            <tr
                                                key={a._id}
                                                className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/60"
                                            >
                                                <td className="!pl-6 pr-4 py-4 font-bold text-slate-800">
                                                    {a.faculty?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-600">
                                                    {a.faculty?.department || "—"}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                                                    {a.subject?.code ? (
                                                        <span className="text-indigo-600 font-bold mr-3.5 inline-block">
                                                            {a.subject.code}
                                                        </span>
                                                    ) : null}
                                                    <span className="text-slate-800 font-medium">{a.subject?.name || "Unknown"}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-semibold tabular-nums">
                                                    {a.academicYear || "—"}
                                                </td>
                                                <td className="pl-4 !pr-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setRemovingAssignment(a)}
                                                        className="inline-flex items-center text-rose-600 hover:text-rose-800 font-bold transition-all text-sm py-1 px-3 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                total={total}
                                pageSize={pageSize}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!removingAssignment}
                title="Remove Assignment"
                message={
                    removingAssignment
                        ? `Remove ${removingAssignment.faculty?.name} from ${removingAssignment.subject?.name}? They will no longer be able to start sessions for this subject.`
                        : ""
                }
                confirmText="Remove"
                loading={saving}
                onClose={() => setRemovingAssignment(null)}
                onConfirm={confirmRemove}
            />
        </AppLayout>
    );
};

export default FacultyAssignments;