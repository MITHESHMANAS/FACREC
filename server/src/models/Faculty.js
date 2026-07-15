const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    employeeId:{
        type:String,
        required:true,
        unique:true
    },

    department:{
        type:String,
        required:true
    },

    designation:{
        type:String,
        default:"Assistant Professor"
    },

    // Optional link to the login account (User) this faculty member
    // uses. Nullable for backward compatibility with faculty records
    // created before login-linking existed - existing rows keep working,
    // linking just unlocks subject-assignment enforcement for that account.
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("Faculty",facultySchema);