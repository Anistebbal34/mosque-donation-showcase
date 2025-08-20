// controllers/mosque.controller.js
const mosqueService = require("./mosque.service");

const createMosque = async (req, res, next) => {
  try {
    const value = req.body;
    const result = await mosqueService.createNewMosque(value);

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const updateMosque = async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = req.body;

    const result = await mosqueService.updateExistingMosque(id, value);

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const listMosques = async (req, res, next) => {
  try {
    const result = await mosqueService.listAllMosques();

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getImamsWithoutCoordinates = async (req, res, next) => {
  try {
    const result = await mosqueService.getAllImamsWithoutCoordinates();

    res.status(result.status).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const getMosqueDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await mosqueService.getMosqueDetailsById(id);

    res.status(result.status).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const addMosqueLocation = async (req, res, next) => {
  try {
    const { raw_lat, raw_lng } = req.body;
    const user_id = req.user.id;

    if (!raw_lat || !raw_lng || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: raw_lat, raw_lng, user_id",
      });
    }

    const result = await mosqueService.addMosqueLocationFromRawCoords(
      user_id,
      raw_lat,
      raw_lng
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
  getMosqueDetails,
  createMosque,
  updateMosque,
  listMosques,
  getImamsWithoutCoordinates,
  addMosqueLocation,
};
