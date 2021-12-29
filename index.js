const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const DATABASE = process.env.DATABASE;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_BASE_URL = process.env.MONGO_BASE_URL;
const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_BASE_URL}/${DATABASE}?retryWrites=true&w=majority`;

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// routes

const groupsRouter = require("./routes/groups");
const itemsRouter = require("./routes/items");

app.get("/", (req, res) => {
	res.send("ga-p3-share your kitchen ler api");
});

app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/items", itemsRouter);

mongoose.connect(MONGO_URL).then(() => {
	app.listen(PORT, () => {
		console.log("DB connected & server on", PORT);
	});
});
