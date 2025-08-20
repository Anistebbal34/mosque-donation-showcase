// controllers/money.controller.js
const {
  addCollectedMoneyService,
  modifyCollectedMoneyService,
} = require("./money.service");

const addCollectedMoney = async (req, res, next) => {
  try {
    const { missionId, amount, amount_arabic } = req.body;

    const result = await addCollectedMoneyService({
      missionId,
      amount,
      amount_arabic,
    });

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

const modifyCollectedMoney = async (req, res, next) => {
  try {
    const { missionId, amount, amount_arabic } = req.body;

    const result = await modifyCollectedMoneyService({
      missionId,
      amount,
      amount_arabic,
    });

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
  addCollectedMoney,
  modifyCollectedMoney,
};
