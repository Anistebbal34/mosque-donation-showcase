const { loginSchema, userRegistrationSchema } = require("./auth.validation.js");
const authService = require("./auth.service.js");

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token: result.token,
      data: result.user,
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "تم تسجيل المستخدم بنجاح",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح (احذف التوكن من جهة العميل).",
  });
};

module.exports = {
  login,
  register,
  logoutUser,
};
