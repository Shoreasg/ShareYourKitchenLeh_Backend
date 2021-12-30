const Member = require("../models/Member");
const Group = require("../models/Group");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");

const createMember = async (req, res) => {
	const { username: memberName } = req.body;

	if (!memberName) {
		throw new BadRequestError("Please provide an unique name");
	}

	// create new member & new default group
	const personalGRP = `${memberName}-Personal`;
	const member = await Member.create({ memberName });
	const group = await Group.create({
		grpName: personalGRP,
		ownerID: member._id,
		members: [member._id],
	});

	const updatedMember = await Member.findByIdAndUpdate(
		{ _id: member._id },
		{ groupsID: [group._id] },
		{ new: true, runValidators: true }
	);

	res.status(StatusCodes.CREATED).json({ updatedMember, group });
};

const getAllMembers = async (req, res) => {
	res.send("get all Member");
};

const getMember = async (req, res) => {
	res.send("get Member");
};

const updateMember = async (req, res) => {
	res.send("update Member");
};

const deleteMember = async (req, res) => {
	res.send("delete Member");
};

module.exports = {
	getAllMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
};
