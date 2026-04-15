import "dotenv/config";

const getGeminiResponse = async (messages) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    // Using the official Google Generative AI endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Formatting the history correctly for Gemini's native API
    const contents = messages.map(msg => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(data.error?.message || "Gemini API failure");
        }

        // Return the text to chat.js
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Helper Error:", error.message);
        throw error; 
    }
};

export default getGeminiResponse;
