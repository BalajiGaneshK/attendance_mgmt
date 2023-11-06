// routes.js

const express = require("express");
const router = express.Router();
const controller = require("./Controller");

// User routes
router.post("/register", controller.registerEmployee);
router.post("/login", controller.loginEmployee);
router.post("/logout", controller.logoutEmployee);
router.post("/applyLeave", controller.applyLeave);
router.post("/viewPendingLeaves", controller.viewLeaveRequests);
router.post("/approveLeave", controller.approveLeaveRequest);
// Define other routes for class management, student management, attendance tracking, etc.

module.exports = router;
