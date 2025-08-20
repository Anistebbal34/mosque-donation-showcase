const {
  findImageByDateRange,
  deleteImagesByDateRange,
  createImageEntry,
  findAllImagesByDateRange,
} = require("./image.repository.js");

// const { getFridayToThursdayWeekInterval } = require("../../utils/Date.js");

const { getFridayToThursdayWeekInterval } = require("../../utils/Date.js");
const CustomError = require("../../utils/CustomError.js");

async function uploadWeeklyImage({ file, description }) {
  if (!file) {
    throw new CustomError(400, "لم يتم رفع أي صورة");
  }

  const { startDate } = getFridayToThursdayWeekInterval();
  const lastWeekStart = new Date(startDate);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setUTCDate(lastWeekStart.getUTCDate() + 6);
  lastWeekEnd.setUTCHours(23, 59, 59, 999);

  await deleteImagesByDateRange(lastWeekStart, lastWeekEnd);

  const image = await createImageEntry({
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    content: file.buffer,
    description,
  });

  return image;
}

async function checkImageUploadedThisWeek() {
  const { startDate, endDate } = getFridayToThursdayWeekInterval();
  const exists = await findImageByDateRange(startDate, endDate);
  return Boolean(exists);
}

async function deleteWeeklyImages() {
  const { startDate, endDate } = getFridayToThursdayWeekInterval();

  const found = await findAllImagesByDateRange(startDate, endDate);
  if (!found.length) {
    throw new CustomError(404, "لا توجد صور لهذا الأسبوع لحذفها");
  }

  const deleted = await deleteImagesByDateRange(startDate, endDate);
  return deleted;
}

async function getWeeklyImageFile() {
  const { startDate, endDate } = getFridayToThursdayWeekInterval();
  const image = await findImageByDateRange(startDate, endDate);

  if (!image) {
    throw new CustomError(404, "لا توجد صورة مرفوعة لهذا الأسبوع");
  }

  return image;
}

module.exports = {
  uploadWeeklyImage,
  checkImageUploadedThisWeek,
  deleteWeeklyImages,
  getWeeklyImageFile,
};
