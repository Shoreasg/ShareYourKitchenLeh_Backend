const getAllItems = async (req, res) => {
	res.send("get all Item");
};

const getItem = async (req, res) => {
	res.send("get Item");
};

const createItem = async (req, res) => {
	res.send("create Item");
};

const updateItem = async (req, res) => {
	res.send("update Item");
};

const deleteItem = async (req, res) => {
	res.send("delete Item");
};

module.exports = {
	getAllItems,
	getItem,
	createItem,
	updateItem,
	deleteItem,
};
