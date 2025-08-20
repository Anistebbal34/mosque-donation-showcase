const express = require("express");
const router = express.Router();

const {
  createMosque,
  updateMosque,
  listMosques,
  getMosqueDetails,
  getImamsWithoutCoordinates,
  addMosqueLocation,
} = require("./mosque.controller");

const verifyJWT = require("../../middleware/VerfiyJwt");
const checkRole = require("../../middleware/checkRole");
const {
  mosqueCreationSchema,
  mosqueUpdateSchema,
} = require("./mosque.validation.js");

const validate = require("../../middleware/validate.js");
// ------------------- Routes ------------------- //

// Create mosque - only admin
router.post(
  "/",
  verifyJWT,
  checkRole(["admin"]),
  validate(mosqueCreationSchema),
  createMosque
);

// Update mosque by ID - only admin
router.put(
  "/:id",
  verifyJWT,
  checkRole(["admin"]),
  validate(mosqueUpdateSchema),
  updateMosque
);

// List all mosques - admin & driver can see
router.get("/", verifyJWT, checkRole(["admin", "driver"]), listMosques);

// Get single mosque by ID - admin & driver
router.get("/:id", verifyJWT, checkRole(["admin", "driver"]), getMosqueDetails);

// Get imams who don't have coordinates yet - only admin
router.get(
  "/unlocated/imams",
  verifyJWT,
  checkRole(["admin"]),
  getImamsWithoutCoordinates
);

// Add location to mosque by logged-in imam - only imam
router.post("/location", verifyJWT, checkRole(["imam"]), addMosqueLocation);

module.exports = router;
