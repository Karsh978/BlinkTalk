import { Response } from "express";

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const { message, history } = req.body; // history = previous messages array

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const messages = [
      {
        role: "system",
        content: "Tum Jiva ho — BlinkTalk app ka personal AI assistant. Friendly, helpful, aur concise jawab do. User jis language mein baat kare (Hindi/English/Hinglish), usi mein reply karo.",
      },
      ...(history || []).map((h: any) => ({
        role: h.role === "ai" ? "assistant" : "user",
        content: h.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Groq's fast model
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Groq error:", data);
      return res.status(500).json({ message: "AI service error" });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, kuch error aaya!";
    res.status(200).json({ reply });
  } catch (error: any) {
    console.log("Error in chatWithAI:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};