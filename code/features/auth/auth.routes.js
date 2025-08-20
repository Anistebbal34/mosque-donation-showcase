const express = require("express");
const router = express.Router();

const { login, register, logoutUser } = require("./auth.controller.js");
const { loginSchema, userRegistrationSchema } = require("./auth.validation.js");
const loginRateLimiter = require("../../middleware//rateLimterLogin.js");

const validate = require("../../middleware/validate.js");

router.post("/register", validate(userRegistrationSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);
router.post("/logout", logoutUser);

module.exports = router;
