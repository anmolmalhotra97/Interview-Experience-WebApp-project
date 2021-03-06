const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// Load User Model
require("../models/user");
const User = mongoose.model("users");

// User Login Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// User Register Route
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Login Form POST
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/stories",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Register Form POST
router.post("/register", (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: "Passwords do not match" });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      fname: req.body.fname,
      lame: req.body.lame,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        console.log("email already registered");
        // req.flash("error_msg", "Email already regsitered");
        if (user.password == "") {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              // if (err) throw err;
              req.body.password = hash;
              user.password = req.body.password;
              user
                .save()
                .then(user => {
                  console.log("successfully registered");
                  // req.flash(
                  //   "success_msg",
                  //   "You are now registered and can log in"
                  // );
                  res.redirect("/users/login");
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
            });
          });
        } else {
          console.log("both logins were set but still an attempt was made");
          res.redirect("/users/login");
        }
        // user.password = req.body.password;
        // user.save().then(user => {
        //   res.redirect("/users/login");
        // });
      } else {
        const newUser = new User({
          googleID: Date.now(),
          firstName: req.body.fname,
          lastName: req.body.lname,
          email: req.body.email,
          password: req.body.password,
          image: ""
        });
        if (req.body.java) newUser.tags.push("java");
        if (req.body.ds) newUser.tags.push("data-structure");
        if (req.body.cpp) newUser.tags.push("cpp");

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            // if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                console.log("successfully registered");
                // req.flash(
                //   "success_msg",
                //   "You are now registered and can log in"
                // );
                res.redirect("/users/login");
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});

//edit user info
router.put("/edit/:id", (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: "Passwords do not match" });
  }

  if (req.body.password.length < 4 && req.body.password.length != 0) {
    errors.push({ text: "Password must be at least 4 characters" });
  }

  if (errors.length > 0) {
    res.render("users/edit", {
      errors: errors,
      fname: req.body.fname,
      lame: req.body.lame,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({
      _id: req.params.id
    }).then(user => {
      // New values
      user.firstName = req.body.fname;
      user.lastName = req.body.lname;
      user.tags.pop();
      user.tags.pop();
      user.tags.pop();
      user.tags.pop();
      if (req.body.java) user.tags.push("java");
      if (req.body.ds) user.tags.push("data-structure");
      if (req.body.cpp) user.tags.push("cpp");
      if (req.body.password.length != 0) {
        user.password = req.body.password;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            // if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => {
                console.log("information eddited successfully");
                // req.flash(
                //   "success_msg",
                //   "You are now registered and can log in"
                // );
                res.redirect("/users/edit");
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      } else {
        user.save().then(user => {
          console.log("information eddited successfully");
          // req.flash(
          //   "success_msg",
          //   "You are now registered and can log in"
          // );
          res.redirect("/users/edit");
        });
      }
    });
  }
});

// User information change Route
router.get("/edit", ensureAuthenticated, (req, res) => {
  res.render("users/edit");
});

//Logout User
router.get("/logout", (req, res) => {
  req.logOut();
  // req.flash("success", "You are logged out");
  res.redirect("/users/login");
});
module.exports = router;
