const express = require("express");
const app = express();

app.use(async (req, res) => {
  try {
    const url = "https://v3.football.api-sports.io" + req.url;
    const r = await fetch(url, {
      headers: { "x-apisports-key": "20b03b767c78b8c3ad618f1830a6a6b8" }
    });
    const data = await r.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Proxy corriendo"));
