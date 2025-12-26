import "dotenv/config";

const GetGeminiResponse = async (userMessage) => {
    app.post("/api/gemini", async (req, res) => {
        const userMessage = req.body.message;
    
        if (!userMessage) {
            return res.status(400).json({ error: "Message field is required." });
        }
    
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GEMINI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gemini-1.5-flash",
                messages: [
                    { role: "user", content: userMessage }
                ],
            }),
        };
    
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", options);
            
            
            if (response.ok) {
                const errorDetails = await response.json();
                console.error("API Error:", errorDetails);
                return res.status(response.status).json({ error: "API call failed.", details: errorDetails });
            }
            
            const data = await response.json();
            res.send(data.choices[0].message.content);
    
        } catch (error) {
            console.error("Server Catch Error:", error);
            res.status(500).json({ error: "An unexpected server error occurred." });
        }
    });
    
};

export default GetGeminiResponse;