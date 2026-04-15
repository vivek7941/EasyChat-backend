import "dotenv/config";

const getGeminiResponse = async (messages) => {
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from the server environment.");
    }

   
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    
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
            console.error("Gemini API Error details:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Gemini API failure");
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Gemini returned no response candidates.");
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Helper Error:", error.message);
        throw error; 
    }
};

export default getGeminiResponse;
