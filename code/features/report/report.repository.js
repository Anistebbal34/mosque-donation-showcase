// repositories/report.repository.js
const { FileReport, Mission, User, Mosque } = require("../../sequelize/models");
const { Op } = require("sequelize");

async function findCompletedMissionsBetweenDates(startDate, endDate) {
  return await Mission.findAll({
    where: {
      completed_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      status: "COMPLETED",
    },
    include: [
      {
        model: Mosque,
        attributes: ["name"],
      },
      {
        model: User,
        attributes: ["name", "famillyname", "phone", "car_number"],
      },
    ],
  });
}

async function findReportByPeriod(startDate) {
  return await FileReport.findOne({
    where: { report_period: startDate },
    order: [["createdAt", "DESC"]], // Just in case multiple exist
  });
}

async function deletePreviousReport(previousFriday) {
  return await FileReport.destroy({
    where: {
      report_period: previousFriday,
      report_type: "تقرير المهام الأسبوعي",
    },
  });
}

async function createReportEntry({
  filename,
  mimetype,
  size,
  content,
  report_period,
}) {
  return await FileReport.create({
    filename,
    mimetype,
    size,
    content,
    report_period,
    report_type: "تقرير المهام الأسبوعي",
  });
}

async function getWeeklyMissions(startDate, endDate) {
  return await Mission.findAll({
    where: {
      completed_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      status: "COMPLETED",
    },
    include: [
      {
        model: Mosque,
        attributes: ["name"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "famillyname", "phone"],
          },
        ],
      },
      {
        model: User,
        as: "User",
        attributes: ["name", "famillyname", "phone", "car_number"],
      },
    ],
    order: [["completed_at", "ASC"]],
  });
}

async function doesWeeklyReportExist(startDate) {
  const result = await FileReport.findOne({
    where: { report_period: startDate },
    attributes: ["id"], // Efficient lookup
  });

  return Boolean(result);
}
module.exports = {
  findCompletedMissionsBetweenDates,
  findReportByPeriod,
  deletePreviousReport,
  createReportEntry,
  getWeeklyMissions,
  doesWeeklyReportExist,
};
