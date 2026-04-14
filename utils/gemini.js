import "dotenv/config";

const getGeminiResponse = async (messages) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // We use the OpenAI-compatible endpoint as you intended
    const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gemini-1.5-flash",
            // Pass the entire messages array to maintain chat history
            messages: messages.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content
            })),
        }),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Details:", data);
            throw new Error(data.error?.message || "API call failed");
        }

        // Return just the text content so chat.js can save it to MongoDB
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Gemini Utility Error:", error);
        throw error; // Let chat.js handle the error and show the fallback message
    }
};

export default getGeminiResponse;
// import "dotenv/config";

// const GetGeminiResponse = async (userMessage) => {
//     app.post("/api/gemini", async (req, res) => {
//         const userMessage = req.body.message;
    
//         if (!userMessage) {
//             return res.status(400).json({ error: "Message field is required." });
//         }
    
//         const options = {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${GEMINI_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: "gemini-1.5-flash",
//                 messages: [
//                     { role: "user", content: userMessage }
//                 ],
//             }),
//         };
    
//         try {
//             const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", options);
            
            
//             if (response.ok) {
//                 const errorDetails = await response.json();
//                 console.error("API Error:", errorDetails);
//                 return res.status(response.status).json({ error: "API call failed.", details: errorDetails });
//             }
            
//             const data = await response.json();
//             res.send(data.choices[0].message.content);
    
//         } catch (error) {
//             console.error("Server Catch Error:", error);
//             res.status(500).json({ error: "An unexpected server error occurred." });
//         }
//     });
    
// };

// export default GetGeminiResponse;
