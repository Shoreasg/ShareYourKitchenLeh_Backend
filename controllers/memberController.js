const Member = require("../models/user");
const Group = require("../models/Group");
const { StatusCodes } = require("http-status-codes");

// ============================>> CREATE new member
const createMember = async (req, res) => {
	try {
		const { username: memberName } = req.body;

		if (!memberName) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: "BAD REQUEST",
				message: `Please provide an unique name`,
			});
		}

		// check if name is existing or new
		const checkUniqueName = await Member.exists({ memberName });

		// if EXISTING : return json with msg
		if (checkUniqueName) {
			return res.status(StatusCodes.CONFLICT).json({
				status: "CONFLICT",
				message: "Name is taken, please provide another name",
			});
		}

		// if NEW : create new member & new default group assigned
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
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> GET all members

const getAllMembers = async (req, res) => {
	try {
		const { groupID, search } = req.query;

		const queryObj = {};

		if (search) {
			queryObj.memberName = { $regex: search, $options: "i" };
		}

		if (groupID) {
			queryObj.groups = { $in: [groupID] };
		}

		const members = await Member.find(queryObj);

		return res
			.status(StatusCodes.OK)
			.json({ status: "OK", count: members.length, data: members });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> GET SINGLE member profile

const getMember = async (req, res) => {
	try {
		const id = req.params.id;

		const member = await Member.findOne({ _id: id });

		if (!member) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		return res.status(StatusCodes.OK).json({ status: "OK", data: member });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> UPDATE Member

const updateMember = async (req, res) => {
	try {
		const id = req.params.id;

		let member = await Member.findOne({ _id: id });

		if (!member) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		member = await Member.findByIdAndUpdate({ _id: id }, req.body, {
			new: true,
			runValidators: true,
		});

		return res.status(StatusCodes.OK).json({ status: "OK", data: member });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> DELETE Member (have to delete all items/groups owned by member also)
const deleteMember = async (req, res) => {
	// to be continue, because need to delete all records owned by member and relevant group/member will be affected
	res.status(StatusCodes.OK).json({ status: "NOT READY" });
};

module.exports = {
	getAllMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
};
