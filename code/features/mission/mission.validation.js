const Joi = require("joi");

const getMissionsSchema = Joi.object({
  status: Joi.string().valid(
    "AVAILABLE",
    "PENDING",
    "PENDING_COMPLETION",
    "COMPLETED",
    "CANCELED"
  ),
  days_ago: Joi.number().integer().min(0).max(365).default(0),
});

module.exports = {
  getMissionsSchema,
};
