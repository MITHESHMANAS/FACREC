require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {

        console.log("======================================");
        console.log("🚀 FACREC Enterprise Backend Started");
        console.log(`🌐 http://localhost:${PORT}`);
        console.log("======================================");

    });

};

startServer();