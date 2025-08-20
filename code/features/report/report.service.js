const {
  findCompletedMissionsBetweenDates,
  findReportByPeriod,
  deletePreviousReport,
  createReportEntry,
  getWeeklyMissions,
  doesWeeklyReportExist,
} = require("./report.repository.js");
const { getFridayToThursdayWeekInterval } = require("../../utils/Date.js");
const {
  buildWeeklyMissionExcelReport,
} = require("../../utils/excelReportbuilder.js");
const CustomError = require("../../utils/CustomError.js");

async function getCollectedMoneyForWeekService({ fromDate, toDate }) {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  endDate.setHours(23, 59, 59, 999);

  const missions = await findCompletedMissionsBetweenDates(startDate, endDate);

  if (!missions.length) {
    throw new CustomError(
      404,
      "لم يتم العثور على مهام مكتملة خلال الفترة المحددة."
    );
  }

  let totalCollectedMoney = 0;
  const missionDetails = missions.map((mission) => {
    totalCollectedMoney += parseFloat(mission.collactedmoney || 0);
    return {
      mosqueName: mission.Mosque.name,
      driver: {
        name: mission.User.name,
        famillyname: mission.User.famillyname,
        phone: mission.User.phone,
        car_number: mission.User.car_number,
      },
      collectedMoney: mission.collactedmoney,
      completed_at: mission.completed_at,
    };
  });

  return {
    status: 200,
    message: "تم استرجاع المال المحصل بنجاح.",
    data: { totalCollectedMoney, missionDetails },
  };
}

async function generateWeeklyReportService() {
  const { startDate, endDate } = getFridayToThursdayWeekInterval();
  const previousWeekStart = new Date(startDate);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);

  const existingReport = await findReportByPeriod(startDate);
  if (existingReport) {
    return {
      status: 409,
      message: "تم إنشاء التقرير لهذا الأسبوع بالفعل.",
      data: {
        reportAlreadyGenerated: true,
        reportId: existingReport.id,
        downloadUrl: `/api/reports/${existingReport.id}`,
      },
    };
  }

  await deletePreviousReport(previousWeekStart);

  const missions = await getWeeklyMissions(startDate, endDate);
  if (!missions.length) {
    throw new CustomError(404, "لم يتم العثور على مهام مكتملة لهذا الأسبوع.");
  }

  const workbook = buildWeeklyMissionExcelReport(
    missions,
    startDate.toISOString().split("T")[0]
  );
  const buffer = await workbook.xlsx.writeBuffer();

  const report = await createReportEntry({
    filename: `تقرير_المهام_الأسبوعي_${
      startDate.toISOString().split("T")[0]
    }.xlsx`,
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: buffer.length,
    content: buffer,
    report_period: startDate,
  });

  return {
    status: 201,
    message: "تم إنشاء التقرير الأسبوعي وتخزينه بنجاح.",
    data: {
      reportId: report.id,
      filename: report.filename,
      downloadUrl: `/api/reports/${report.id}`,
    },
  };
}

async function getWeeklyReportFileService() {
  const { startDate } = getFridayToThursdayWeekInterval();

  const report = await findReportByPeriod(startDate);
  if (!report) {
    throw new CustomError(
      404,
      `لم يتم العثور على تقرير المهام الأسبوعي للأسبوع الذي يبدأ في ${
        startDate.toISOString().split("T")[0]
      }. يرجى محاولة إنشائه أولاً.`
    );
  }

  return {
    status: 200,
    message: "تم استرجاع ملف التقرير الأسبوعي.",
    data: report,
  };
}

async function checkWeeklyReportExistenceService() {
  const { startDate } = getFridayToThursdayWeekInterval();
  const exists = await doesWeeklyReportExist(startDate);

  return {
    status: 200,
    message: exists
      ? "تم العثور على تقرير المهام الأسبوعي لهذا الأسبوع."
      : "لم يتم العثور على تقرير المهام الأسبوعي لهذا الأسبوع.",
    data: {
      exists,
      periodStart: startDate.toISOString().split("T")[0],
    },
  };
}

module.exports = {
  getCollectedMoneyForWeekService,
  generateWeeklyReportService,
  getWeeklyReportFileService,
  checkWeeklyReportExistenceService,
};
