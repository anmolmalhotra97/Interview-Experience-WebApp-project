const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("./keys");
//load user model
const User = mongoose.model("users");
module.exports = function(passport_google) {
  passport_google.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        // console.log(accessToken);
        // console.log(profile);
        const image = profile.photos[0].value.substring(
          0,
          profile.photos[0].value.indexOf("?")
        );
        // console.log(image);
        const newUser = {
          googleID: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          password: "",
          image: image
        };

        //check for user
        User.findOne({
          email: profile.emails[0].value
        })
          .then(user => {
            if (user) {
              //return user
              done(null, user);
            } else {
              //Create user
              new User(newUser)
                .save()
                .then(user => done(null, user))
                .catch(err => console.log("LOGGED IN ERROR IS " + err));
            }
          })
          .catch(err => console.log(err));
      }
    )
  );
  passport_google.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport_google.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
};
