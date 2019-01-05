const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log(req.method + "    " + req.url);

    // Successful authentication, redirect home.
    res.redirect("/stories");
  }
);

router.get("/verify", (req, res) => {
  if (req.user) {
    console.log(req.method + "    " + req.url);
    console.log(req.user);
  } else {
    console.log("not auth");
  }
});

router.get("/logout", (req, res) => {
  console.log(req.method + "    " + req.url);

  req.logout();
  res.redirect("/");
});

module.exports = router;
