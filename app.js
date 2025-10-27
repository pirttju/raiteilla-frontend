const express = require("express");
const path = require("path");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// i18n configuration
i18n.configure({
  locales: ["en", "fi", "no", "sv"],
  defaultLocale: "en",
  queryParameter: "lang",
  directory: path.join(__dirname, "locales"),
  cookie: "raiteilla-lang",
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(i18n.init);

app.use((req, res, next) => {
  // Create a JSON string of translations needed by client-side scripts
  res.locals.clientTranslations = JSON.stringify({
    cancelled: res.__("Cancelled"),
    onTime: res.__("On time"),
    delayed: res.__("Delayed"),
    minutes: res.__("minutes"),
    scheduleForTrain: res.__("Schedule for Train"),
    operator: res.__("Operator"),
  });
  next();
});

// Middleware to set language based on browser preferences
app.use((req, res, next) => {
  const acceptedLanguages = req.acceptsLanguages(["en", "fi", "no", "sv"]);
  if (acceptedLanguages && !req.query.lang && !req.cookies["raiteilla-lang"]) {
    res.setLocale(acceptedLanguages);
  }
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/train-api/v1", apiRouter);

// Error handling
app.use(function (req, res, next) {
  res.status(404).render("error", {
    title: res.__("An Error Occurred"), // <-- ADD THIS LINE
    message: res.__("Page Not Found"),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
