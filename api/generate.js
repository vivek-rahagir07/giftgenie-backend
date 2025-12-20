export default async function handler(req, res) {
  // ----- CORS -----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a helpful gift recommendation assistant."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await groqResponse.json();

    const text =
      data?.choices?.[0]?.message?.content ||
      "No response from AI";

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Groq error:", error);
    return res.status(500).json({ error: "AI failed" });
  }
}
