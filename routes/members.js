const express = require("express");
const router = express.Router();

const {
	getAllMembers,
	getMember,
	createMember,
	updateMember,
	deleteMember,
} = require("../controllers/memberController");

router.route("/").post(createMember).get(getAllMembers);
router.route("/:id").get(getMember).delete(deleteMember).patch(updateMember);

module.exports = router;
