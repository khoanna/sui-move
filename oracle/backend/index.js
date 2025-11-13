const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();

const {DB} = require("./database/mock");

app.get("/search", async (req, res) => {
  try {
    const text = req.query.q;
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${process.env.WEATHER_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching location data");
  }
});

app.post("/oracle", async (req, res) => {
  try {
    const {latitude, longitude, target} = req.body;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`
    );
    const data = await response.json();
    const temperatureK = data.main.temp;
    const temperatureC = temperatureK - 273.15;
    res.send("Oracle created");
  } catch (error) {
    res.status(500).send("Error creating oracle");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
