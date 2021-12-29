const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const app = express();
app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:5000",
		methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
		credentials: true,
	})
);
const userController = require("./controllers/userController");

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(userController);



module.exports = app;
