const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
	{
		memberName: {
			type: String,
			required: [true, "Please provide an unique member name"],
			trim: true,
			unique: true,
		},
		groupsID: [String],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Member", MemberSchema);
