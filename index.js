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
    const prompt = `Eres un experto en apuestas deportivas de futbol. Analiza este partido del Mundial 2026 y devuelve SOLO un JSON valido sin markdown ni backticks.

Partido: ${homeTeam} vs ${awayTeam}
Fase: ${stage}
Stats ${homeTeam}: goles/partido=${homeStats.avgGoalsFor}, recibe=${homeStats.avgGoalsAgainst}, forma=${homeStats.winsInForm5}/5 victorias
Stats ${awayTeam}: goles/partido=${awayStats.avgGoalsFor}, recibe=${awayStats.avgGoalsAgainst}, forma=${awayStats.winsInForm5}/5 victorias
H2H: ${h2hMatches?.length || 0} partidos historicos

Devuelve exactamente este JSON:
{"probHomeWin":50,"probDraw":25,"probAwayWin":25,"casuisticas":[{"nombre":"string","activa":true,"mercado":"string","razon":"string"}],"recomendacion":"string","analisis":"string","confianza":"ALTA"}`;

    const claudeClient = axios.create({
      baseURL: "https://api.anthropic.com",
      headers: {
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    });

    const r = await claudeClient.post("/v1/messages", {
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = r.data.content[0].text.replace(/```json|```/g, '').trim();
    const json = JSON.parse(text);
    res.json(json);
  } catch(e) {
    res.status(500).json({ error: e.message, detail: e.response?.data });
  }
});

app.use(async (req, res) => {
  try {
    const footballClient = axios.create({
      baseURL: "https://api.football-data.org/v4",
      headers: { "X-Auth-Token": FOOTBALL_KEY }
    });
    const r = await footballClient.get(req.url);
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("Proxy corriendo"));
