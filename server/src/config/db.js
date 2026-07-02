const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log("======================================");
        console.log("✅ MongoDB Connected");
        console.log(`📦 Database : ${conn.connection.name}`);
        console.log("======================================");

    } catch (err) {

        console.error(err.message);

        process.exit(1);

    }

};

module.exports = connectDB;