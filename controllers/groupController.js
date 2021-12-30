const Member = require("../models/Member");
const Group = require("../models/Group");
const { StatusCodes } = require("http-status-codes");
const lodash = require("lodash");

// ============================>> CREATE NEW GROUP
// each group created, will also updated member's profile with this.group id added
const createGroup = async (req, res) => {
	try {
		const { grpName, imgUrl, members, ownerID } = req.body;

		if (!grpName || !ownerID) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: "BAD REQUEST",
				message: `Please provide group name and owner ID`,
			});
		}

		// check if name is existing or new
		const checkUniqueName = await Group.exists({ grpName, ownerID });

		// if EXISTING : return json with msg
		if (checkUniqueName) {
			return res.status(StatusCodes.CONFLICT).json({
				status: "CONFLICT",
				message: "Name is taken, please provide another name",
			});
		}

		// if NEW : create new group and update member profile of newly added groupsID

		const group = await Group.create({
			grpName,
			ownerID,
			imgUrl,
			members: [ownerID, ...members],
		});

		// updating the created group into newly created membersss profile
		// updating groupsID into every members profile

		if (group.members.length > 0) {
			for (const element of group.members) {
				let checkMemberGRP = await Member.findByIdAndUpdate({ _id: element });
				if (!checkMemberGRP.groupsID.includes(group._id)) {
					const updatedMember = await Member.findByIdAndUpdate(
						{ _id: element },
						{ $push: { groupsID: group._id } },
						{ new: true, runValidators: true }
					);
				}
			}
		}

		return res.status(StatusCodes.CREATED).json({ group });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> GET ALL Groups

const getAllGroups = async (req, res) => {
	try {
		const { ownerID, search, members } = req.query;
		const queryObj = {};

		if (search) {
			queryObj.grpName = { $regex: search, $options: "i" };
		}

		if (members) {
			queryObj.members = { $in: [members] };
		}

		if (ownerID) {
			queryObj.ownerID = ownerID;
		}

		const group = await Group.find(queryObj);
		return res
			.status(StatusCodes.OK)
			.json({ status: "OK", count: group.length, data: group });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> GET SINGLE Group detail

const getGroup = async (req, res) => {
	try {
		const id = req.params.id;

		const group = await Group.findOne({ _id: id });

		if (!group) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		return res.status(StatusCodes.OK).json({ status: "OK", data: group });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> UPDATE Group
// to be continue for UPDATE GROUP BECAUSE CANNOT UPDATE MEMBER
const updateGroup = async (req, res) => {
	try {
		const id = req.params.id;
		let { grpName, imgUrl, members, ownerID } = req.body;
		members = [ownerID, ...members];

		let group = await Group.findOne({ _id: id });

		if (!group) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		// // if group's member is changed, will need to update member's profile groupID
		// let toREMOVE;
		// let toADD;

		// if (group.members !== members) {
		// 	toREMOVE = lodash.difference(group.members, members);
		// 	toADD = lodash.difference(members, group.members);

		// 	console.log(`to remove: ${toREMOVE}`);
		// 	console.log(`to add: ${toADD}`);
		// }

		// if (toADD.length) {
		// 	// ADDING GRP ID into member's profile
		// 	for (let element of toADD) {
		// 		let updatedMember = await Member.findByIdAndUpdate(
		// 			{ _id: element },
		// 			{ $push: { groupsID: id } },
		// 			{ new: true, runValidators: true }
		// 		);
		// 	}
		// }
		// if (toREMOVE.length) {
		// 	// REMOVE GRP ID from member's profile
		// 	for (let element of toREMOVE) {
		// 		let current = await Member.findOne({ _id: element });
		// 		let filterList = await current.groupsID.filter((item) => item !== id);
		// 		let updatedMember = await Member.findByIdAndUpdate(
		// 			{ _id: element },
		// 			{ groupsID: filterList },
		// 			{ new: true, runValidators: true }
		// 		);
		// 	}
		// }

		// Updating Group
		group = await Group.findByIdAndUpdate(
			{ _id: id },
			{
				grpName,
				imgUrl,
				members,
				ownerID,
			},
			{ new: true, runValidators: true }
		);

		return res.status(StatusCodes.OK).json({ status: "OK", data: group });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

const deleteGroup = async (req, res) => {
	res.send("delete group");
};

module.exports = {
	getAllGroups,
	getGroup,
	createGroup,
	updateGroup,
	deleteGroup,
};
