const SubjectPerformance = ({ subjects }) => {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Subject Performance

            </h2>

            {

                subjects.map((subject) => (

                    <div
                        key={subject.subject}
                        className="mb-5"
                    >

                        <div className="flex justify-between">

                            <span>

                                {subject.subject}

                            </span>

                            <span>

                                {subject.percentage}%

                            </span>

                        </div>

                        <div className="bg-gray-200 rounded-full h-4 mt-2">

                            <div

                                className="bg-indigo-600 h-4 rounded-full"

                                style={{
                                    width:
                                        `${subject.percentage}%`
                                }}

                            />

                        </div>

                    </div>

                ))

            }

        </div>

    );

};

export default SubjectPerformance;