const Joi = require("joi");

// --- Create Schema ---
const mosqueCreationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "اسم المسجد مطلوب",
    "string.min": "يجب أن يكون الاسم على الأقل حرفين",
    "string.max": "لا يمكن أن يتجاوز الاسم 50 حرفًا",
  }),
  address: Joi.string().min(5).max(100).optional().messages({
    "string.min": "يجب أن يكون العنوان على الأقل 5 أحرف",
    "string.max": "لا يمكن أن يتجاوز العنوان 100 حرف",
  }),
  longitude: Joi.number().optional().messages({
    "number.base": "يجب أن يكون خط الطول رقمًا صحيحًا",
  }),
  latitude: Joi.number().optional().messages({
    "number.base": "يجب أن يكون خط العرض رقمًا صحيحًا",
  }),
  is_approved: Joi.boolean().required().messages({
    "boolean.base": "يجب أن تكون القيمة صحيحة أو خاطئة (true أو false)",
  }),
  imam_id: Joi.number().integer().allow(null),
});

// --- Update Schema ---
const mosqueUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "اسم المسجد مطلوب",
    "string.min": "يجب أن يكون الاسم على الأقل حرفين",
    "string.max": "لا يمكن أن يتجاوز الاسم 50 حرفًا",
  }),
  address: Joi.string().min(5).max(100).optional().messages({
    "string.min": "يجب أن يكون العنوان على الأقل 5 أحرف",
    "string.max": "لا يمكن أن يتجاوز العنوان 100 حرف",
  }),
  longitude: Joi.number().optional().messages({
    "number.base": "يجب أن يكون خط الطول رقمًا صحيحًا",
  }),
  latitude: Joi.number().optional().messages({
    "number.base": "يجب أن يكون خط العرض رقمًا صحيحًا",
  }),
  is_approved: Joi.boolean().required().messages({
    "boolean.base": "يجب أن تكون القيمة صحيحة أو خاطئة (true أو false)",
  }),
  imam_id: Joi.number().integer().allow(null),
});

module.exports = {
  mosqueCreationSchema,
  mosqueUpdateSchema,
};
