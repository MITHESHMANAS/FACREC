import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { getStudents } from "../services/studentService";
import { getSessions } from "../services/sessionService";

const AttendanceForm = ({ onSubmit, loading }) => {

    const {
        register,
        handleSubmit,
        reset
    } = useForm();

    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {

        const loadData = async () => {

            try {

                const studentRes = await getStudents();
                const sessionRes = await getSessions();

                setStudents(studentRes.students);
                setSessions(sessionRes.sessions);

            }

            catch (err) {

                console.log(err);

            }

        };

        loadData();

        reset({
            status: "Present"
        });

    }, [reset]);

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >

            <div>

                <label className="block mb-1 font-medium">

                    Student

                </label>

                <select
                    {...register("student")}
                    className="w-full border rounded-lg p-3"
                >

                    {

                        students.map((student) => (

                            <option
                                key={student._id}
                                value={student._id}
                            >

                                {student.rollNo} - {student.name}

                            </option>

                        ))

                    }

                </select>

            </div>

            <div>

                <label className="block mb-1 font-medium">

                    Session

                </label>

                <select
                    {...register("session")}
                    className="w-full border rounded-lg p-3"
                >

                    {

                        sessions.map((session) => (

                            <option
                                key={session._id}
                                value={session._id}
                            >

                                {session.subject?.code}
                                {" - "}
                                {session.subject?.name}
                                {" ("}
                                {session.date}
                                {")"}

                            </option>

                        ))

                    }

                </select>

            </div>

            <div>

                <label className="block mb-1 font-medium">

                    Status

                </label>

                <select
                    {...register("status")}
                    className="w-full border rounded-lg p-3"
                >

                    <option value="Present">

                        Present

                    </option>

                    <option value="Absent">

                        Absent

                    </option>

                </select>

            </div>

            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >

                {

                    loading

                        ?

                        "Saving..."

                        :

                        "Mark Attendance"

                }

            </button>

        </form>

    );

};

export default AttendanceForm;