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
			default:
				"https://www.gemkom.com.tr/wp-content/uploads/2020/02/NO_IMG_600x600-1.png",
		},
		members: [String],
		ownerID: {
			type: mongoose.Types.ObjectId,
			ref: "Member",
			required: [true, "Need a member"],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
