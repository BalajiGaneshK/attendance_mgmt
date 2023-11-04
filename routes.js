// routes.js

const express = require("express");
const router = express.Router();
const controller = require("./Controller");

// User routes
router.post("/register", controller.registerEmployee);

// Define other routes for class management, student management, attendance tracking, etc.

module.exports = router;
