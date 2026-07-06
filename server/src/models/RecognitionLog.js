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

    status:{

        type:String,

        enum:[

            "RECOGNIZED",

            "UNKNOWN"

        ],

        default:"RECOGNIZED"

    },

    capturedAt:{

        type:Date,

        default:Date.now

    }

},
{
    timestamps:true
});

module.exports=mongoose.model(
    "RecognitionLog",
    recognitionLogSchema
);