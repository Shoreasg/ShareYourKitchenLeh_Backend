const Member = require("../models/Member");
const Group = require("../models/Group");
const Item = require("../models/Item");
const { StatusCodes } = require("http-status-codes");

// ============================>> CREATE NEW Item

const createItem = async (req, res) => {
	try {
		const { name, expiryDate, qty, grpID } = req.body;

		if (!name || !expiryDate || !qty) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: "BAD REQUEST",
				message: `Mandatory fields: item name, expiry date and qty`,
			});
		}

		// check if item with same expirydate is existing or new
		const checkUniqueName = await Item.exists({ name, expiryDate, grpID });

		// if EXISTING : return json with msg
		if (checkUniqueName) {
			return res.status(StatusCodes.CONFLICT).json({
				status: "CONFLICT",
				message: "Same item already exist in group.",
			});
		}

		// if NEW : create new item
		const item = await Item.create({ ...req.body });
		return res.status(StatusCodes.OK).json({ status: "OK", data: item });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> Get ALL Items

const getAllItems = async (req, res) => {
	res.send("get all Item");
};

// ============================>> GET SINGLE Item detail

const getItem = async (req, res) => {
	try {
		const id = req.params.id;
		const item = await Item.findOne({ _id: id });

		if (!item) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		return res.status(StatusCodes.OK).json({ status: "OK", data: item });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> UPDATE Item

const updateItem = async (req, res) => {
	try {
		const id = req.params.id;

		const item = await Item.findByIdAndUpdate({ _id: id }, req.body, {
			new: true,
			runValidators: true,
		});

		if (!item) {
			return res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		return res.status(StatusCodes.OK).json({ status: "OK", data: item });
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};

// ============================>> DELETE Item

const deleteItem = async (req, res) => {
	try {
		const id = req.params.id;

		const item = await Item.findByIdAndRemove({ _id: id });
		if (!item) {
			res.status(StatusCodes.NOT_FOUND).json({
				status: "NOT FOUND",
				message: `No data record with id ${id}`,
			});
		}

		return res.status(StatusCodes.OK).json({
			status: "OK",
			message: `item deleted`,
		});
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			status: "BAD REQUEST",
			message: `Error ${error}`,
		});
	}
};
module.exports = {
	getAllItems,
	getItem,
	createItem,
	updateItem,
	deleteItem,
};
