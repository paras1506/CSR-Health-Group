const express = require("express");
const { createRequest, getAllRequests, searchByVillage, filterByDepartment, donorInterest, updateFulfillment, verifyAppealer, getInterestedDonors } = require("../controller/solarRequestController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authenticate, authorizeRoles("Appealer"), createRequest);
router.get("/all", getAllRequests);
router.get("/search", searchByVillage);
router.get("/filter", filterByDepartment);
router.post("/donor-interest", authenticate, authorizeRoles("Donor"), donorInterest);
router.post("/update-fulfillment", authenticate, authorizeRoles("DepartmentHead"), updateFulfillment);
router.get("/donor-details", authenticate, authorizeRoles("DepartmentHead"), getInterestedDonors);
// router.post("/verify-appealer", authenticate, authorizeRoles("Verifier"), verifyAppealer);

module.exports = router;
