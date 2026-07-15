const mongoose = require("mongoose");

const facultySubjectSchema = new mongoose.Schema(
    {
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        academicYear: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

// A faculty member is only assigned to a given subject once
// (per academic year). Re-assigning after removal just flips
// status back to ACTIVE instead of creating a duplicate row.
facultySubjectSchema.index(
    { faculty: 1, subject: 1, academicYear: 1 },
    { unique: true }
);

module.exports = mongoose.model("FacultySubject", facultySubjectSchema);
