const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {DB} = require("./database/mock");
const {ONE_MINUTE_MS} = require("./lib/constants");
const { createOracle, updateOracles } = require("./service/oracle");

app.get("/search", async (req, res) => {
  try {
    const text = req.query.q;
    console.log(text);
    
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
    const {latitude, longitude, city_name, target_temp, target_time} = req.body;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`
    );
    const data = await response.json();
    const temperatureK = data.main.temp;
    const temperatureC = Math.round((temperatureK - 273.15) * 100) / 100;
    
    const result = await createOracle(
      city_name,
      temperatureC,
      target_temp,
      target_time
    );
    
    const newOracle = {
      id: result.oracleId,
      predict_id: result.userPredictionId,
      city_name,
      latitude,
      longitude,
      target_time,
      target_temp
    };
    
    DB.push(newOracle);
    
    res.json({
      success: true,
      oracle: newOracle,
      message: "Oracle created successfully"
    });
  } catch (error) {
    console.error("Error creating oracle:", error);
    res.status(500).json({ 
      success: false,
      error: "Error creating oracle",
      details: error.message 
    });
  }
});

app.get("/oracles", (req, res) => {
  res.json(DB);
});

setInterval(async () => {
  console.log(`Checking ${DB.length} oracles for updates...`);
  
  for (const oracle of DB) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${oracle.latitude}&lon=${oracle.longitude}&appid=${process.env.WEATHER_API_KEY}`
      );
      const data = await response.json();
      const temperatureK = data.main.temp;
      const temperatureC = Math.round((temperatureK - 273.15) * 100) / 100;
      const ended = Date.now() > oracle.target_time; // target_time is in milliseconds
      console.log(`Updating oracle ${oracle.city_name}: temp=${temperatureC}°C, ended=${ended}`);
      await updateOracles(oracle.id, temperatureC, ended);
      console.log(`✓ Updated oracle ${oracle.city_name}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to update oracle ${oracle.city_name}:`, error.message);
    }
  }
}, ONE_MINUTE_MS);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
