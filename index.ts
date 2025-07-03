import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import authenMiddleware from "./src/middleware/Authentication";
import authenRouter from "./src/controllers/AuthenController";
import memberRouter from "./src/controllers/MemberController";
import router from "./src/routes/index";
import { AppDataSource } from "./dbConfig";
import 'reflect-metadata';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/swagger";
// other imports

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());

// connect mysql
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to MySQL database");
  })
  .catch((error) => console.log(error));

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

// router
app.use("/api/v1/authen", authenRouter);
app.use("/api/v1/member", authenMiddleware, memberRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
