// services/money.service.js
const {
  findMissionById,
  updateCollectedMoney,
} = require("./money.repository.js");
const CustomError = require("../../utils/CustomError.js");

const NINE_HOURS_MS = 9 * 60 * 60 * 1000;

function assertMissionFound(mission) {
  if (!mission) {
    throw new CustomError(404, "المهمة غير موجودة");
  }
}

function assertCollectedMoneyExists(mission) {
  if (!mission.collected_money_added_at) {
    throw new CustomError(400, "لم يتم بعد تسجيل المال المحصل");
  }
}

function assertWithinTimeLimit(mission) {
  const timeDiff = new Date() - new Date(mission.collected_money_added_at);
  if (timeDiff > NINE_HOURS_MS) {
    throw new CustomError(400, "انتهت مهلة التعديل على المال المحصل (9 ساعات)");
  }
}

async function addCollectedMoneyService({ missionId, amount, amount_arabic }) {
  const mission = await findMissionById(missionId);
  assertMissionFound(mission);

  await updateCollectedMoney(mission, amount, amount_arabic, true);

  const updatedMission = await findMissionById(missionId);

  return {
    status: 200,
    message: "تمت إضافة المال المحصل بنجاح",
    data: updatedMission,
  };
}

async function modifyCollectedMoneyService({
  missionId,
  amount,
  amount_arabic,
}) {
  const mission = await findMissionById(missionId);
  assertMissionFound(mission);
  assertCollectedMoneyExists(mission);
  assertWithinTimeLimit(mission);

  await updateCollectedMoney(mission, amount, amount_arabic, false);

  const updatedMission = await findMissionById(missionId);

  return {
    status: 200,
    message: "تم تعديل المال المحصل بنجاح",
    data: updatedMission,
  };
}

module.exports = {
  addCollectedMoneyService,
  modifyCollectedMoneyService,
};
