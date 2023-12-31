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
router.post("/teamLeaveBalance", controller.viewTeamLeaveBalances);
router.post("/employeeLeaveBalance", controller.viewEmployeeLeaveBalances);
router.post("/teamWeeklyRoster", controller.viewWeeklyLoggedHours);
router.post("/dailyLeaveTracker", controller.viewEmployeesOnLeave);
// Define other routes for class management, student management, attendance tracking, etc.

module.exports = router;
