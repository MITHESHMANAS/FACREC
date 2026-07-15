const EnrolledSubjects = ({ subjects = [] }) => {

    return (

        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">

            <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Enrolled Subjects
            </h2>

            {
                subjects.length === 0 ?

                    <p className="text-gray-400">
                        Not enrolled in any subjects yet.
                    </p>

                    :

                    <div className="flex flex-wrap gap-3">

                        {
                            subjects.map((subject) => (

                                <span
                                    key={subject._id}
                                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium text-sm border border-slate-200"
                                >
                                    {subject.code} - {subject.name}
                                </span>

                            ))
                        }

                    </div>
            }

        </div>

    );

};

export default EnrolledSubjects;
