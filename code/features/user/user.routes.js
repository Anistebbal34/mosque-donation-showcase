const express = require("express");
const router = express.Router();
const {
  updateUser,
  deleteUser,
  getNonAdminUsers,
  getImamWithMosque,
} = require("./user.controller");
const verifyToken = require("../../middleware/VerfiyJwt.js");
const checkRole = require("../../middleware/checkRole.js");
const { updateUserSchema } = require("../mission/mission.validation");
const validate = require("../../middleware/validate");

router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  validate(updateUserSchema),
  updateUser
);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteUser);
router.get("/", verifyToken, checkRole(["admin"]), getNonAdminUsers);
router.get("/imam/mosque", verifyToken, checkRole(["imam"]), getImamWithMosque);

module.exports = router;
