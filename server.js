import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();


const PORT = process.env.PORT || 8080;


app.use(express.json());


app.use(cors({
  origin: [
    "https://easy-chat-ebon.vercel.app", 
    "https://easy-chat-git-master-vivek7941s-projects.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));


app.get("/", (req, res) => {
    res.status(200).send("API is running...");
});


app.use("/api/thread", chatRoutes);


const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env file");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log(" Connected to MongoDB successfully.");

        
        app.listen(PORT, () => {
            console.log(` Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(" Error connecting to MongoDB:", error.message);
        process.exit(1); 
    }
};

// Gemini API Key Check
if (!process.env.GEMINI_API_KEY) {
    console.warn(" Warning: GEMINI_API_KEY is not set in environment.");
}

// Initialize Connection
connectDB();
