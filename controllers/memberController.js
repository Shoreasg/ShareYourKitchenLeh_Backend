const Member = require("../models/Member");
const Group = require("../models/Group");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");

const createMember = async (req, res) => {
	const { username: memberName } = req.body;

	if (!memberName) {
		throw new BadRequestError("Please provide an unique name");
	}

	const checkUniqueName = await Member.exists({ memberName });

	if (checkUniqueName) {
		return res.status(StatusCodes.CONFLICT).json({
			status: "rejected",
			message: "Name is taken, please enter another name",
		});
	}

	// create new member & new default group assigned
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

	return res.status(StatusCodes.CREATED).json({ updatedMember, group });
};

const getAllMembers = async (req, res) => {
	const { groupID, search } = req.query;
	console.log(req.query);
	const queryObj = {};

	if (search) {
		queryObj.memberName = { $regex: search, $options: "i" };
	}

	if (groupID) {
		queryObj.groupsID = { $in: [groupID] };
	}

	const members = await Member.find(queryObj);

	res
		.status(StatusCodes.OK)
		.json({ status: "OK", count: members.length, results: members });
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
