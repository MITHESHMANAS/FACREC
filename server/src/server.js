require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

const {
    initializeSocket
} = require("./socket/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        await connectDB();

        // Create HTTP Server
        const server = http.createServer(app);

        // Initialize Socket.IO
        initializeSocket(server);

        server.listen(PORT, () => {

            console.log("======================================");
            console.log("🚀 FACREC Enterprise Backend Started");
            console.log(`🌐 http://localhost:${PORT}`);
            console.log("⚡ Socket.IO Server Running");
            console.log("======================================");

        });

    }

    catch (err) {

        console.error("❌ Server Startup Failed");

        console.error(err);

        process.exit(1);

    }

};

startServer();