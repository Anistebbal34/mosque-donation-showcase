// money.repository.js
const { Mission } = require("../../sequelize/models");

// Fetch a mission by ID
const findMissionById = async (id) => {
  return await Mission.findByPk(id);
};

// Update collected money (add or modify)
const updateCollectedMoney = async (
  mission,
  amount,
  amount_arabic,
  isNew = false
) => {
  const updateData = {
    collactedmoney: amount,
    collectedmoney_arabic: amount_arabic || null,
  };

  if (isNew) {
    updateData.collected_money_added_at = new Date();
  }

  return await mission.update(updateData);
};

module.exports = {
  findMissionById,
  updateCollectedMoney,
};
