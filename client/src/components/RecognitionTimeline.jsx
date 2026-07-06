import {
    FaCheckCircle,
    FaClock
} from "react-icons/fa";

const RecognitionTimeline = ({ history }) => {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Recognition Timeline

            </h2>

            <div className="space-y-5">

                {

                    history.map((record) => (

                        <div

                            key={record._id}

                            className="flex items-start gap-4"

                        >

                            <div>

                                <FaCheckCircle

                                    className="text-green-600 text-xl mt-1"

                                />

                            </div>

                            <div className="flex-1 border-l-2 border-green-500 pl-5">

                                <h3 className="font-semibold">

                                    {record.session?.subject?.name}

                                </h3>

                                <p className="text-gray-500">

                                    {record.session?.date}

                                </p>

                                <div className="flex items-center gap-2 mt-2">

                                    <FaClock />

                                    {

                                        new Date(

                                            record.markedAt

                                        ).toLocaleTimeString()

                                    }

                                </div>

                                <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full">

                                    {record.status}

                                </span>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

};

export default RecognitionTimeline;