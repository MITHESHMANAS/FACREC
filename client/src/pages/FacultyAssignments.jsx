import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import { useForm } from "react-hook-form";
import { FaChalkboardTeacher, FaBook, FaCalendarAlt, FaPlus, FaUserCheck, FaSyncAlt } from "react-icons/fa";

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

    const { register, handleSubmit, reset } = useForm();

    const loadAll = async () => {

        try {

            const [assignmentData, facultyData, subjectData] =
                await Promise.all([
                    getAssignments(),
                    getFaculty(),
                    getSubjects()
                ]);

            setAssignments(assignmentData.assignments);
            setFaculty(facultyData.faculty);
            setSubjects(subjectData);

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
            reset({ faculty: "", subject: "", academicYear: "" });
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
            a.subject?.name?.toLowerCase().includes(text) ||
            a.subject?.code?.toLowerCase().includes(text)
        );

    });

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(filteredAssignments, { pageSize: 8, getSortValue });

    return (

        <AppLayout>

            <div className="mb-6">

                <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                    Faculty Subject Assignments
                </h1>

                <p className="text-gray-500 mt-2">
                    Control which subjects a faculty member is
                    allowed to start attendance sessions for.
                </p>

            </div>

            <Card className="mb-6">

                <h2 className="text-lg font-bold mb-4 text-slate-800">
                    Assign a Subject
                </h2>

                <form
                    onSubmit={handleSubmit(onAssign)}
                    className="grid md:grid-cols-4 gap-4 items-start"
                >

                    <FormSelect
                        label="Faculty"
                        icon={FaChalkboardTeacher}
                        required
                        {...register("faculty")}
                    >
                        <option value="">Select Faculty</option>
                        {
                            faculty.map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.name} ({f.department})
                                </option>
                            ))
                        }
                    </FormSelect>

                    <FormSelect
                        label="Subject"
                        icon={FaBook}
                        required
                        {...register("subject")}
                    >
                        <option value="">Select Subject</option>
                        {
                            subjects.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.code} - {s.name}
                                </option>
                            ))
                        }
                    </FormSelect>

                    <FormInput
                        label="Academic Year (optional)"
                        icon={FaCalendarAlt}
                        placeholder="2025-26"
                        {...register("academicYear")}
                    />

                    <Button type="submit" loading={saving} icon={<FaPlus />} className="mt-6">
                        {saving ? "Assigning..." : "Assign"}
                    </Button>

                </form>

            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by faculty or subject..."
                />

                <button
                    onClick={loadAll}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <FaSyncAlt className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>

            </div>

            {
                loading ?

                    <TableSkeleton rows={5} columns={5} />

                    :

                    filteredAssignments.length === 0 ?

                        <Card>
                            <EmptyState
                                icon={FaUserCheck}
                                title="No Assignments Yet"
                                message="Assign a faculty member to a subject above to get started."
                            />
                        </Card>

                        :

                        <Card padding="none" className="overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="min-w-full text-sm">

                                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                                        <tr>
                                            <SortableTh field="faculty" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Faculty</SortableTh>
                                            <SortableTh field="department" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Department</SortableTh>
                                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Subject</SortableTh>
                                            <SortableTh field="year" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Academic Year</SortableTh>
                                            <SortableTh align="center">Actions</SortableTh>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            rows.map((a) => (
                                                <tr
                                                    key={a._id}
                                                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                                                >
                                                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                                                        {a.faculty?.name}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {a.faculty?.department}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {a.subject?.code} - {a.subject?.name}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {a.academicYear || "—"}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <button
                                                            onClick={() => setRemovingAssignment(a)}
                                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
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

                        </Card>
            }

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
