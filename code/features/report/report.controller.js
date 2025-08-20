const {
  getCollectedMoneyForWeekService,
  generateWeeklyReportService,
  getWeeklyReportFileService,
  checkWeeklyReportExistenceService,
} = require("./report.service");

const getCollectedMoneyForWeek = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const result = await getCollectedMoneyForWeekService({ fromDate, toDate });

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const generateWeeklyReportController = async (req, res, next) => {
  try {
    const result = await generateWeeklyReportService();

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getWeeklyReportFile = async (req, res, next) => {
  try {
    const result = await getWeeklyReportFileService();

    const report = result.data;
    const safeFilename = `weekly_report_${
      report.report_period.toISOString().split("T")[0]
    }.xlsx`;

    res.setHeader("Content-Type", report.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    res.setHeader("Content-Length", report.size);

    res.status(200).send(report.content);
  } catch (error) {
    next(error);
  }
};

const checkWeeklyReportExistence = async (req, res, next) => {
  try {
    const result = await checkWeeklyReportExistenceService();

    res.status(result.status).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollectedMoneyForWeek,
  generateWeeklyReportController,
  getWeeklyReportFile,
  checkWeeklyReportExistence,
};
