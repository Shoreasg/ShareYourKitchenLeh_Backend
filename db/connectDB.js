const mongoose = require("mongoose");

const connectDB = (url) => {
	// console.log(`connected DB`);
	return mongoose.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useCreateIndex: true,
		// useFindAndModify: false,
	});
};

module.exports = connectDB;
