import express, { application } from "express";
import Thread from "../models/thread.js"; 


const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 


async function getGeminiAPIResponse(messages) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    
  
    const geminiContents = messages.map(msg => ({
       
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user', 
        parts: [{ 
            
            text: msg.content 
        }]
    }));

    
   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
           
            contents: geminiContents, 
        }),
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`Gemini API call failed (${response.status}): ${JSON.stringify(errorDetails)}`);
        }
        
        const data = await response.json();
        
        
        return data.candidates[0].content.parts[0].text; 
        
    } catch (error) {
        throw new Error(`Error during Gemini API communication: ${error.message}`);
    }
}


const router = express.Router();


router.post("/gemini", async (req, res) => {
    try{
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


router.get("/thread", async (req, res) => {
    try {
        const threads= await Thread.find({}).sort({ updatedAt: -1 });
        res.send(threads);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});


router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId});
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);
    }catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});



router.delete("/thread/:threadId", async (req, res) => {
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

        // Call Gemini and handle possible quota / API errors gracefully
        let assistantReply = "";
        try {
            assistantReply = await getGeminiAPIResponse(thread.messages);
        } catch (err) {
            console.error("Gemini API error:", err);

            // If the error indicates rate-limit / quota issues, expose minimal info and provide a friendly fallback reply
            const fallback = "Sorry — the language model is currently unavailable due to quota or service limits. Please try again later.";

            // attempt to parse a retry delay from the error message
            let retryAfterSec = null;
            try {
                const m = String(err.message).match(/retryDelay\"?:\"?(\d+)s/);
                if (m) retryAfterSec = m[1];
            } catch (e) {}

            if (retryAfterSec) {
                // set Retry-After header if available (seconds)
                res.setHeader('Retry-After', String(retryAfterSec));
            }

            assistantReply = fallback;
            thread.messages.push({ role: "model", content: assistantReply });
            thread.updatedAt = new Date();
            await thread.save();

            // return 200 so frontend gets a reply to display; include error for debugging
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