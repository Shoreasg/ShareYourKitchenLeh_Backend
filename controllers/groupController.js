const getAllGroups = async (req, res) => {
	res.send("get all group");
};

const getGroup = async (req, res) => {
	res.send("get group");
};

const createGroup = async (req, res) => {
	res.send("create group");
};

const updateGroup = async (req, res) => {
	res.send("update group");
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
