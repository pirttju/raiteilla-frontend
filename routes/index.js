const express = require("express");
const router = express.Router();

// Landing Page
router.get("/", (req, res) => {
  res.render("index", { title: res.__("Raiteilla - Real-time Trains") });
});

// Station View
router.get("/station/:country/:station", (req, res) => {
  res.render("station", {
    title: `${res.__("Station")}: ${req.params.station}`,
    country: req.params.country,
    station: req.params.station,
  });
});

// Train View
router.get("/train/:country/:trainNumber/:date", (req, res) => {
  res.render("train", {
    title: `${res.__("Train")}: ${req.params.trainNumber}`,
    country: req.params.country,
    trainNumber: req.params.trainNumber,
    date: req.params.date,
  });
});

module.exports = router;
