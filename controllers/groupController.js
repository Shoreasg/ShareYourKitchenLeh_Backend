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

		return res.status(StatusCodes.OK).json({ status: "OK", data: group });
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
		const { ownerID, search, members, fields } = req.query;
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

		let result = Group.find(queryObj);

		//______ sort ______//
		// eg items?sort=name,-qty
		// positive: a-z, negative is z-a
		if (sort) {
			const sortList = sort.split(",").join(" ");
			result = result.sort(sortList);
		} else {
			result = result.sort("createdAt");
		}

		//______ fields ______//
		//returning only selected fileds in the list e.g data of only name and qty
		if (fields) {
			const fieldsList = fields.split(",").join(" ");
			result = result.select(fieldsList);
		}

		const data = await result;
		return res
			.status(StatusCodes.OK)
			.json({ status: "OK", count: data.length, data });
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

		let group = await Group.findOne({ _id: id });

		if (!group) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		if (group.members !== [ownerID, ...members]) {
			// updating groupsID into every members profile

			if (members.length > 0) {
				for (const element of members) {
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

			let toREMOVE = lodash.difference(group.members, [ownerID, ...members]);

			if (toREMOVE.length > 0) {
				for (const element of toREMOVE) {
					const list = await Member.findOne({ _id: element });
					let newGRPList = list.groupsID.filter((item) => item !== id);

					await Member.findByIdAndUpdate(
						{ _id: element },
						{ groupsID: newGRPList },
						{
							new: true,
							runValidators: true,
						}
					);
				}
			}
		}
		members = [ownerID, ...members];
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

// ============================>> DELETE Group

const deleteGroup = async (req, res) => {
	try {
		const id = req.params.id;

		// if id wrong return no record
		let group = await Group.findOne({ _id: id });

		if (!group) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		// updating member profile group array, removed the groupsID

		// check all contain GroupsID member returning in array
		const members = await Member.find({
			groupsID: { $in: [id] },
		});

		// if array is truthy remove the id
		if (members) {
			for (let element of members) {
				let newGRPList = element.groupsID.filter((item) => item !== id);
				await Member.findByIdAndUpdate(
					{ _id: element._id },
					{ groupsID: newGRPList },
					{
						new: true,
						runValidators: true,
					}
				);
			}
		}

		// deleting group data
		group = await Group.findByIdAndRemove({ _id: id });

		return res.status(StatusCodes.OK).json({
			status: "OK",
			message: `member profile updated and group deleted`,
		});
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

module.exports = {
	getAllGroups,
	getGroup,
	createGroup,
	updateGroup,
	deleteGroup,
};
