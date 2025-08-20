const {
  uploadWeeklyImage,
  checkImageUploadedThisWeek,
  deleteWeeklyImages,
  getWeeklyImageFile,
} = require("./image.service.js");

const uploadImageController = async (req, res, next) => {
  try {
    const { description } = req.body;
    const file = req.file;

    const image = await uploadWeeklyImage({ file, description });

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح.",
      imageId: image.id,
    });
  } catch (err) {
    next(err);
  }
};

const checkWeeklyImageUploadController = async (req, res, next) => {
  try {
    const exists = await checkImageUploadedThisWeek();

    res.status(200).json({
      success: true,
      exists,
      message: exists
        ? "تم رفع صورة لهذا الأسبوع مسبقًا."
        : "لم يتم رفع أي صورة لهذا الأسبوع بعد.",
    });
  } catch (err) {
    next(err);
  }
};

const deleteWeeklyImageController = async (req, res, next) => {
  try {
    const deleted = await deleteWeeklyImages();

    res.status(200).json({
      success: true,
      message: `تم حذف ${deleted} صورة لهذا الأسبوع.`,
    });
  } catch (err) {
    next(err);
  }
};

const getWeeklyImageController = async (req, res, next) => {
  try {
    const image = await getWeeklyImageFile();

    res.setHeader("Content-Type", image.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${image.filename}"`
    );
    res.setHeader("Content-Length", image.size);

    res.status(200).send(image.content);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadImageController,
  checkWeeklyImageUploadController,
  deleteWeeklyImageController,
  getWeeklyImageController,
};
