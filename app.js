const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport')
const session = require('express-session')
const User = require('./models/user')
const app = express();
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'], credentials: true }));
const userController = require('./controllers/localLoginController')
const socialController = require('./controllers/socialLoginController')


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {sameSite: "None"}
}));



app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(socialController)
app.use(userController)

// routes

const groupsRouter = require("./routes/groups");
const itemsRouter = require("./routes/items");
const membersRouter = require("./routes/members");

app.get("/", (req, res) => {
	res.send(
		"<div><h1>GA/SEIF7 - PROJECT 3: GROUP 1</h1><h2>Share your kitchen leh API</h2><ul><li><a href='/api/v1/members'>All Members</a></li><li><a href='/api/v1/groups'>All Groups</a></li><li><a href='/api/v1/items'>All Items</a></li></ul></div>"
	);
});

app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/members", membersRouter);

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");


module.exports = app
