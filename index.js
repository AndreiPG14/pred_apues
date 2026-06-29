const express = require("express");
const axios = require("axios");
const app = express();

const API_KEY = process.env.API_KEY || "fb0aaad7b0fc4a6db0b46b1df26a79cc";

app.use(async (req, res) => {
  try {
    const url = "https://api.football-data.org/v4" + req.url;
    console.log("Fetching:", url);
    const r = await axios.get(url, {
      headers: { "X-Auth-Token": API_KEY }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message, status: e.response?.status });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("Proxy corriendo"));
