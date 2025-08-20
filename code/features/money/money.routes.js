const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {
  addCollectedMoney,
  modifyCollectedMoney,
} = require("./money.controller");

const verifyJWT = require("../../middleware/VerfiyJwt.js");
const checkRole = require("../../middleware/checkRole.js");
const validate = require("../../middleware/validate");

const collectedMoneySchema = Joi.object({
  missionId: Joi.string().required().messages({
    "string.base": "missionId must be a string",
    "any.required": "missionId is required",
  }),
  amount: Joi.number().required().messages({
    "number.base": "amount must be a number",
    "any.required": "amount is required",
  }),
  amount_arabic: Joi.string().optional().messages({
    "string.base": "amount_arabic must be a string",
  }),
});

router.post(
  "/add",
  verifyJWT,
  checkRole(["driver"]),
  validate(collectedMoneySchema),
  addCollectedMoney
);

router.put(
  "/modify",
  verifyJWT,
  checkRole(["driver"]),
  validate(collectedMoneySchema),
  modifyCollectedMoney
);

module.exports = router;
