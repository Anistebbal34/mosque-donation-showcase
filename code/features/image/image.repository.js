const { Image } = require("../../sequelize/models");
const { Op } = require("sequelize");

async function findImageByDateRange(startDate, endDate) {
  return await Image.findOne({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["createdAt", "DESC"]],
  });
}

async function deleteImagesByDateRange(startDate, endDate) {
  return await Image.destroy({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
  });
}

async function findAllImagesByDateRange(startDate, endDate) {
  return await Image.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
  });
}

async function createImageEntry({
  filename,
  mimetype,
  size,
  content,
  description,
}) {
  return await Image.create({
    filename,
    mimetype,
    size,
    content,
    description,
  });
}

module.exports = {
  findImageByDateRange,
  findAllImagesByDateRange,
  deleteImagesByDateRange,
  createImageEntry,
};
