import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableSkeleton from "../components/ui/TableSkeleton";
import { useForm } from "react-hook-form";
import { FaUserGraduate, FaBook, FaPlus, FaLayerGroup, FaSyncAlt } from "react-icons/fa";

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

import { getStudents } from "../services/studentService";
import { getSubjects } from "../services/masterDataService";
import {
    getEnrollments,
    enrollStudent,
    removeEnrollment
} from "../services/enrollmentService";

const getSortValue = (e, field) => {

    switch (field) {
        case "rollNo": return e.student?.rollNo?.toLowerCase();
        case "student": return e.student?.name?.toLowerCase();
        case "subject": return e.subject?.name?.toLowerCase();
        case "branch": return e.student?.branch?.toLowerCase();
        case "semester": return e.student?.semester;
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

            const [enrollmentData, studentData, subjectData] =
                await Promise.all([
                    getEnrollments(),
                    getStudents(),
                    getSubjects()
                ]);

            setEnrollments(enrollmentData.enrollments);
            setStudents(studentData.students);
            setSubjects(subjectData);

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

            toast.error(
                err.response?.data?.message ||
                "Unable to enroll student"
            );

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

            toast.error(
                err.response?.data?.message ||
                "Unable to remove enrollment"
            );

        } finally {

            setSaving(false);

        }

    };

    const filteredEnrollments = enrollments.filter((e) => {

        const text = search.toLowerCase();

        return (
            e.student?.name?.toLowerCase().includes(text) ||
            e.student?.rollNo?.toLowerCase().includes(text) ||
            e.subject?.name?.toLowerCase().includes(text) ||
            e.subject?.code?.toLowerCase().includes(text)
        );

    });

    const { rows, page, setPage, totalPages, pageSize, total, sortField, sortDir, toggleSort } =
        useDataTable(filteredEnrollments, { pageSize: 8, getSortValue });

    return (

        <AppLayout>

            <div className="mb-6">

                <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
                    Enrollments
                </h1>

                <p className="text-gray-500 mt-2">
                    Students are auto-enrolled into every subject
                    matching their branch and semester at
                    registration. Use this page for manual
                    overrides — electives, retakes, or corrections.
                </p>

            </div>

            <Card className="mb-6">

                <h2 className="text-lg font-bold mb-4 text-slate-800">
                    Manually Enroll a Student
                </h2>

                <form
                    onSubmit={handleSubmit(onEnroll)}
                    className="grid md:grid-cols-3 gap-4 items-start"
                >

                    <FormSelect
                        label="Student"
                        icon={FaUserGraduate}
                        required
                        {...register("student")}
                    >
                        <option value="">Select Student</option>
                        {
                            students.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.rollNo} - {s.name}
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

                    <Button type="submit" loading={saving} icon={<FaPlus />} className="mt-6">
                        {saving ? "Enrolling..." : "Enroll"}
                    </Button>

                </form>

            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student, roll no or subject..."
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

                    filteredEnrollments.length === 0 ?

                        <Card>
                            <EmptyState
                                icon={FaLayerGroup}
                                title="No Enrollments Found"
                                message="Register a student to auto-enroll them, or enroll one manually above."
                            />
                        </Card>

                        :

                        <Card padding="none" className="overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="min-w-full text-sm">

                                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                                        <tr>
                                            <SortableTh field="rollNo" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Roll No</SortableTh>
                                            <SortableTh field="student" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Student</SortableTh>
                                            <SortableTh field="subject" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Subject</SortableTh>
                                            <SortableTh field="branch" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Branch</SortableTh>
                                            <SortableTh field="semester" sortField={sortField} sortDir={sortDir} onSort={toggleSort}>Semester</SortableTh>
                                            <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="center">Status</SortableTh>
                                            <SortableTh align="center">Actions</SortableTh>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            rows.map((e) => (
                                                <tr
                                                    key={e._id}
                                                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                                                >
                                                    <td className="px-6 py-3.5 font-medium text-slate-600">
                                                        {e.student?.rollNo}
                                                    </td>
                                                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                                                        {e.student?.name}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {e.subject?.code} - {e.subject?.name}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {e.student?.branch}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-600">
                                                        {e.student?.semester}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <Badge status={e.status} />
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        {
                                                            e.status === "ACTIVE" &&
                                                            <button
                                                                onClick={() => setRemovingEnrollment(e)}
                                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        }
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
                isOpen={!!removingEnrollment}
                title="Remove Enrollment"
                message={
                    removingEnrollment
                        ? `Remove ${removingEnrollment.student?.name} from ${removingEnrollment.subject?.name}? They'll no longer count toward expected attendance for that subject.`
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
