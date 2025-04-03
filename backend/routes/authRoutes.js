const express = require("express");
const { signup, login, verifyUser, getProfile } = require("../controller/authController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.post("/verify", authenticate, authorizeRoles("Verifier"), verifyUser);

module.exports = router;
