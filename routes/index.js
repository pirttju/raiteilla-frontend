const express = require("express");
const router = express.Router();

// Landing Page
router.get("/", (req, res) => {
  res.render("index", { title: req.t("Raiteilla - Real-time Trains") });
});

// Route for the dedicated map page
router.get("/map", (req, res) => {
  res.render("map", { title: req.t("Map") });
});

// Route for the list of all stations
router.get("/stations", (req, res) => {
  res.render("stations", { title: req.t("All Stations") });
});

// Station View
router.get("/station/:country/:station/:date", (req, res) => {
  res.render("station", {
    title: `${req.t("Station")}: ${req.params.station}`,
    country: req.params.country,
    station: req.params.station,
    date: req.params.date,
  });
});

// Train View
router.get("/train/:country/:trainNumber/:date", (req, res) => {
  res.render("train", {
    title: `${req.t("Train")}: ${req.params.trainNumber}`,
    country: req.params.country,
    trainNumber: req.params.trainNumber,
    date: req.params.date,
  });
});

module.exports = router;
