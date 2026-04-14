import express from "express";
import Thread from "../models/thread.js";
import getGeminiResponse from "../utils/gemini.js"; 

const router = express.Router();


router.post("/gemini", async (req, res) => {
    try {
        const newThread = new Thread({
            threadId: "name12367",
            title: "how are you boy?",
            messages: [{ role: "user", content: "Test message" }]
        });
        const response = await newThread.save();
        res.send(response);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Server Error");
    }
});


router.get("/", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        res.send(threads);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});


router.get("/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});


router.delete("/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deleteThread = await Thread.findOneAndDelete({ threadId });
        if (!deleteThread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ message: "Thread deleted successfully" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});


router.post("/", async (req, res) => {
    const { threadId, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message field is required." });
    }

    try {
        let thread;

        if (threadId) {
            thread = await Thread.findOne({ threadId });
        }

        if (!thread) {
            const newThreadId = threadId || `chat_${Date.now()}`;
            const threadTitle = message.substring(0, 50);
            thread = new Thread({
                threadId: newThreadId,
                title: threadTitle,
                messages: [],
            });
        }

        thread.messages.push({ role: "user", content: message });

        let assistantReply = "";
        try {
            assistantReply = await getGeminiResponse(thread.messages);
        } catch (err) {
            console.error("Gemini API error:", err);

            const fallback = "Sorry — the language model is currently unavailable due to quota or service limits. Please try again later.";

            let retryAfterSec = null;
            try {
                const m = String(err.message).match(/retryDelay\"?:\"?(\d+)s/);
                if (m) retryAfterSec = m[1];
            } catch (e) {}

            if (retryAfterSec) {
                res.setHeader("Retry-After", String(retryAfterSec));
            }

            assistantReply = fallback;
            thread.messages.push({ role: "model", content: assistantReply });
            thread.updatedAt = new Date();
            await thread.save();

            return res.status(200).json({ reply: assistantReply, threadId: thread.threadId, error: String(err.message) });
        }

        thread.messages.push({ role: "model", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ reply: assistantReply, threadId: thread.threadId });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: error.message || "Server Error" });
    }
});

export default router;
