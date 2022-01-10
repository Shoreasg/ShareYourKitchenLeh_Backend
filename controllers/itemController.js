const Member = require("../models/user");
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
	try {
		// for query path is ?key=value
		// eg http://localhost:5000/api/v1/items?fav=false&valueFilter=qty>=4
		// req.query return object so can directly pass in .find(obj)

		const { fav, name, brand, createdby, sort, fields, valueFilter, grpID, expiryDate} =
			req.query;

		const queryObj = {};

		if (fav) {
			queryObj.fav = fav === "true" ? true : false;
		}

		if (brand) {
			queryObj.brand = brand;
		}

		if (name) {
			queryObj.name = { $regex: name, $options: "i" };
		}

		if (createdby) {
			queryObj.createdBy = createdby;
		}

		if (grpID) {
			queryObj.grpID = grpID;
		}

		
		if (expiryDate) {
			queryObj.expiryDate = expiryDate;
		}

		//______ valueFilter ______//
		// items?valueFilter=qty>=4
		// return greater/equal 4 qty: rating>=4
		// valueFilter: 'qty>=1'
		if (valueFilter) {
			//converting the query to mongoose readable operator
			const operatorMap = {
				">": "$gt",
				">=": "$gte",
				"=": "$eq",
				"<": "$lt",
				"<=": "$lte",
			};
			// converting the query to match with moogoose operator (if match: swap the value)
			// db.inventory.find( { qty: { $gte: 20 } } )
			const regEx = /\b(<|>|>=|=|<|<=)\b/g;
			let filters = valueFilter.replace(
				regEx,
				(match) => `-${operatorMap[match]}-`
			);
			// eg: filters: qty-$gte-4

			// only allowing filters of Number value
			const [field, operator, value] = filters.split("-");
			if (field === "qty") {
				// eg: queryObj : { qty: { '$gte': 4 } }
				queryObj[field] = { [operator]: Number(value) };
			}
		}

		// results of the customised query
		// eg http://localhost:5000/api/v1/items?fav=false&valueFilter=qty>=4&brand=meiji&name=sauces

		let result = Item.find(queryObj).populate('grpID');

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

// ============================>> GET SINGLE Item detail

const getItem = async (req, res) => {
	try {
		const id = req.params.id;
		const item = await Item.findOne({ _id: id }).populate('grpID');

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
