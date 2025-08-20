// const express = require("express");
// const morgan = require("morgan");

// const connection = require("./connection/Connection.js");
// const errorHandler = require("./middleware/errorHandler.js");
// const requestId = require("./utils/requestId.js");
// const helmet = require("helmet");

// const authRoutes = require("./features/auth/auth.routes.js");
// const userRoutes = require("./features/user/user.routes.js");
// const mosqueRoutes = require("./features/mosque/mosque.routes.js");
// const missionRoutes = require("./features/mission/mission.routes.js");
// const moneyRoutes = require("./features/money/money.routes.js");
// const reportRoutes = require("./features/report/report.routes.js");
// const imageRoutes = require("./features/image/image.routes.js");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(morgan("dev"));
// app.use(helmet());
// app.use(requestId);
// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/mosques", mosqueRoutes);
// app.use("/api/missions", missionRoutes);
// app.use("/api/money", moneyRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/images", imageRoutes);
// // Not Found Middleware
// app.use((req, res, next) => {
//   const error = new Error(`Route not found - ${req.originalUrl}`);
//   error.status = 404;
//   next(error);
// });

// // Centralized Error Handler
// app.use(errorHandler);

// // Server Start
// const startServer = async () => {
//   try {
//     await connection.authenticate();
//     console.log("✅ Database connected");

//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });

//     // Optional ngrok
//     // const ngrok = require("ngrok");
//     // const url = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_TOKEN });
//     // console.log(`🔗 Ngrok tunnel: ${url}`);
//   } catch (err) {
//     console.error("Startup error:", err);
//     process.exit(1);
//   }
// };

// startServer();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");
const requestId = require("./utils/requestId");

const authRoutes = require("./features/auth/auth.routes");
const userRoutes = require("./features/user/user.routes");
const mosqueRoutes = require("./features/mosque/mosque.routes");
const missionRoutes = require("./features/mission/mission.routes");
const moneyRoutes = require("./features/money/money.routes");
const reportRoutes = require("./features/report/report.routes");
const imageRoutes = require("./features/image/image.routes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(requestId);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mosques", mosqueRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/money", moneyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/images", imageRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
