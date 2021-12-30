const Member = require("../models/Member");
const Group = require("../models/Group");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");

const createMember = async (req, res) => {
	const { username: memberName } = req.body;

	if (!memberName) {
		throw new BadRequestError("Please provide an unique name");
	}

	// check if member is existing or new
	const checkUniqueName = await Member.exists({ memberName });

	// if existing : return json with msg
	if (checkUniqueName) {
		return res.status(StatusCodes.CONFLICT).json({
			status: "rejected",
			message: "Name is taken, please enter another name",
		});
	}

	// if new : create new member & new default group assigned
	const personalGRP = `${memberName}-Personal`;
	const member = await Member.create({ memberName });
	const group = await Group.create({
		grpName: personalGRP,
		ownerID: member._id,
		members: [member._id],
	});

	// updating the created group into newly created member profile
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
		.json({ status: "OK", count: members.length, data: members });
};

// get single member profile

const getMember = async (req, res) => {
	const id = req.params.id;

	const member = await Member.findById({ _id: id });

	return res.status(StatusCodes.OK).json({ status: "OK", data: member });
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
