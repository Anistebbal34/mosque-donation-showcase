// services/mosque.service.js
const {
  findMosqueByName,
  createMosque,
  createCoordinates,
  getMosqueWithCoordinatesById,
  getMosqueWithCoordinateRaw,
  updateMosque,
  updateCoordinates,
  findImamsWithoutCoordinates,
  getAllMosquesWithCoordinatesAndUser,
  getMosqueDetailsRaw,
  findMosqueByUserId,
  findOrCreateCoordinates,
  sequelize,
} = require("./mosque.repository");
const { snapToRoad } = require("../../utils/osrmClient");
const CustomError = require("../../utils/CustomError");

async function createNewMosque(payload) {
  const existing = await findMosqueByName(payload.name);
  if (existing) {
    throw new CustomError(409, "اسم المسجد موجود مسبقًا");
  }

  const result = await sequelize.transaction(async (t) => {
    const newMosque = await createMosque(payload, t);
    await createCoordinates(
      {
        mosque_id: newMosque.id,
        imam_id: payload.imam_id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        is_approved: payload.is_approved,
      },
      t
    );
    return newMosque;
  });

  const mosqueWithCoordinates = await getMosqueWithCoordinatesById(result.id);

  return {
    status: 201,
    message: "تم إنشاء المسجد بنجاح",
    data: mosqueWithCoordinates,
  };
}

async function updateExistingMosque(id, payload) {
  const mosque = await getMosqueWithCoordinateRaw(id);
  if (!mosque) {
    throw new CustomError(404, "المسجد غير موجود");
  }

  if (payload.name && payload.name.trim() !== mosque.name) {
    const duplicate = await findMosqueByName(payload.name.trim());
    if (duplicate) {
      throw new CustomError(409, "اسم المسجد موجود مسبقًا");
    }
  }

  await sequelize.transaction(async (t) => {
    await updateMosque(
      id,
      {
        name: payload.name.trim(),
        address: payload.address ?? mosque.address,
        user_id: payload.imam_id ?? mosque.user_id,
      },
      t
    );

    const coordsPayload = {
      latitude: payload.latitude ?? 0.0,
      longitude: payload.longitude ?? 0.0,
      is_approved: payload.is_approved,
      user_id: payload.imam_id ?? mosque.Coordinate?.user_id ?? null,
    };

    if (mosque.Coordinate) {
      await updateCoordinates(mosque.Coordinate.id, coordsPayload, t);
    } else {
      await createCoordinates(
        {
          mosque_id: mosque.id,
          ...coordsPayload,
        },
        t
      );
    }
  });

  const updated = await getMosqueWithCoordinatesById(id);

  return {
    status: 200,
    message: "تم تحديث المسجد بنجاح",
    data: updated,
  };
}

async function listAllMosques() {
  const mosques = await getAllMosquesWithCoordinatesAndUser();

  const formatted = mosques.map((mosque) => ({
    id: mosque.id,
    name: mosque.name,
    address: mosque.address,
    user_id: mosque.user_id,
    latitude: mosque.Coordinate?.latitude || null,
    longitude: mosque.Coordinate?.longitude || null,
    is_approved: mosque.Coordinate?.is_approved || false,
    user_name: mosque.user?.name || null,
    user_famillyname: mosque.user?.famillyname || null,
  }));

  return {
    status: 200,
    message: "تم استرجاع المساجد بنجاح",
    data: formatted,
  };
}

async function getAllImamsWithoutCoordinates() {
  const imams = await findImamsWithoutCoordinates();

  const formatted = imams.map((imam) => ({
    id: imam.id,
    name: imam.name,
    famillyname: imam.famillyname,
    hasCoordinates: false,
  }));

  return {
    status: 200,
    message: "تم استرجاع الأئمة بنجاح",
    data: formatted,
  };
}

async function getMosqueDetailsById(id) {
  const mosque = await getMosqueDetailsRaw(id);

  if (!mosque) {
    throw new CustomError(404, "المسجد غير موجود");
  }

  const response = {
    id: mosque.id,
    name: mosque.name,
    address: mosque.address,
    imam: mosque.user
      ? {
          id: mosque.user.id,
          name: mosque.user.name,
          famillyname: mosque.user.famillyname,
          phone: mosque.user.phone,
        }
      : null,
    coordinates: mosque.Coordinate
      ? {
          latitude: mosque.Coordinate.latitude,
          longitude: mosque.Coordinate.longitude,
          is_approved: mosque.Coordinate.is_approved,
        }
      : {
          exists: false,
          message: "لا توجد إحداثيات",
        },
  };

  return {
    status: 200,
    message: "تم استرجاع بيانات المسجد",
    data: response,
  };
}

async function addMosqueLocationFromRawCoords(user_id, raw_lat, raw_lng) {
  const mosque = await findMosqueByUserId(user_id);
  if (!mosque) {
    throw new CustomError(404, "لم يتم العثور على مسجد لهذا المستخدم");
  }

  const snapped = await snapToRoad(raw_lat, raw_lng);

  const { coordinates, created } = await findOrCreateCoordinates({
    mosque_id: mosque.id,
    user_id,
    latitude: snapped.latitude,
    longitude: snapped.longitude,
  });

  return {
    status: 200,
    message: "تم حفظ موقع المسجد بنجاح",
    data: {
      mosque_id: mosque.id,
      user_id: coordinates.user_id,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      is_approved: coordinates.is_approved,
      action: created ? "created" : "updated",
    },
  };
}

module.exports = {
  createNewMosque,
  updateExistingMosque,
  listAllMosques,
  getAllImamsWithoutCoordinates,
  getMosqueDetailsById,
  addMosqueLocationFromRawCoords,
};
