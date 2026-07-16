require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");

const catalogRoutes = require("./routes/catalog");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
  res.locals.flash = req.session.flash || null;
  res.locals.error = req.session.error || null;
  delete req.session.flash;
  delete req.session.error;
  next();
});

app.use("/", catalogRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("500");
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Library app listening on http://localhost:${PORT}`);
});
