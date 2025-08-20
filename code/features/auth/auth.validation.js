// src/features/auth/auth.validation.js

const Joi = require("joi");

const loginSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "الاسم مطلوب",
  }),
  famillyname: Joi.string().required().messages({
    "string.empty": "اسم العائلة مطلوب",
  }),
  password: Joi.string().required().messages({
    "string.empty": "كلمة المرور مطلوبة",
  }),
});

const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(30).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "يجب أن يكون الاسم على الأقل حرفين",
    "string.max": "لا يمكن أن يتجاوز الاسم 30 حرفًا",
  }),
  famillyname: Joi.string().min(2).max(30).required().messages({
    "string.empty": "اسم العائلة مطلوب",
    "string.min": "يجب أن يكون اسم العائلة على الأقل حرفين",
    "string.max": "لا يمكن أن يتجاوز اسم العائلة 30 حرفًا",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "كلمة المرور مطلوبة",
    "string.min": "يجب أن تكون كلمة المرور على الأقل 6 أحرف",
  }),
  role: Joi.string().valid("admin", "driver", "imam").required().messages({
    "any.required": "الدور مطلوب",
    "any.only": "يجب أن يكون الدور 'admin' أو 'driver' أو 'imam'",
  }),
  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "يجب أن يتكون رقم الهاتف من 10 أرقام",
      "string.pattern.base": "يجب أن يحتوي رقم الهاتف على أرقام فقط",
    }),
  car_number: Joi.when("role", {
    is: "driver",
    then: Joi.string().required().messages({
      "any.required": "رقم السيارة مطلوب للسائق",
    }),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = {
  loginSchema,
  userRegistrationSchema,
};
