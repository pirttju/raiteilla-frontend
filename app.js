const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const app = express();

i18next
  .use(Backend) // Tell i18next to use the file system backend
  .use(i18nextMiddleware.LanguageDetector) // Add the language detector middleware
  .init({
    // Configuration for the backend
    backend: {
      loadPath: path.join(__dirname, "locales/{{lng}}.json"),
    },
    fallbackLng: "en", // Default language
    preload: ["en", "fi", "sv", "no"], // Preload all languages

    // Configuration for the language detector
    detection: {
      // The order to check for a language
      order: ["querystring", "cookie", "header"],
      // The name of the cookie to store the language
      caches: ["cookie"],
      // The name of the query parameter
      lookupQuerystring: "lang",
      // The name of the cookie
      lookupCookie: "raiteilla-lang",
    },
  });

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(i18nextMiddleware.handle(i18next));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Make client-side translations available to all templates/views
app.use((req, res, next) => {
  res.locals.language = req.language;
  res.locals.clientTranslations = JSON.stringify({
    cancelled: req.t("Cancelled"),
    onTime: req.t("On time"),
    delayed: req.t("Delayed"),
    minutes: req.t("minutes"),
    operator: req.t("Operator"),
    scheduleForTrain: req.t("Schedule for Train"),
    timetableFor: req.t("timetableFor"),
    kilometerMarker: req.t("kilometerMarker"),
    stationIdentifier: req.t("stationIdentifier"),
    trainConsist: req.t("trainConsist"),
    totalLength: req.t("totalLength"),
    maxSpeed: req.t("maxSpeed"),
    toggleMap: req.t("toggleMap"),
  });
  next();
});

app.use((req, res, next) => {
  // Use a simple timestamp. This value will be the same until the server restarts.
  res.locals.cacheBuster = new Date().getTime();
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/train-api/v1", apiRouter);

// Error handling
app.use(function (req, res, next) {
  res.status(404).render("error", {
    title: req.t("An Error Occurred"),
    message: req.t("Page Not Found"),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
