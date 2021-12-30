const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
	{
		grpName: {
			type: String,
			required: [true, "Please provide a group name between 1 - 50 characters"],
			maxlength: 50,
			trim: true,
		},
		imgUrl: {
			type: String,
			trim: true,
		},
		members: [String],
		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: [true, "Please login as user"],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
