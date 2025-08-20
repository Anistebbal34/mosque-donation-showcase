const {
  countMissionsToday,
  getApprovedMosquesWithCoordinates,
  createMissionForMosque,
  findMissionByIdWithMosqueAndCoordinates,
  findPendingMissionForUserToday,
  updateMissionAssignment,
  findMissionsFiltered,
  findMissionWithMosqueAndCoordinates,
  findPendingMissionByDriverToday,
  findMissionById,
  findMosqueByUserId,
  findCompletedFridayMissionForMosque,
  findUserById,
  findAvailableMissionsWithMosqueAndCoordinates,
  updateMissionStatus,
} = require("./mission.repository.js");
const { getRoute } = require("../../utils/osrmClient.js");
const {
  getStartAndEndOfDay,
  getDurationsAndDistances,
} = require("../../utils/Date.js");
const CustomError = require("../../utils/CustomError.js");

async function assignMissions() {
  const today = new Date();

  if (today.getDay() !== 5) {
    throw new CustomError(400, "لا يمكن إسناد المهام إلا أيام الجمعة");
  }

  const count = await countMissionsToday();
  if (count > 0) {
    throw new CustomError(400, "تم بالفعل إسناد المهام لهذا اليوم (الجمعة)", {
      alreadyExist: true,
    });
  }

  const mosques = await getApprovedMosquesWithCoordinates();
  if (mosques.length === 0) {
    throw new CustomError(404, "لا توجد مساجد مقبولة تحتوي على إحداثيات صحيحة");
  }

  const missions = await Promise.all(
    mosques.map((m) => createMissionForMosque(m.id))
  );

  return {
    status: 201,
    message: "تم إسناد المهام بنجاح",
    alreadyExist: false,
    data: missions.map((m) => ({
      id: m.id,
      mosque_id: m.mosque_id,
      status: m.status,
      createdAt: m.createdAt,
    })),
  };
}
async function pickMission(missionId, userId, driverLat, driverLng) {
  if (!driverLat || !driverLng) {
    throw new CustomError(
      400,
      "إحداثيات السائق مطلوبة (driver_lat, driver_lng)"
    );
  }

  const mission = await findMissionByIdWithMosqueAndCoordinates(missionId);
  if (!mission) {
    throw new CustomError(404, "لم يتم العثور على المهمة");
  }

  if (!mission.Mosque?.Coordinate) {
    throw new CustomError(400, "المسجد لا يحتوي على إحداثيات صالحة");
  }

  if (mission.status !== "AVAILABLE") {
    throw new CustomError(
      409,
      `المهمة تم حجزها مسبقًا (${mission.status.toLowerCase()})`
    );
  }

  const existing = await findPendingMissionForUserToday(userId);
  if (existing) {
    throw new CustomError(409, "لديك مهمة قيد الانتظار اليوم", {
      alreadypicked: true,
      id: mission.id,
      name: mission.Mosque.name,
      address: mission.Mosque.address,
    });
  }

  const destLat = mission.Mosque.Coordinate.latitude;
  const destLng = mission.Mosque.Coordinate.longitude;

  const route = await getRoute(driverLat, driverLng, destLat, destLng);

  await updateMissionAssignment(mission, userId);

  return {
    status: 200,
    message: "تم حجز المهمة مع تفاصيل التنقل",
    data: {
      mission_details: {
        id: mission.id,
        mosque_id: mission.mosque_id,
        name: mission.Mosque.name,
        address: mission.Mosque.address,
        status: "PENDING",
        assigned_to: userId,
      },
      navigation: {
        start_point: { lat: parseFloat(driverLat), lng: parseFloat(driverLng) },
        end_point: { lat: destLat, lng: destLng },
        route: route.geometry,
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.ceil(route.duration / 60)} minutes`,
        waypoints: route.waypoints,
      },
    },
  };
}

async function getFilteredMissions({ status, days_ago }) {
  const { start, end } = getStartAndEndOfDay(days_ago);
  const missions = await findMissionsFiltered({ status, start, end });

  return missions.map((mission) => ({
    id: mission.id,
    status: mission.status,
    created_at: mission.createdAt,
    user: mission.User
      ? {
          id: mission.User.id,
          name: mission.User.name,
          famillyname: mission.User.famillyname,
        }
      : null,
    mosque: {
      id: mission.Mosque.id,
      name: mission.Mosque.name,
    },
  }));
}

// المهمة الحالية
async function getCurrentMissionForDriver(userId) {
  const { start, end } = getStartAndEndOfDay(0);
  const mission = await findPendingMissionByDriverToday(userId, start, end);

  if (!mission) {
    throw new CustomError(404, "لا توجد مهمة حالية لهذا السائق");
  }

  return {
    status: 200,
    message: "تم استرجاع بيانات المهمة الحالية بنجاح",
    data: {
      mission_id: mission.id,
      mosque_id: mission.mosque_id,
      name: mission.Mosque.name,
      address: mission.Mosque.address,
      status: mission.status,
      assigned_to: mission.assigned_to,
    },
  };
}

// مسار المهمة
async function getMissionRoute(missionId, userId, driver_lat, driver_lng) {
  const mission = await findMissionWithMosqueAndCoordinates(missionId);

  if (
    !mission ||
    mission.assigned_to !== userId ||
    mission.status !== "PENDING"
  ) {
    throw new CustomError(404, "لم يتم العثور على مهمة صالحة لهذا السائق");
  }

  const { latitude: destination_lat, longitude: destination_lng } =
    mission.Mosque.Coordinate;

  const response = await getRoute(
    driver_lng,
    driver_lat,
    destination_lng,
    destination_lat
  );

  if (!response.routes || response.routes.length === 0) {
    throw new CustomError(400, "تعذر حساب المسار");
  }

  const route = response.routes[0];
  const routeCoordinates = route.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));

  return {
    status: 200,
    message: "تم استرجاع بيانات التنقل بنجاح",
    navigation: {
      start_point: { lat: driver_lat, lng: driver_lng },
      end_point: { lat: destination_lat, lng: destination_lng },
      route: routeCoordinates,
      distance: `${(route.distance / 1000).toFixed(1)} كم`,
      duration: `${Math.ceil(route.duration / 60)} دقيقة`,
      waypoints: response.waypoints.map((wp) => ({
        location: { lat: wp.location[1], lng: wp.location[0] },
        name: wp.name || "طريق",
      })),
    },
  };
}

async function undoMission(missionId, userId) {
  const mission = await findMissionById(missionId);

  if (!mission) {
    throw new CustomError("Mission not found", 404);
  }

  if (mission.assigned_to !== userId) {
    throw new CustomError("You are not assigned to this mission", 403);
  }

  if (mission.status !== "PENDING") {
    throw new CustomError(
      `Cannot unpick mission in status: ${mission.status}`,
      400
    );
  }

  await mission.update({
    assigned_to: null,
    status: "AVAILABLE",
  });

  return {
    status: 200,
    message: "Mission unpicked successfully",
  };
}

async function checkMissionStatus(imamId) {
  const mosque = await findMosqueByUserId(imamId);

  if (!mosque) {
    throw new CustomError("لم يتم العثور على المسجد لهذا الإمام", 404);
  }

  const today = new Date();
  const day = today.getDay();
  if (day !== 5) {
    throw new CustomError(
      "اليوم ليس الجمعة. يمكن إضافة المال فقط في يوم الجمعة.",
      400
    );
  }

  const { start, end } = getStartAndEndOfDay(0);
  const mission = await findCompletedFridayMissionForMosque(
    mosque.id,
    start,
    end
  );

  if (!mission) {
    throw new CustomError(
      "لم يتم العثور على مهمة مكتملة لهذا اليوم (الجمعة).",
      400
    );
  }

  const driver = await findUserById(mission.assigned_to);

  if (!driver) {
    throw new CustomError("لم يتم العثور على السائق المكلف.", 404);
  }

  return {
    status: 200,
    message: "المهمة مكتملة واليوم هو الجمعة. يمكنك متابعة إضافة المال المحصل.",
    missionId: mission.id,
    mosque: {
      name: mosque.name,
      address: mosque.address,
    },
    driver,
    collectedMoney: {
      amount: mission.collectedmoney ?? mission.collactedmoney,
      amount_arabic: mission.collectedmoney_arabic,
      added_at: mission.collected_money_added_at,
      alreadyAdded: mission.collected_money_added_at !== null,
    },
  };
}

async function getAvailableMissionsForDriver(lat, lng, daysAgo = 0) {
  if (!lat || !lng) {
    throw new CustomError("User latitude and longitude are required", 400);
  }

  const { start } = getStartAndEndOfDay(daysAgo);
  const missions = await findAvailableMissionsWithMosqueAndCoordinates(start);

  if (missions.length === 0) {
    return {
      status: 200,
      data: [],
    };
  }

  const userLocation = `${lng},${lat}`;
  const mosqueCoords = missions.map((m) => {
    const coords = m.Mosque.Coordinate;
    return `${coords.longitude},${coords.latitude}`;
  });
  const allCoords = [userLocation, ...mosqueCoords].join(";");

  const { durationsRaw, distancesRaw, durations, distances } =
    await getDurationsAndDistances(allCoords);

  const data = missions.map((m, i) => {
    const c = m.Mosque.Coordinate;
    return {
      id: m.id,
      created_at: m.createdAt,
      mosque: {
        id: m.Mosque.id,
        name: m.Mosque.name,
        address: m.Mosque.address,
        latitude: c.latitude,
        longitude: c.longitude,
        phone_number: m.Mosque.user?.phone || null,
        distance_meters: distancesRaw[i],
        distance_readable: distances[i],
        duration_seconds: durationsRaw[i],
        duration_readable: durations[i],
      },
    };
  });

  data.sort((a, b) => a.mosque.distance_meters - b.mosque.distance_meters);

  return {
    status: 200,
    data,
  };
}

async function updateMissionStatusByDriver(missionId, newStatus) {
  const mission = await findMissionById(missionId);

  if (!mission) {
    throw new CustomError("المهمة غير موجودة", 404);
  }

  const currentStatus = mission.status;

  const validTransitions = {
    PENDING: ["PENDING_COMPLETE"],
    PENDING_COMPLETE: ["COMPLETED", "COMPLETE"], // في حالة استخدام أحد الاسمين
  };

  const allowedNextStatuses = validTransitions[currentStatus] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new CustomError(
      `لا يمكن تغيير الحالة من ${currentStatus} إلى ${newStatus}`,
      400
    );
  }

  await updateMissionStatus(missionId, newStatus);

  return {
    status: 200,
    message: "تم تحديث حالة المهمة بنجاح",
    data: {
      id: mission.id,
      previousStatus: currentStatus,
      updatedStatus: newStatus,
    },
  };
}

module.exports = {
  assignMissions,
  pickMission,
  getFilteredMissions,

  getMissionRoute,
  getCurrentMissionForDriver,
  undoMission,
  checkMissionStatus,
  getAvailableMissionsForDriver,
  updateMissionStatusByDriver,
};
