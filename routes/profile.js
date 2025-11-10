const express = require("express");
const router = express.Router();
const { editProfile } = require("../controllers/profileController");
const auth = require("../middleware/auth");

router.put("/edit", auth, editProfile);

module.exports = router;
