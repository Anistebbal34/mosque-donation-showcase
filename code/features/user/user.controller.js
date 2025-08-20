const {
  updateUserService,
  getNonAdminUsersService,
  deleteUserService,
  getImamWithMosqueService,
} = require("./user.service.js");

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { status, success, message, data } = await updateUserService(
      id,
      updates
    );

    res.status(status).json({ success, message, data });
  } catch (error) {
    console.error("Update error:", error);

    next(error); // Let centralized error middleware handle it
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { status, success, message } = await deleteUserService(id);

    res.status(status).json({ success, message });
  } catch (error) {
    console.error("Delete error:", error);
    next(error);
  }
};

const getNonAdminUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const currentUserId = req.user.id;

    const { status, success, message, data } = await getNonAdminUsersService(
      currentUserId,
      role
    );

    res.status(status).json({ success, message, data });
  } catch (error) {
    console.error("Fetch error:", error);
    next(error);
  }
};

const getImamWithMosque = async (req, res, next) => {
  try {
    const imamId = req.user.id;

    const { status, success, message, data } = await getImamWithMosqueService(
      imamId
    );

    res.status(status).json({ success, message, data });
  } catch (error) {
    console.error("Error fetching imam with mosque:", error);
    next(error);
  }
};

module.exports = {
  updateUser,
  deleteUser,
  getNonAdminUsers,
  getImamWithMosque,
};
