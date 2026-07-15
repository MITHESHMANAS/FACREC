const mongoose = require("mongoose");

const recognitionLogSchema = new mongoose.Schema(
{
    student:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Student",

        default:null

    },

    session:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"AttendanceSession",

        default:null

    },

    recognizedName:{

        type:String,

        default:"Unknown"

    },

    confidence:{

        type:Number,

        default:0

    },

    subject:{

        type:String,

        default:"Unknown"

    },

    camera:{

        type:String,

        default:"Camera 1"

    },

    status:{

        type:String,

        enum:[

            "RECOGNIZED",

            "UNKNOWN"

        ],

        default:"RECOGNIZED"

    },

    // Base64 JPEG data URI of the camera frame at the moment of
    // detection. Optional (recognitionEngineController stores UNKNOWN
    // matches too, and old rows created before this field existed
    // won't have one) - RecognitionHistory.jsx just skips the
    // thumbnail if it's missing.
    snapshot: {

        type: String,

        default: null

    },

    // Haar Cascade bounding box, in pixel coordinates relative to the
    // captured frame, so the frontend can draw the rectangle on top
    // of `snapshot` instead of just showing a plain cropped face.
    boundingBox: {

        x: { type: Number, default: null },
        y: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        frameWidth: { type: Number, default: null },
        frameHeight: { type: Number, default: null }

    },

    // How long the recognition pass took to find this face, in
    // milliseconds, measured from camera open to match.
    durationMs: {

        type: Number,

        default: null

    },

    capturedAt:{

        type:Date,

        default:Date.now

    }

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "RecognitionLog",
    recognitionLogSchema
);