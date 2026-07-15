import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock
} from "react-icons/fa";

import Badge from "./Badge";

const RecognitionTimeline = ({ history }) => {

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">

            <h2 className="text-lg font-semibold text-slate-800 mb-6">

                Recognition Timeline

            </h2>

            {

                history.length === 0 ? (

                    <p className="text-center text-gray-400 py-10">
                        No recognition activity yet.
                    </p>

                ) : (

                <div className="space-y-5">

                    {

                        history.map((record) => {

                            const isPresent = record.status === "Present";

                            return (

                                <div

                                    key={record._id}

                                    className="flex items-start gap-4"

                                >

                                    <div>

                                        {

                                            isPresent ? (

                                                <FaCheckCircle
                                                    className="text-emerald-600 text-xl mt-1"
                                                />

                                            ) : (

                                                <FaTimesCircle
                                                    className="text-red-500 text-xl mt-1"
                                                />

                                            )

                                        }

                                    </div>

                                    <div
                                        className={
                                            `flex-1 border-l-2 pl-5 ` +
                                            (isPresent
                                                ? "border-emerald-400"
                                                : "border-red-300")
                                        }
                                    >

                                        <h3 className="font-semibold">

                                            {record.session?.subject?.name}

                                        </h3>

                                        <p className="text-gray-500">

                                            {record.session?.date}

                                        </p>

                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">

                                            <FaClock />

                                            {

                                                new Date(

                                                    record.markedAt

                                                ).toLocaleTimeString()

                                            }

                                        </div>

                                        <div className="mt-3">

                                            <Badge status={record.status} />

                                        </div>

                                    </div>

                                </div>

                            );

                        })

                    }

                </div>

                )

            }

        </div>

    );

};

export default RecognitionTimeline;
