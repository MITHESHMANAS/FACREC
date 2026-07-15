const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "TRANSFERRED", "REMOVED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

// A student can only be enrolled once into the same subject.
// branch/semester are intentionally NOT stored here - they live on
// Student and Subject respectively. Storing them again would be
// denormalized data that can silently go stale if a student changes
// branch or a subject's metadata changes. Populate student/subject
// when you need that info.
enrollmentSchema.index(
    { student: 1, subject: 1 },
    { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
