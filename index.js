const express = require("express");
const axios = require("axios");
const app = express();

app.use(async (req, res) => {
  try {
    const url = "https://v3.football.api-sports.io" + req.url;
    console.log("Fetching:", url);
    const r = await axios.get(url, {
      headers: { "x-apisports-key": "20b03b767c78b8c3ad618f1830a6a6b8" }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("Proxy corriendo"));
