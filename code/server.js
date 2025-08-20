const app = require("./app");
const connection = require("./connection/Connection.js");
// const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connection.authenticate();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();
