import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
// 1. Changed port to 5000 to avoid the 'Address in use' error
const PORT = 8080; 

app.use(express.json());
app.use(cors());

// Health check route (useful for testing)
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/chat", chatRoutes);

// 2. Database Connection Logic
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(" Connected to MongoDB successfully.");
        
        // 3. Only start the server once DB is connected
        app.listen(PORT, () => {
            console.log(` Server is running on https://easy-chat-frontend-blush.vercel.app/:${PORT}`);
        });
    } catch (error) { 
        console.error(" Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit if DB fails
    }
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in environment.");
}

connectDB();
