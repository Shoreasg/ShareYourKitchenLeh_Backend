const Member = require("../models/user");
const Group = require("../models/Group");
const Item = require("../models/Item");
const { StatusCodes } = require("http-status-codes");
const lodash = require("lodash");
const removeDup = require("../middleware/removeDup");

// ============================>> CREATE NEW GROUP
// each group created, will also updated member's profile with this.group id added
const createGroup = async (req, res) => {
	try {
		let { grpName, imgUrl, members, ownerID } = req.body;

		if (!grpName || !ownerID) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: "BAD REQUEST",
				message: `Please provide group name and owner ID`,
			});
		}

		// check if members array have duplicate, if yes clean up (remove all duplicates and return unique value)
		members = removeDup([ownerID, ...members]);

		// check if name is existing or new
		const checkUniqueName = await Group.findOne({ grpName, ownerID });

		// if EXISTING : return json with msg
		if (checkUniqueName) {
			return res.status(StatusCodes.CONFLICT).json({
				status: "CONFLICT",
				message: `Name is taken in grpid ${checkUniqueName._id}, please provide another name`,
			});
		}

		// // check if members array include owner
		// if (members.includes(ownerID)) {
		// 	return res.status(StatusCodes.CONFLICT).json({
		// 		status: "CONFLICT",
		// 		message: "You are the owner of this group!",
		// 	});
		// }

		// if NEW : create new group and update member profile of newly added groups

		const group = await Group.create({
			grpName,
			ownerID,
			imgUrl,
			members,
		});

		// updating the created group into newly created membersss profile
		// updating groups into every members profile

		if (group.members.length > 0) {
			for (const element of group.members) {
				let checkMemberGRP = await Member.findByIdAndUpdate({ _id: element });
				if (!checkMemberGRP.groups.includes(group._id)) {
					const updatedMember = await Member.findByIdAndUpdate(
						{ _id: element },
						{ $push: { groups: group._id } },
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
		const { ownerID, search, members, sort, fields } = req.query;
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
		// check if members array have duplicate, if yes clean up (remove all duplicates and return unique value)
		members = removeDup([ownerID, ...members]);
		if (group.members !== [ownerID, ...members]) {
			// updating groups into every members profile

			if (members.length > 0) {
				for (const element of members) {
					let checkMemberGRP = await Member.findByIdAndUpdate({ _id: element });
					if (!checkMemberGRP.groups.includes(group._id)) {
						const updatedMember = await Member.findByIdAndUpdate(
							{ _id: element },
							{ $push: { groups: group._id } },
							{ new: true, runValidators: true }
						);
					}
				}
			}

			let toREMOVE = lodash.difference(group.members, [ownerID, ...members]);

			if (toREMOVE.length > 0) {
				for (const element of toREMOVE) {
					const list = await Member.findOne({ _id: element });
					let newGRPList = list.groups.filter((item) => item !== id);

					await Member.findByIdAndUpdate(
						{ _id: element },
						{ groups: newGRPList },
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

		// updating member profile group array, removed the groups

		// check all contain groups member returning in array
		const members = await Member.find({
			groups: { $in: [id] },
		});

		// if array is truthy remove the id
		if (members) {
			for (let element of members) {
				let newGRPList = element.groups.filter((item) => item != id);
				await Member.findByIdAndUpdate(
					{ _id: element._id },
					{ groups: newGRPList },
					{
						new: true,
						runValidators: true,
					}
				);
			}
		}

		// find and deleting items in the groups
		const items = await Item.find({ grpID: id });
		// console.log(items);

		// if array is truthy remove the items in group
		if (items) {
			for (let element of items) {
				await Item.findByIdAndRemove({ _id: element._id });
			}
		}

		// deleting group data
		group = await Group.findByIdAndRemove({ _id: id });

		return res.status(StatusCodes.OK).json({
			status: "OK",
			message: `member profile updated, items with group deleted`,
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
