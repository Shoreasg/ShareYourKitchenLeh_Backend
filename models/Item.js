const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide a item name"],
			lowercase: true,
			trim: true,
		},
		brand: {
			type: String,
			lowercase: true,
			trim: true,
		},
		expiryDate: Date,
		qty: Number,
		favourite: Boolean,
		grpName: {
			type: mongoose.Types.ObjectId,
			ref: "Group",
			required: [true, "Please select group to save item"],
		},
		imgUrl: {
			type: String,
			trim: true,
		},
		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: [true, "Please login as user"],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
