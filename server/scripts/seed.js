/**
 * FACREC seed script.
 *
 * Populates the database with enough data to log in and exercise the
 * full workflow (faculty assigned to subjects, students enrolled).
 *
 * Idempotent: uses findOneAndUpdate(..., { upsert: true }) everywhere,
 * so running `npm run seed` any number of times converges to the same
 * state instead of creating duplicates.
 *
 * Dependency order (each step needs the ids from the step above):
 *   User -> Faculty -> Subject -> FacultySubject -> Student -> Enrollment
 */

require("dotenv").config();

const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require(path.join(__dirname, "..", "src", "models", "User"));
const Faculty = require(path.join(__dirname, "..", "src", "models", "Faculty"));
const Subject = require(path.join(__dirname, "..", "src", "models", "Subject"));
const FacultySubject = require(path.join(__dirname, "..", "src", "models", "FacultySubject"));
const Student = require(path.join(__dirname, "..", "src", "models", "Student"));
const Enrollment = require(path.join(__dirname, "..", "src", "models", "Enrollment"));

const SEED_PASSWORD = "Facrec@123";

const log = (label) => console.log(`✔ ${label}`);

async function seedUsers() {

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    const users = [
        { name: "System Admin", email: "admin@facrec.edu", role: "admin" },
        { name: "Dr. Ananya Rao", email: "ananya.rao@facrec.edu", role: "faculty" },
        { name: "Dr. Vikram Shah", email: "vikram.shah@facrec.edu", role: "faculty" }
    ];

    const created = {};

    for (const u of users) {

        const user = await User.findOneAndUpdate(
            { email: u.email },
            {
                name: u.name,
                email: u.email,
                role: u.role,
                password: hashedPassword,
                isActive: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        created[u.email] = user;

    }

    log(`Users ready (${Object.keys(created).length}) - default password for all: ${SEED_PASSWORD}`);

    return created;

}

async function seedFaculty(users) {

    const faculty = [
        {
            name: "Dr. Ananya Rao",
            email: "ananya.rao@facrec.edu",
            employeeId: "FAC-001",
            department: "Computer Science",
            designation: "Associate Professor",
            user: users["ananya.rao@facrec.edu"]._id
        },
        {
            name: "Dr. Vikram Shah",
            email: "vikram.shah@facrec.edu",
            employeeId: "FAC-002",
            department: "Computer Science",
            designation: "Assistant Professor",
            user: users["vikram.shah@facrec.edu"]._id
        }
    ];

    const created = [];

    for (const f of faculty) {

        const doc = await Faculty.findOneAndUpdate(
            { employeeId: f.employeeId },
            f,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        created.push(doc);

    }

    log(`Faculty ready (${created.length})`);

    return created;

}

async function seedSubjects() {

    const subjects = [
        { code: "CS301", name: "Data Structures & Algorithms", semester: 3, branch: "CSE" },
        { code: "CS302", name: "Database Management Systems", semester: 3, branch: "CSE" },
        { code: "CS401", name: "Operating Systems", semester: 4, branch: "CSE" },
        { code: "CS402", name: "Computer Networks", semester: 4, branch: "CSE" },
        { code: "CS403", name: "Machine Learning", semester: 4, branch: "CSE" }
    ];

    const created = [];

    for (const s of subjects) {

        const doc = await Subject.findOneAndUpdate(
            { code: s.code },
            s,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        created.push(doc);

    }

    log(`Subjects ready (${created.length})`);

    return created;

}

async function seedFacultySubjects(faculty, subjects) {

    // Ananya: CS301, CS302  |  Vikram: CS401, CS402, CS403
    const assignments = [
        { faculty: faculty[0]._id, subject: subjects[0]._id },
        { faculty: faculty[0]._id, subject: subjects[1]._id },
        { faculty: faculty[1]._id, subject: subjects[2]._id },
        { faculty: faculty[1]._id, subject: subjects[3]._id },
        { faculty: faculty[1]._id, subject: subjects[4]._id }
    ];

    let count = 0;

    for (const a of assignments) {

        await FacultySubject.findOneAndUpdate(
            {
                faculty: a.faculty,
                subject: a.subject,
                academicYear: null
            },
            {
                faculty: a.faculty,
                subject: a.subject,
                status: "ACTIVE"
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        count++;

    }

    // Keep Subject.faculty (the display string on the subject itself)
    // in sync with the assignment, since Subjects.jsx currently reads
    // that field directly rather than joining through FacultySubject.
    await Subject.findByIdAndUpdate(subjects[0]._id, { faculty: faculty[0].name });
    await Subject.findByIdAndUpdate(subjects[1]._id, { faculty: faculty[0].name });
    await Subject.findByIdAndUpdate(subjects[2]._id, { faculty: faculty[1].name });
    await Subject.findByIdAndUpdate(subjects[3]._id, { faculty: faculty[1].name });
    await Subject.findByIdAndUpdate(subjects[4]._id, { faculty: faculty[1].name });

    log(`Faculty Assignments ready (${count})`);

}

async function seedStudents() {

    const branch = "CSE";
    const semester = 3;

    const names = [
        "Aarav Mehta", "Diya Kapoor", "Rohan Iyer", "Sneha Reddy", "Kabir Singh",
        "Isha Nair", "Aditya Verma", "Meera Pillai", "Arjun Menon", "Priya Bansal"
    ];

    const created = [];

    for (let i = 0; i < names.length; i++) {

        const rollNo = String(21 + i); // matches existing face_dataset/21.npy for the first student

        const doc = await Student.findOneAndUpdate(
            { rollNo },
            {
                name: names[i],
                rollNo,
                email: `${rollNo}.cse@facrec.edu`,
                branch,
                semester,
                faceDatasetId: rollNo,
                isActive: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        created.push(doc);

    }

    log(`Students ready (${created.length})`);

    return created;

}

async function seedEnrollments(students, subjects) {

    // Enroll every semester-3 student into the two semester-3 subjects
    // (CS301, CS302) - matches the seeded students' semester/branch.
    const targetSubjects = subjects.filter((s) => s.semester === 3);

    let count = 0;

    for (const student of students) {

        for (const subject of targetSubjects) {

            await Enrollment.findOneAndUpdate(
                { student: student._id, subject: subject._id },
                {
                    student: student._id,
                    subject: subject._id,
                    status: "ACTIVE"
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            count++;

        }

    }

    log(`Enrollments ready (${count})`);

}

async function run() {

    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set. Add it to server/.env before seeding.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("======================================");
    console.log("FACREC Seed");
    console.log("======================================");

    const users = await seedUsers();
    const faculty = await seedFaculty(users);
    const subjects = await seedSubjects();
    await seedFacultySubjects(faculty, subjects);
    const students = await seedStudents();
    await seedEnrollments(students, subjects);

    console.log("======================================");
    console.log("Seed Completed");
    console.log("======================================");
    console.log(`Admin login   : admin@facrec.edu / ${SEED_PASSWORD}`);
    console.log(`Faculty login : ananya.rao@facrec.edu / ${SEED_PASSWORD}`);
    console.log(`Faculty login : vikram.shah@facrec.edu / ${SEED_PASSWORD}`);
    console.log("======================================");

    await mongoose.disconnect();

    process.exit(0);

}

run().catch((err) => {

    console.error("Seed failed:", err);

    mongoose.disconnect().finally(() => process.exit(1));

});
