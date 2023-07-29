require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const authenticateUser = require("./middleware/authentication");
// connectDB

const connectDB = require("./db/connect");

const authRoute = require("./routes/auth");
const jobsRoute = require("./routes/jobs");
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
// security
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
//

const swaggerUi = require("swagger-ui-express");
// const YAML = require("yamljs");
const swaggerDocument = require(path.join(__dirname, "swagger.json"));

var options = {
  customCss: ".swagger-ui .topbar { display: none }",
  customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
};
// extra packages
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(cors());
app.use(helmet());
app.use(xss());
//

app.get("/", (req, res) => {
  res.send("<h1>Jobs API</h1> <a  href='/api-docs'>Documentation</a>");
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
); // routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/jobs", authenticateUser, jobsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
process.on("unhandledRejection", (e) => {
  fs.writeFile("./error.txt", e.message, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
});
