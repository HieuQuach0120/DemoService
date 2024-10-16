import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import authenMiddleware from "./src/middleware/Authentication";
import router from "./src/routes/index";
import { AppDataSource } from "./dbConfig";

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
app.use("/api/v1", authenMiddleware, router);
