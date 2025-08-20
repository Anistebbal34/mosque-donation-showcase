const { User } = require("../../sequelize/models");

// Fetch user by name and family name (to check for duplicate)
const findUserByNameAndFamily = async (name, famillyname) => {
  return await User.findOne({
    where: { name, famillyname },
    attributes: ["id", "name", "famillyname", "role", "createdAt", "password"],
  });
};

// Create a new user
const createUser = async (userData) => {
  return await User.create(userData);
};

module.exports = {
  findUserByNameAndFamily,
  createUser,
};
