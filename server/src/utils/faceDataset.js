const fs = require("fs");
const path = require("path");

/*
  Single source of truth for "does this student have a registered face?"

  The vision layer (register_student.py -> services/dataset_service.py)
  stores each captured face set on disk as:

      <project root>/face_dataset/<roll_no>.npy

  A student is "face registered" ONLY when that file exists. A Mongo
  field can be set, copied or defaulted without a face ever being
  captured, so it is never used as proof.
*/

// server/src/utils -> server/src -> server -> <project root>
const DATASET_DIR = path.join(__dirname, "..", "..", "..", "face_dataset");

// The key the vision layer uses for this student's file name.
const datasetKeyFor = (student) => {
    const key = String(student?.faceDatasetId || student?.rollNo || "").trim();

    // Refuse anything that could point outside face_dataset/
    if (!key || key !== path.basename(key)) return null;

    return key;
};

const datasetPathFor = (student) => {
    const key = datasetKeyFor(student);
    return key ? path.join(DATASET_DIR, `${key}.npy`) : null;
};

const hasFaceDataset = (student) => {
    const file = datasetPathFor(student);

    try {
        return !!file && fs.existsSync(file);
    } catch {
        return false;
    }
};

// Plain object copy of a Mongoose doc + the real face status.
const withFaceStatus = (student) => {
    if (!student) return student;

    const obj =
        typeof student.toObject === "function"
            ? student.toObject()
            : { ...student };

    return { ...obj, faceRegistered: hasFaceDataset(obj) };
};

// Called when a student is removed so their biometric data doesn't
// linger and silently re-attach to a future student with the same roll no.
const deleteFaceDataset = (student) => {
    const file = datasetPathFor(student);

    try {
        if (file && fs.existsSync(file)) {
            fs.unlinkSync(file);
            return true;
        }
    } catch (err) {
        console.error("Face dataset cleanup failed:", err.message);
    }

    return false;
};

module.exports = {
    DATASET_DIR,
    hasFaceDataset,
    withFaceStatus,
    deleteFaceDataset
};