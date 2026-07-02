const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        rollNo: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        branch: {
            type: String,
            required: true
        },

        semester: {
            type: Number,
            required: true
        },

        faceDatasetId: {
            type: String,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);