import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import { useForm } from "react-hook-form";
import { FaUserGraduate, FaBook, FaPlus, FaLayerGroup, FaSyncAlt, FaClipboardList, FaUserCheck } from "react-icons/fa";

import AppLayout from "../layouts/AppLayout";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import ConfirmModal from "../components/ConfirmModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormSelect from "../components/ui/FormSelect";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import SortableTh from "../components/ui/SortableTh";
import useDataTable from "../hooks/useDataTable";
import KpiCard from "../components/ui/KpiCard";

import { getStudents } from "../services/studentService";
import { getSubjects } from "../services/masterDataService";
import {
    getEnrollments,
    enrollStudent,
    removeEnrollment
} from "../services/enrollmentService";

const getSortValue = (e, field) => {
    const studentRoll = typeof e.student === "object" ? e.student?.rollNo : e.studentRollNo || "";
    const studentName = typeof e.student === "object" ? e.student?.name : e.studentName || "";
    const subjectName = typeof e.subject === "object" ? e.subject?.name : e.subjectName || "";
    const studentBranch = typeof e.student === "object" ? e.student?.branch : e.branch || "";
    const studentSem = typeof e.student === "object" ? e.student?.semester : e.semester || 0;

    switch (field) {
        case "rollNo": return studentRoll.toLowerCase();
        case "student": return studentName.toLowerCase();
        case "subject": return subjectName.toLowerCase();
        case "branch": return studentBranch.toLowerCase();
        case "semester": return studentSem;
        case "status": return e.status === "ACTIVE" ? 1 : 0;
        default: return null;
    }
};

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [removingEnrollment, setRemovingEnrollment] = useState(null);

    const { register, handleSubmit, reset } = useForm();

    const loadAll = async () => {
        try {
            setLoading(true);
            const [enrollmentData, studentData, subjectData] = await Promise.all([
                getEnrollments(),
                getStudents(),
                getSubjects()
            ]);

            setEnrollments(enrollmentData.enrollments || []);
            setStudents(studentData.students || []);
            setSubjects(subjectData || []);
        } catch {
            toast.error("Failed to load enrollments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const onEnroll = async (formValues) => {
        try {
            setSaving(true);
            await enrollStudent({
                student: formValues.student,
                subject: formValues.subject
            });

            toast.success("Student enrolled");
            reset({ student: "", subject: "" });
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to enroll student");
        } finally {
            setSaving(false);
        }
    };

    const confirmRemove = async () => {
        try {
            setSaving(true);
            await removeEnrollment(removingEnrollment._id);
            toast.success("Enrollment removed");
            setRemovingEnrollment(null);
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to remove enrollment");
        } finally {
            setSaving(false);
        }
    };

    const filteredEnrollments = enrollments.filter((e) => {
        const text = search.toLowerCase();
        
        const studentName = (typeof e.student === "object" ? e.student?.name : e.studentName || "").toLowerCase();
        const rollNo = (typeof e.student === "object" ? e.student?.rollNo : e.studentRollNo || "").toLowerCase();
        const subjectName = (typeof e.subject === "object" ? e.subject?.name : e.subjectName || "").toLowerCase();
        const subjectCode = (typeof e.subject === "object" ? e.subject?.code : e.subjectCode || "").toLowerCase();

        return (
            studentName.includes(text) ||
            rollNo.includes(text) ||
            subjectName.includes(text) ||
            subjectCode.includes(text)
        );
    });

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(filteredEnrollments, { pageSize: 8, getSortValue });

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-4 py-2">
                
                {/* 1. View Header Strip */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Enrollments
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Students are auto-enrolled into every subject matching their branch and semester at registration. Use this page for manual overrides — electives, retakes, or corrections.
                    </p>
                </div>

                {/* 2. Top Split-Layout Section (Balanced Space Utilization) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch w-full">
                    
                    {/* Metrics Section: Spans 2 blocks */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                        <KpiCard
                            index={0}
                            title="Total System Enrollments"
                            value={enrollments.length}
                            icon={FaClipboardList}
                            tone="indigo"
                        />
                        <KpiCard
                            index={1}
                            title="Active Manual Overrides"
                            value={filteredEnrollments.length}
                            icon={FaUserCheck}
                            tone="amber"
                        />
                    </div>

                    {/* Form Section: Spans 3 blocks with comfortable padding */}
                    <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center h-full">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-normal mb-4">
                            Manually Enroll a Student
                        </h2>
                        <form
                            onSubmit={handleSubmit(onEnroll)}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end w-full"
                        >
                            <div className="w-full">
                                <FormSelect
                                    label="Student"
                                    icon={FaUserGraduate}
                                    required
                                    {...register("student")}
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.rollNo} - {s.name}
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

                            <div className="sm:col-span-2 w-full mt-2">
                                <Button 
                                    type="submit" 
                                    loading={saving} 
                                    icon={<FaPlus />} 
                                    className="h-10 px-6 w-full flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm"
                                >
                                    {saving ? "Enrolling..." : "Enroll Student"}
                                </Button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* 3. Fully Stretched Filters Bar */}
                <div className="flex items-center justify-between gap-4 bg-white px-5 py-3 border border-slate-100 rounded-2xl shadow-sm w-full">
                    <SearchBar
                        className="flex-1 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by student, roll no or subject..."
                    />

                    <button
                        onClick={loadAll}
                        className="h-10 px-5 flex-shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                    >
                        <FaSyncAlt className={`text-slate-400 text-[11px] ${loading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </button>
                </div>

                {/* 4. Table Shell */}
                <div className="w-full">
                    {loading ? (
                        <TableSkeleton rows={5} columns={7} />
                    ) : filteredEnrollments.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={FaLayerGroup}
                                title="No Enrollments Found"
                                message="Register a student to auto-enroll them, or enroll one manually above."
                            />
                        </Card>
                    ) : (
                        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm rounded-2xl w-full">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                                        <tr>
                                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="!pl-6 pr-4 py-4 font-bold">Roll No</SortableTh>
                                            <SortableTh field="student" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Student</SortableTh>
                                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Subject</SortableTh>
                                            <SortableTh field="branch" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Branch</SortableTh>
                                            <SortableTh field="semester" sortField={sortField} sortDir={sortDir} onSort={toggleSort} className="px-6 py-4 font-bold">Semester</SortableTh>
                                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center" className="px-6 py-4 font-bold">Status</SortableTh>
                                            <th className="py-4 !pr-6 text-center font-bold text-slate-500 normal-case tracking-normal">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {rows.map((e, idx) => {
                                            const displayRoll = typeof e.student === "object" ? e.student?.rollNo : e.studentRollNo || "-";
                                            const displayName = typeof e.student === "object" ? e.student?.name : e.studentName || "Unknown";
                                            
                                            const subCode = typeof e.subject === "object" ? e.subject?.code : e.subjectCode || "";
                                            const subName = typeof e.subject === "object" ? e.subject?.name : e.subjectName || "Unknown";
                                            
                                            const branchLabel = e.branch || (typeof e.student === "object" ? e.student?.branch : "-");
                                            const semLabel = e.semester || (typeof e.student === "object" ? e.student?.semester : "-");

                                            return (
                                                <tr
                                                    key={e._id || idx}
                                                    className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/60"
                                                >
                                                    <td className="!pl-6 pr-4 py-4 font-semibold text-slate-700 tabular-nums">
                                                        {displayRoll}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">
                                                        {displayName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                                                        {subCode ? (
                                                            <span className="text-indigo-600 font-bold mr-3 inline-block">
                                                                {subCode}
                                                            </span>
                                                        ) : null}
                                                        <span className="text-slate-800 font-medium">{subName}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-semibold uppercase">
                                                        {branchLabel}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-semibold tabular-nums">
                                                        {semLabel}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge status={e.status || "ACTIVE"} />
                                                    </td>
                                                    <td className="pl-4 !pr-6 py-4 text-center">
                                                        {(e.status === "ACTIVE" || !e.status) && (
                                                            <button
                                                                onClick={() => setRemovingEnrollment(e)}
                                                                className="inline-flex items-center text-rose-600 hover:text-rose-800 font-bold transition-all text-sm py-1 px-3 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                isOpen={!!removingEnrollment}
                title="Remove Enrollment"
                message={
                    removingEnrollment
                        ? `Remove ${(typeof removingEnrollment.student === "object" ? removingEnrollment.student?.name : removingEnrollment.studentName) || "this student"} from ${(typeof removingEnrollment.subject === "object" ? removingEnrollment.subject?.name : removingEnrollment.subjectName) || "this course"}? They will no longer count toward expected attendance.`
                        : ""
                }
                confirmText="Remove"
                loading={saving}
                onClose={() => setRemovingEnrollment(null)}
                onConfirm={confirmRemove}
            />
        </AppLayout>
    );
};

export default Enrollments;