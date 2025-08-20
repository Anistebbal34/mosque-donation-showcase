const express = require("express");
const router = express.Router();

const {
  getCollectedMoneyForWeek,
  generateWeeklyReportController,
  getWeeklyReportFile,
  checkWeeklyReportExistence,
} = require("./report.controller");

const verifyJwt = require("../../middleware/VerfiyJwt.js");
const checkRole = require("../../middleware/checkRole.js");

// ✅ Get collected money between two dates (query params: ?fromDate=&toDate=)
router.get(
  "/money-for-week",
  verifyJwt,
  checkRole(["admin"]),
  getCollectedMoneyForWeek
);

// ✅ Generate weekly report
router.post(
  "/generate-weekly",
  verifyJwt,
  checkRole(["admin"]),
  generateWeeklyReportController
);

// ✅ Download weekly report file (usually Excel)
router.get("/:reportId", verifyJwt, checkRole(["admin"]), getWeeklyReportFile);

// ✅ Check if weekly report exists for this week
router.get(
  "/check-existence",
  verifyJwt,
  checkRole(["admin"]),
  checkWeeklyReportExistence
);

module.exports = router;
