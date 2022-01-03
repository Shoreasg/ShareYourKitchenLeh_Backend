const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
	{
		grpName: {
			type: String,
			required: true,
			maxlength: 50,
			trim: true,
		},
		imgUrl: {
			type: String,
			trim: true,
			default:
				"https://www.gemkom.com.tr/wp-content/uploads/2020/02/NO_IMG_600x600-1.png",
		},
		members: [{ type: mongoose.Types.ObjectId, ref: "User2", required: true }],
		ownerID: {
			type: mongoose.Types.ObjectId,
			ref: "User2",
			required: true
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Group2", GroupSchema);
