var app = require("express")();
var bodyparser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
app.use(bodyparser({ extended: true }));
require("./db");
let userModel = require("./model");
// app.use(
//   bodyparser({
//     extended: true
//   })
// );

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
  console.log(`using id is ${id}`);
  userModel.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  "local",
  new LocalStrategy(
    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
      userModel.findOne({ email: email }, function(err, user) {
          console.log(`found user is${user}`);
        // if there are any errors, return the error before anything else
        if (err) return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash("loginMessage", "No user found.")); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (user.password != "qwerty")
          return done(
            null,
            false,
            req.flash("loginMessage", "Oops! Wrong password.")
          ); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
      });
    }
  )
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {
    res.json({ message: "User login success" });
  }
);
app.get('/login',(req,res)=>{
    res.json({
        "message":"User navigated to login after authentication failure"
    })
})
app.get('/profile',(req,res)=>{
    res.json({
     "message":"User navigated to profile after successfull loagin"
    });
})
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
