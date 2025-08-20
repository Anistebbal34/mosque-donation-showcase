const express = require("express");
const router = express.Router();

const {
  assignMissionsToMosques,
  pickMission,
  getMissions,
  getMissionRoute,
  getCurrentMission,
  undoMission,
  checkMissionStatus,
  getAvailableMissionsForDriver,
  updateMissionStatusByDriver,
} = require("./mission.controller.js");

const verifyJWT = require("../../middleware/VerfiyJwt.js");
const checkRole = require("../../middleware/checkRole.js");

const { getMissionsSchema } = require("./mission.validation.js");
const validate = require("../../middleware/validate");

// Admin: assign missions to mosques
router.post(
  "/assign",
  verifyJWT,
  checkRole(["admin"]),
  assignMissionsToMosques
);

// Driver: pick a mission
router.post("/pick/:id", verifyJWT, checkRole(["driver"]), pickMission);

// Driver: get filtered missions
router.get(
  "/",
  verifyJWT,
  checkRole(["driver"]),
  validate(getMissionsSchema),
  getMissions
);

// Driver: get current mission
router.get("/current", verifyJWT, checkRole(["driver"]), getCurrentMission);

// Driver: undo a mission
router.post("/undo/:id", verifyJWT, checkRole(["driver"]), undoMission);

// Driver: get navigation route
router.get(
  "/route/:id/:driver_lat/:driver_lng",
  verifyJWT,
  checkRole(["driver"]),
  getMissionRoute
);

// Imam: check mission status
router.get("/status", verifyJWT, checkRole(["imam"]), checkMissionStatus);

// Driver: get available missions near location
router.get(
  "/available",
  verifyJWT,
  checkRole(["driver"]),
  getAvailableMissionsForDriver
);

// Driver: update status (e.g., delivered, completed)
router.patch(
  "/status/:missionId",
  verifyJWT,
  checkRole(["driver"]),
  updateMissionStatusByDriver
);

module.exports = router;
