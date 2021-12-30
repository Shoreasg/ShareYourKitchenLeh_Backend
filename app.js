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
		origin: "http://localhost:3000",
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

// routes

const groupsRouter = require("./routes/groups");
const itemsRouter = require("./routes/items");

app.get("/", (req, res) => {
	res.send("ga-p3-share your kitchen ler api");
});

app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/items", itemsRouter);

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
module.exports = app;
