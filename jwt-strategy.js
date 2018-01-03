var app = require("express")();
var bodyparser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
var passportjwt = require("passport-jwt");
var jwt = require("jsonwebtoken");
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
app.use(bodyparser({ extended: true }));
require("./db");
let userModel = require("./model");
app.use(
  session({
    secret: "mycat",
    token: null,
    resave: true,
    saveUninitialized: true
  })
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
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "Mycat",
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(jwt_payload, done) {
      console.log("JWT payload is" + jwt_payload.json());
      userModel.findOne({ email: jwt_payload.email }, function(err, user) {
        console.log(`found user is${user}`);
        // if there are any errors, return the error before anything else
        if (err) return done(err);

        // if no user is found, return the message
        if (!user) return done(null, false); // req.flash is the way to set flashdata using connect-flash
        console.log("user worng");
        // if the user is found but the password is wrong
        if (user.password != "qwerty") {
          console.log("password wrong");
          return done(null, false);
        }

        //  req.flash("loginMessage", "Oops! Wrong password.")
        // ); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
      });
    }
  )
);
app.post("/auth", (req, res) => {
  userModel.findOne({ email: req.body.email }, (error, user) => {
    if (error) {
      throw error;
    }
    token = jwt.sign(jwt.sign({ email: req.body.email }, "Mycat"));
    res.json({
      token: "Bearer " + token
    });
  });
});
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }, (req, res) => {
    res.json("token worked and user is" + req.user);
  })
);
app.post(
  "/login",
  passport.authenticate("jwt", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {
    res.json({ message: "User login success" });
  }
);
app.get("/login", (req, res) => {
  res.json({
    message: "User navigated to login after authentication failure"
  });
});
app.get("/profile", (req, res) => {
  res.json({
    message: "User navigated to profile after successfull loagin"
  });
});
app.get("/", (req, res) => {
  res.send("In default route");
});
app.post("/newuser", (req, res) => {
  userdata = {
    userid: req.body.userid,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };
  userModel.create(userdata, (error, usercreated) => {
    if (error) {
      console.log("Error while creating new user");
    }
    res.status(200).json({
      message: "Record inserted",
      user: usercreated
    });
  });
});
app.listen(3000, (error, success) => {
  if (error) {
    console.log("Error while connecting server");
  }
  console.log("Server connected");
});
