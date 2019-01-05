const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();

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

//Logout User
router.get("/logout", (req, res) => {
  req.logOut();
  // req.flash("success", "You are logged out");
  res.redirect("/users/login");
});
module.exports = router;
