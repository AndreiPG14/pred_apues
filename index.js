const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const FOOTBALL_KEY = process.env.API_KEY || "fb0aaad7b0fc4a6db0b46b1df26a79cc";
const CLAUDE_KEY = process.env.CLAUDE_KEY || "";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/analyze", async (req, res) => {
  try {
    const { homeTeam, awayTeam, stage, homeStats, awayStats, h2hMatches } = req.body;
    const prompt = `Eres un experto en apuestas deportivas de fútbol. Analiza este partido del Mundial 2026 y devuelve SOLO un JSON válido sin markdown.

Partido: ${homeTeam} vs ${awayTeam}
Fase: ${stage}
Estadísticas ${homeTeam}: ${JSON.stringify(homeStats)}
Estadísticas ${awayTeam}: ${JSON.stringify(awayStats)}
H2H últimos partidos: ${JSON.stringify(h2hMatches?.slice(0,5))}

Devuelve exactamente este JSON:
{
  "probHomeWin": número entre 0-100,
  "probDraw": número entre 0-100,
  "probAwayWin": número entre 0-100,
  "casuisticas": [
    {"nombre": "string", "activa": true/false, "mercado": "string", "razon": "string"}
  ],
  "recomendacion": "string con la apuesta principal",
  "analisis": "string con 2-3 oraciones de contexto real del partido",
  "confianza": "ALTA" | "MEDIA" | "BAJA"
}`;

    const r = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    });

    const text = r.data.content[0].text;
    const json = JSON.parse(text);
    res.json(json);
  } catch(e) {
    res.status(500).json({ error: e.message, detail: e.response?.data });
  }
});

app.use(async (req, res) => {
  try {
    const url = "https://api.football-data.org/v4" + req.url;
    const r = await axios.get(url, {
      headers: { "X-Auth-Token": FOOTBALL_KEY }
    });
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message, detail: e.response?.data });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("Proxy corriendo"));


