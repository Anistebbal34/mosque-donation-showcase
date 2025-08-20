const missionService = require("./mission.service");

const assignMissionsToMosques = async (req, res, next) => {
  try {
    const result = await missionService.assignMissions();
    res.status(result.status).json({
      success: true,
      message: result.message,
      alreadyExist: result.alreadyExist,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const pickMission = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const { userId } = req.user;
    const { driver_lat, driver_lng } = req.body;

    const result = await missionService.pickMission(
      missionId,
      userId,
      driver_lat,
      driver_lng
    );

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getMissions = async (req, res, next) => {
  try {
    const result = await missionService.getFilteredMissions(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentMission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await missionService.getCurrentMissionForDriver(userId);

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getMissionRoute = async (req, res, next) => {
  try {
    const missionId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const driver_lat = parseFloat(req.params.driver_lat);
    const driver_lng = parseFloat(req.params.driver_lng);

    const result = await missionService.getMissionRoute(
      missionId,
      userId,
      driver_lat,
      driver_lng
    );

    res.status(result.status).json({
      success: true,
      message: result.message,
      navigation: result.navigation,
    });
  } catch (err) {
    next(err);
  }
};

const undoMission = async (req, res, next) => {
  try {
    const missionId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const result = await missionService.undoMission(missionId, userId);

    res.status(result.status).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

const checkMissionStatus = async (req, res, next) => {
  try {
    const imamId = req.user.id;
    const result = await missionService.checkMissionStatus(imamId);

    res.status(result.status).json({
      success: true,
      message: result.message,
      missionId: result.missionId,
      mosque: result.mosque,
      driver: result.driver,
      collectedMoney: result.collectedMoney,
    });
  } catch (err) {
    next(err);
  }
};

const getAvailableMissionsForDriver = async (req, res, next) => {
  try {
    const { lat, lng, daysAgo = 0 } = req.query;
    const result = await missionService.getAvailableMissionsForDriver(
      lat,
      lng,
      daysAgo
    );
    res.status(result.status).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};
const updateMissionStatusByDriver = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const { status } = req.body;
    const result = await missionService.updateMissionStatusByDriver(
      missionId,
      status
    );
    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  assignMissionsToMosques,
  pickMission,
  getMissions,
  getMissionRoute,
  getCurrentMission,
  undoMission,
  checkMissionStatus,
  getAvailableMissionsForDriver,
  updateMissionStatusByDriver,
};
