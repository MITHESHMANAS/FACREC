import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { FaTrophy } from "react-icons/fa";

import {

    getTopPerformers

} from "../../../services/dashboardAnalyticsService";

const TopPerformersWidget = () => {

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const loadTopPerformers = async () => {

        try {

            const data = await getTopPerformers();

            setStudents(data.students);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadTopPerformers();

    }, []);

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-lg font-semibold text-slate-800">

                    Top Performers

                </h2>

                <FaTrophy className="text-amber-500 text-2xl" />

            </div>

            {

                loading ?

                (

                    <div className="flex justify-center py-10">

                        <BeatLoader

                            color="#4f46e5"

                        />

                    </div>

                )

                :

                students.length === 0 ?

                (

                    <div className="text-center py-10 text-gray-500">

                        No attendance records found.

                    </div>

                )

                :

                (

                    <div className="space-y-4">

                        {

                            students.map((student, index) => (

                                <div

                                    key={student._id}

                                    className="flex justify-between items-center border-b pb-3"

                                >

                                    <div>

                                        <h3 className="font-semibold">

                                            #{index + 1}

                                            {" "}

                                            {student.name}

                                        </h3>

                                        <p className="text-sm text-gray-500">

                                            {student.rollNo}

                                        </p>

                                    </div>

                                    <div>

                                        <span className="font-bold text-indigo-600 text-lg">

                                            {student.percentage}%

                                        </span>

                                    </div>

                                </div>

                            ))

                        }

                    </div>

                )

            }

        </div>

    );

};

export default TopPerformersWidget;