const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");

const getStudentProfile = async (id) => {

    const student = await Student.findById(id);

    if (!student) {
        throw new Error("Student not found");
    }

    const attendance = await Attendance.find({
        student: id
    })
    .populate({
        path: "session",
        populate: {
            path: "subject"
        }
    });

    const total = attendance.length;

    const present = attendance.filter(
        a => a.status === "Present"
    ).length;

    const absent = total - present;

    const percentage =
        total === 0
            ? 0
            : Number(
                ((present / total) * 100).toFixed(2)
            );

    const subjectMap = {};

    attendance.forEach(record => {

        const subject =
            record.session?.subject?.name;

        if (!subject) return;

        if (!subjectMap[subject]) {

            subjectMap[subject] = {

                total: 0,

                present: 0

            };

        }

        subjectMap[subject].total++;

        if (record.status === "Present") {

            subjectMap[subject].present++;

        }

    });

    const subjects = Object.keys(subjectMap).map(
        subject => ({

            subject,

            percentage: Number(

                (

                    subjectMap[subject].present /

                    subjectMap[subject].total

                ).toFixed(2)

            ) * 100

        })
    );

    const enrollments = await Enrollment.find({
        student: id,
        status: "ACTIVE"
    }).populate("subject");

    const enrolledSubjects = enrollments
        .filter((e) => e.subject)
        .map((e) => ({
            _id: e.subject._id,
            code: e.subject.code,
            name: e.subject.name,
            credits: e.subject.credits
        }));

    return {

        student,

        attendance: {

            total,

            present,

            absent,

            percentage

        },

        subjects,

        enrolledSubjects,

        history: attendance
            .sort(
                (a, b) =>

                    new Date(b.createdAt) -

                    new Date(a.createdAt)

            )
            .slice(0, 10)

    };

};

module.exports = {

    getStudentProfile

};