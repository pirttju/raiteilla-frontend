const express = require("express");
const axios = require("axios");
const router = express.Router();

const { API_BASE_URL, BETA_API_BASE_URL } = process.env;

// Proxy for trains at a station on a specific date (the timetable)
router.get("/stations/:country/:stationCode/:date", async (req, res) => {
  try {
    const { country, stationCode, date } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/stations/${country}/${stationCode}/${date}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy for a single station's information
router.get("/stations/:country/:stationCode", async (req, res) => {
  try {
    const { country, stationCode } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/stations/${country}/${stationCode}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy for all stations in a country
router.get("/stations/:country", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/stations/${req.params.country}/`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy for all trains in a country
router.get("/trains/:country/:date", async (req, res) => {
  try {
    const { country, date } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/trains/${country}/${date}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy for a single train
router.get("/trains/:country/:date/:trainNumber", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/trains/${req.params.country}/${req.params.date}/${req.params.trainNumber}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy for real-time vehicle locations
router.get("/vehicles", async (req, res) => {
  try {
    const { routeType, bbox } = req.query;
    const response = await axios.get(
      `${BETA_API_BASE_URL}/vehicles?routeType=${routeType}&bbox=${bbox}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
