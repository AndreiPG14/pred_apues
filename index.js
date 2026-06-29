const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const FOOTBALL_KEY = process.env.API_KEY || "fb0aaad7b0fc4a6db0b46b1df26a79cc";
const GROQ_KEY = process.env.GROQ_KEY || process.env.GROQ_KEY;

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
    const prompt = `Eres un experto en apuestas deportivas de futbol. Analiza este partido del Mundial 2026 y devuelve SOLO un JSON valido sin markdown ni backticks ni texto adicional.

Partido: ${homeTeam} vs ${awayTeam}
Fase: ${stage}
Stats ${homeTeam}: goles/partido=${homeStats.avgGoalsFor}, recibe=${homeStats.avgGoalsAgainst}, forma=${homeStats.winsInForm5}/5 victorias, cleanSheets=${homeStats.cleanSheetPct}%
Stats ${awayTeam}: goles/partido=${awayStats.avgGoalsFor}, recibe=${awayStats.avgGoalsAgainst}, forma=${awayStats.winsInForm5}/5 victorias, cleanSheets=${awayStats.cleanSheetPct}%
H2H: ${h2hMatches?.length || 0} partidos historicos

Devuelve exactamente este JSON sin nada mas:
{"probHomeWin":50,"probDraw":25,"probAwayWin":25,"casuisticas":[{"nombre":"string","activa":true,"mercado":"string","razon":"string"}],"recomendacion":"string","analisis":"2-3 oraciones sobre el partido","confianza":"ALTA"}`;

    const groqClient = axios.create({
      baseURL: "https://api.groq.com/openai/v1",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const r = await groqClient.post("/chat/completions", {
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = r.data.choices[0].message.content.replace(/```json|```/g, '').trim();
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

