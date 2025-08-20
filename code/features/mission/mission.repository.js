const {
  Mission,
  Mosque,
  Coordinates,
  Sequelize,
} = require("../../sequelize/models");
const { Op } = require("sequelize");

async function countMissionsToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return await Mission.count({
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
    },
  });
}

async function getApprovedMosquesWithCoordinates() {
  return await Mosque.findAll({
    include: [
      {
        model: Coordinates,
        as: "Coordinate",
        required: true,
        where: {
          is_approved: true,
        },
      },
    ],
    attributes: ["id"],
  });
}

async function createMissionForMosque(mosqueId) {
  return await Mission.create({
    mosque_id: mosqueId,
    status: "AVAILABLE",
  });
}

async function findMissionByIdWithMosqueAndCoordinates(id) {
  return await Mission.findByPk(id, {
    include: [
      {
        model: Mosque,
        attributes: ["id", "name", "address"],
        include: [
          {
            model: Coordinates,
            attributes: ["latitude", "longitude"],
            required: true,
          },
        ],
      },
    ],
  });
}

async function findPendingMissionForUserToday(userId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return await Mission.findOne({
    where: {
      assigned_to: userId,
      status: "PENDING",
      createdAt: {
        [Op.between]: [startOfToday, endOfToday],
      },
    },
  });
}

async function updateMissionAssignment(mission, userId) {
  return await mission.update({
    assigned_to: userId,
    status: "PENDING",
    started_at: new Date(),
  });
}

async function findMissionsFiltered({ status, startDate, endDate }) {
  const where = {
    createdAt: {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    },
  };

  if (status) where.status = status;

  return await Mission.findAll({
    where,
    include: [
      {
        model: User,
        attributes: ["id", "name", "famillyname"],
        required: false,
      },
      {
        model: Mosque,
        attributes: ["id", "name"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

async function findPendingMissionByDriverToday(userId, start, end) {
  return await Mission.findOne({
    where: {
      assigned_to: userId,
      status: "PENDING",
      createdAt: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: Mosque,
        attributes: ["id", "name", "address"],
      },
    ],
  });
}

// ✅ Find a mission with mosque and coordinates, used to get navigation route
async function findMissionWithMosqueAndCoordinates(missionId) {
  return await Mission.findByPk(missionId, {
    include: [
      {
        model: Mosque,
        attributes: ["id", "name", "address"],
        include: [
          {
            model: Coordinates,
            attributes: ["latitude", "longitude"],
            required: true,
          },
        ],
      },
    ],
  });
}

// ✅ Find a mission by ID
async function findMissionById(id) {
  return await Mission.findByPk(id);
}

// ✅ Find mosque by Imam ID (user_id)
async function findMosqueByUserId(user_id) {
  return await Mosque.findOne({ where: { user_id } });
}

// ✅ Find completed mission for a mosque on Friday
async function findCompletedFridayMissionForMosque(
  mosque_id,
  dayStart,
  dayEnd
) {
  return await Mission.findOne({
    where: {
      mosque_id,
      status: "COMPLETED",
      completed_at: {
        [Op.gte]: dayStart,
        [Op.lt]: dayEnd,
      },
    },
  });
}

// ✅ Find user (driver) by ID
async function findUserById(user_id) {
  return await User.findOne({
    where: { id: user_id },
    attributes: ["name", "famillyname", "car_number", "phone"],
  });
}

async function findAvailableMissionsWithMosqueAndCoordinates(startDate) {
  return Mission.findAll({
    where: {
      status: "AVAILABLE",
      createdAt: {
        [Op.gte]: startDate,
      },
    },
    include: [
      {
        model: Mosque,
        as: "Mosque",
        attributes: ["id", "name", "address"],
        include: [
          {
            model: Coordinates,
            attributes: ["latitude", "longitude"],
            required: true,
          },
          {
            model: User,
            as: "user",
            attributes: ["phone"],
            required: false,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

async function updateMissionStatus(missionId, newStatus) {
  return Mission.update({ status: newStatus }, { where: { id: missionId } });
}
module.exports = {
  countMissionsToday,
  findPendingMissionForUserToday,
  updateMissionAssignment,
  findMissionByIdWithMosqueAndCoordinates,
  getApprovedMosquesWithCoordinates,
  createMissionForMosque,
  findMissionsFiltered,
  findMissionWithMosqueAndCoordinates,
  findPendingMissionByDriverToday,
  findMissionById,
  findMosqueByUserId,
  findCompletedFridayMissionForMosque,
  findUserById,

  findAvailableMissionsWithMosqueAndCoordinates,
  updateMissionStatus,
};
