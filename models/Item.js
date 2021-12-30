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
		expiryDate: {
			type: Date,
			required: [true, "Please provide a item's expiry date"],
		},
		qty: {
			type: Number,
			required: [true, "Please provide a item's quantity value"],
			min: 0,
		},
		favourite: Boolean,
		grpID: {
			type: mongoose.Types.ObjectId,
			ref: "Group",
			required: [true, "Please select group to save item"],
		},
		imgUrl: {
			type: String,
			trim: true,
			default:
				"https://www.gemkom.com.tr/wp-content/uploads/2020/02/NO_IMG_600x600-1.png",
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
