const bcrypt = require("bcrypt");
const CustomError = require("../../utils/CustomError.js");

const {
  findUserById,
  findUserByNameAndFamilyExcludingId,
  updateUserEntity,
  deleteUserById,
  findNonAdminUsers,
  findImamWithMosqueAndCoordinates,
} = require("./user.repository.js");

async function updateUserService(id, updates) {
  const user = await findUserById(id);
  if (!user) {
    throw new CustomError(404, "المستخدم غير موجود");
  }

  const existingUser = await findUserByNameAndFamilyExcludingId(
    updates.name,
    updates.famillyname,
    id
  );
  if (existingUser) {
    throw new CustomError(409, "يوجد مستخدم بنفس الاسم واللقب");
  }

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const updatedUser = await updateUserEntity(user, updates);

  return {
    status: 200,
    message: "تم تحديث المستخدم بنجاح",
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      famillyname: updatedUser.famillyname,
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
  };
}

async function deleteUserService(id) {
  const user = await deleteUserById(id);

  if (!user) {
    throw new CustomError(404, "المستخدم غير موجود");
  }

  return {
    status: 200,
    message: "تم حذف المستخدم بنجاح",
    data: null,
  };
}

async function getNonAdminUsersService(currentUserId, role) {
  const users = await findNonAdminUsers({ currentUserId, role });

  return {
    status: 200,
    message: users.length
      ? "تم جلب المستخدمين بنجاح"
      : "لا يوجد مستخدمين حاليًا",
    data: users,
  };
}

async function getImamWithMosqueService(imamId) {
  const imam = await findImamWithMosqueAndCoordinates(imamId);

  if (!imam || imam.role !== "imam") {
    throw new CustomError(404, "الإمام غير موجود أو ليس لديه مسجد");
  }

  const mosque = imam.Mosque;
  const coord = mosque?.Coordinate;

  const data = {
    id: imam.id,
    name: imam.name,
    famillyname: imam.famillyname,
    phone: imam.phone,
    role: imam.role,
    mosque_id: mosque?.id ?? null,
    mosque_name: mosque?.name ?? null,
    mosque_address: mosque?.address ?? null,
    distance_calculated: mosque?.distance_calculated ?? null,
    latitude:
      coord?.latitude !== "0.000000000000000"
        ? parseFloat(coord?.latitude)
        : null,
    longitude:
      coord?.longitude !== "0.000000000000000"
        ? parseFloat(coord?.longitude)
        : null,
    is_approved: coord?.is_approved ?? null,
  };

  return {
    status: 200,
    message: "تم جلب بيانات الإمام بنجاح",
    data,
  };
}

module.exports = {
  updateUserService,
  deleteUserService,
  getNonAdminUsersService,
  getImamWithMosqueService,
};
