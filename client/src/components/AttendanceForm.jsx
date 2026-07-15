import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCalendarCheck, FaUserGraduate, FaClipboardCheck } from "react-icons/fa";

import { getSessions } from "../services/sessionService";
import { getEnrollments } from "../services/enrollmentService";
import FormSelect from "./ui/FormSelect";
import Button from "./ui/Button";

const AttendanceForm = ({ onSubmit, loading }) => {

    const {
        register,
        handleSubmit,
        reset,
        watch
    } = useForm();

    const [sessions, setSessions] = useState([]);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const selectedSessionId = watch("session");

    useEffect(() => {

        const loadSessions = async () => {

            try {

                const sessionRes = await getSessions();

                // Only sessions that can actually accept a new
                // attendance record right now - an ended session will
                // just be rejected by the backend, so don't offer it
                // here.
                const markable = (sessionRes.sessions || []).filter(
                    (s) => s.status !== "ENDED"
                );

                setSessions(markable);

            }

            catch (err) {

                console.log(err);

            }

        };

        loadSessions();

        reset({
            status: "Present"
        });

    }, [reset]);

    // Every time the selected session changes, load only the students
    // actually enrolled in that session's subject - marking attendance
    // for someone who isn't enrolled is rejected server-side anyway,
    // so don't let the dropdown offer it in the first place.
    useEffect(() => {

        const loadEnrolledStudents = async () => {

            const session = sessions.find(
                (s) => s._id === selectedSessionId
            );

            if (!session || !session.subject?._id) {
                setEnrolledStudents([]);
                return;
            }

            try {

                setLoadingStudents(true);

                const data = await getEnrollments({
                    subject: session.subject._id
                });

                const active = (data.enrollments || [])
                    .filter((e) => e.status === "ACTIVE" && e.student)
                    .map((e) => e.student);

                setEnrolledStudents(active);

            }

            catch (err) {

                console.log(err);

                setEnrolledStudents([]);

            }

            finally {

                setLoadingStudents(false);

            }

        };

        if (selectedSessionId) {
            loadEnrolledStudents();
        } else {
            setEnrolledStudents([]);
        }

    }, [selectedSessionId, sessions]);

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <FormSelect
                label="Session"
                icon={FaCalendarCheck}
                {...register("session")}
            >
                <option value="">Select a session</option>
                {
                    sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                            {session.subject?.code}
                            {" - "}
                            {session.subject?.name}
                            {" ("}
                            {session.date}
                            {", "}
                            {session.status}
                            {")"}
                        </option>
                    ))
                }
            </FormSelect>

            <FormSelect
                label="Student"
                icon={FaUserGraduate}
                disabled={!selectedSessionId || loadingStudents}
                hint={
                    selectedSessionId && !loadingStudents && enrolledStudents.length === 0
                        ? "No students are enrolled in this session's subject yet."
                        : null
                }
                {...register("student")}
            >
                <option value="">
                    {
                        !selectedSessionId
                            ? "Select a session first"
                            : loadingStudents
                                ? "Loading enrolled students..."
                                : enrolledStudents.length === 0
                                    ? "No students enrolled in this subject"
                                    : "Select a student"
                    }
                </option>
                {
                    enrolledStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                            {student.rollNo} - {student.name}
                        </option>
                    ))
                }
            </FormSelect>

            <FormSelect
                label="Status"
                icon={FaClipboardCheck}
                {...register("status")}
            >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
            </FormSelect>

            <Button
                type="submit"
                loading={loading}
                disabled={!selectedSessionId || enrolledStudents.length === 0}
                className="w-full mt-2"
                size="lg"
            >
                {loading ? "Saving..." : "Mark Attendance"}
            </Button>

        </form>

    );

};

export default AttendanceForm;
