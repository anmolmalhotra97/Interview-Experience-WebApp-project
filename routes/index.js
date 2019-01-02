const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Story = mongoose.model("stories");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

router.get("/", ensureGuest, (req, res) => {
  console.log(req.method + "    " + req.url);
  res.render("index/welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  console.log(req.method + "    " + req.url);
  Story.find({ user: req.user.id }).then(stories => {
    res.render("index/dashboard", {
      stories: stories
    });
  });
});

router.get("/about", (req, res) => {
  console.log(req.method + "    " + req.url);
  res.render("index/about");
});

module.exports = router;
