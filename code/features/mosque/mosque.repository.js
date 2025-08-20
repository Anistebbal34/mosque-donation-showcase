const {
  Mosque,
  Coordinates,
  User,
    sequelize,
  
} = require("../../sequelize/models");


// ✅ Find a mosque by its name (used to check duplicates)
async function findMosqueByName(name) {
  return await Mosque.findOne({
    where: { name: name.trim() },
  });
}

// ✅ Create a new mosque within a transaction
async function createMosque(data, transaction) {
  return await Mosque.create(
    {
      name: data.name.trim(),
      address: data.address || null,
      user_id: data.imam_id ?? null,
    },
    { transaction }
  );
}

// ✅ Create coordinates for a mosque within a transaction
async function createCoordinates(data, transaction) {
  return await Coordinates.create(
    {
      user_id: data.imam_id ?? null,
      mosque_id: data.mosque_id,
      latitude: data.latitude ?? 0.0,
      longitude: data.longitude ?? 0.0,
      is_approved: data.is_approved,
    },
    { transaction }
  );
}

// ✅ Get mosque with coordinates (after creation or update)
async function getMosqueWithCoordinatesById(mosqueId) {
  return await Mosque.findByPk(mosqueId, {
    include: [
      {
        model: Coordinates,
        as: "Coordinate", // consistent alias
        attributes: ["latitude", "longitude", "is_approved"],
      },
    ],
  });
}

// ✅ Get mosque with coordinates (raw object including Coordinate.id)
async function getMosqueWithCoordinateRaw(mosqueId) {
  return await Mosque.findByPk(mosqueId, {
    include: [
      {
        model: Coordinates,
        as: "Coordinate",
        attributes: ["id", "latitude", "longitude", "is_approved", "user_id"],
      },
    ],
  });
}

// ✅ Update mosque fields
async function updateMosque(id, data, transaction = null) {
  const mosque = await Mosque.findByPk(id);
  if (!mosque) return null;
  return await mosque.update(data, { transaction });
}

// ✅ Update coordinates fields
async function updateCoordinates(id, data, transaction = null) {
  const coord = await Coordinates.findByPk(id);
  if (!coord) return null;
  return await coord.update(data, { transaction });
}
async function getAllMosquesWithCoordinatesAndUser() {
  return await Mosque.findAll({
    attributes: ["id", "name", "address", "user_id"],
    include: [
      {
        model: Coordinates,
        attributes: ["latitude", "longitude", "is_approved"],
        required: false,
      },
      {
        model: User,
        as: "user",
        attributes: ["name", "famillyname"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

async function findImamsWithoutCoordinates() {
  return await User.findAll({
    where: {
      role: "imam",
      "$Coordinate.id$": null,
    },
    include: [
      {
        model: Coordinates,
        attributes: [],
        required: false,
      },
    ],
    attributes: ["id", "name", "famillyname"],
  });
}

async function getMosqueDetailsRaw(id) {
  return await Mosque.findByPk(id, {
    attributes: ["id", "name", "address"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "famillyname", "phone"],
        required: false,
      },
      {
        model: Coordinates,
        attributes: ["latitude", "longitude", "is_approved"],
        required: false,
      },
    ],
  });
}
async function findMosqueByUserId(user_id) {
  return await Mosque.findOne({
    where: { user_id },
    attributes: ["id"], // Only ID is needed in most cases (can be expanded later)
  });
}
async function findOrCreateCoordinates({
  mosque_id,
  user_id,
  latitude,
  longitude,
}) {
  const [coordinates, created] = await Coordinates.findOrCreate({
    where: { mosque_id },
    defaults: {
      user_id,
      latitude,
      longitude,
      is_approved: false, // Newly added or updated → needs re-approval
    },
  });

  if (!created) {
    await coordinates.update({
      user_id,
      latitude,
      longitude,
      is_approved: false, // Reset approval on update
    });
  }

  return { coordinates, created };
}

module.exports = {
  findMosqueByUserId,
  updateCoordinates,
  findOrCreateCoordinates,
  findImamsWithoutCoordinates,
  findMosqueByName,
  createMosque,
  createCoordinates,
  getMosqueWithCoordinatesById,
  getMosqueWithCoordinateRaw,
  updateMosque,
  updateCoordinates,
  getAllMosquesWithCoordinatesAndUser,
    getMosqueDetailsRaw,
  
  sequelize, // export for service layer transactions
};
