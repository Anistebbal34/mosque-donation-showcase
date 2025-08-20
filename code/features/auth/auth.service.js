const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");
const CustomError = require("../../utils/CustomError");

const loginUser = async ({ name, famillyname, password }) => {
  const normalizedName = name.toLowerCase();
  const normalizedFamilyName = famillyname.toLowerCase();

  const user = await authRepository.findUserByNameAndFamily(
    normalizedName,
    normalizedFamilyName
  );

  if (!user) {
    throw new CustomError(401, "المستخدم غير موجود");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomError(401, "بيانات الدخول غير صحيحة");
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      famillyname: user.famillyname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

const registerUser = async (userData) => {
  const { name, famillyname, password, role, phone, car_number } = userData;

  const normalizedName = name.toLowerCase();
  const normalizedFamilyName = famillyname.toLowerCase();

  const existingUser = await authRepository.findUserByNameAndFamily(
    normalizedName,
    normalizedFamilyName
  );

  if (existingUser) {
    throw new CustomError(409, "يوجد مستخدم بنفس الاسم واسم العائلة بالفعل");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await authRepository.createUser({
      name: normalizedName,
      famillyname: normalizedFamilyName,
      password: hashedPassword,
      plain_password: password,
      role,
      phone,
      car_number: role === "driver" ? car_number : null,
      tokens: null,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      famillyname: newUser.famillyname,
      role: newUser.role,
      car_number: newUser.car_number,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      throw new CustomError(400, "خطأ في التحقق", { validationErrors });
    }

    throw new CustomError(500, "خطأ في الخادم الداخلي");
  }
};

module.exports = {
  registerUser,
  loginUser,
};
