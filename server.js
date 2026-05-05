import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    });

    const reply = completion.choices[0].message.content;

    let audioBase64 = null;

    if (process.env.ELEVEN_API_KEY) {
      const voice = await axios.post(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
        { text: reply },
        {
          headers: {
            "xi-api-key": process.env.ELEVEN_API_KEY
          },
          responseType: "arraybuffer"
        }
      );

      audioBase64 = Buffer.from(voice.data).toString("base64");
    }

    res.json({ reply, audio: audioBase64 });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));