// test/setup.js

const connection = require("../../connection/Connection.js");

beforeAll(async () => {
  await connection.authenticate(); // ✅ check DB connection works
});

beforeEach(async () => {
  await connection.sync({ force: true }); // ✅ reset DB before every test
});

afterAll(async () => {
  await connection.close(); // ✅ release DB connection pool
});
