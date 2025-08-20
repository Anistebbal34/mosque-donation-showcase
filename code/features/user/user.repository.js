const { User, Mosque, Coordinates } = require("../../sequelize/models");
const { Op } = require("sequelize");

async function findUserById(id) {
  return await User.findByPk(id);
}

async function findUserByNameAndFamilyExcludingId(
  name,
  famillyname,
  excludedId
) {
  return await User.findOne({
    where: {
      name,
      famillyname,
      id: { [Op.ne]: excludedId },
    },
  });
}

async function updateUserEntity(user, updateFields) {
  return await user.update(updateFields);
}
async function deleteUserById(id) {
  const user = await User.findByPk(id);
  if (!user) return null;

  await user.destroy();
  return user;
}
async function findNonAdminUsers({ currentUserId, role }) {
  const validRoles = ["driver", "imam"];

  let whereClause = {
    id: { [Op.ne]: currentUserId },
    role: { [Op.in]: validRoles },
  };

  if (role && validRoles.includes(role.toLowerCase())) {
    whereClause.role = role.toLowerCase();
  }

  return await User.findAll({
    where: whereClause,
    attributes: [
      "id",
      "name",
      "famillyname",
      "phone",
      "role",
      "plain_password",
      "car_number",
    ],
  });
}
async function findImamWithMosqueAndCoordinates(imamId) {
  return await User.findByPk(imamId, {
    attributes: ["id", "name", "famillyname", "phone", "role"],
    include: {
      model: Mosque,
      attributes: ["id", "name", "address", "distance_calculated"],
      required: false,
      include: {
        model: Coordinates,
        attributes: ["latitude", "longitude", "is_approved"],
        required: false,
      },
    },
  });
}

module.exports = {
  deleteUserById,
  findUserById,
  findUserByNameAndFamilyExcludingId,
  updateUserEntity,
  findNonAdminUsers,
  findImamWithMosqueAndCoordinates,
};
