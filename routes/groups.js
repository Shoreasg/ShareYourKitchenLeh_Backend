const express = require("express");
const router = express.Router();

const {
	getAllGroups,
	getGroup,
	createGroup,
	updateGroup,
	deleteGroup,
} = require("../controllers/groupController");

router.route("/").post(createGroup).get(getAllGroups);
router.route("/:id").get(getGroup).delete(deleteGroup).patch(updateGroup);

module.exports = router;
