var app = require("express")();
var bodyparser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
var passportjwt = require('passport-jwt');
var jwt = require('jsonwebtoken');
var JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
var googlestrategy = require('passport-google-oauth20').Strategy;
app.use(bodyparser({ extended: true }));
//require("./db");
//let userModel = require("./model");
app.use( session({secret: "mycat",token: null,resave: true,saveUninitialized: true})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
  userModel.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new googlestrategy({
    clientID: '229865362615-07ad2oi1ma608lqna7abppp9r4pcccbl.apps.googleusercontent.com',
    clientSecret: "B1Mx2gcKRGiD5eTXFom8f0J-",
    callbackURL: "http://localhost:3000/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get('/googlelogin',passport.authenticate('google', { scope: ['profile'] }));
app.get('/redirect',(req,res)=>{
    res.send("User navigated after login");
})

app.listen(3000, (error, success) => {
  if (error) {
    console.log("Error while connecting server");
  }
  console.log("Server connected");
});
