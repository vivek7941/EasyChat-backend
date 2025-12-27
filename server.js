import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
  origin: "https://easy-chat-frontend-blush.vercel.app", 
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));


app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/chat", chatRoutes);


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully.");
        
       
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) { 
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit if DB fails
    }
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn(" Warning: GEMINI_API_KEY is not set in environment.");
}

connectDB();

