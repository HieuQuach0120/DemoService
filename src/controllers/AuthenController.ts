import express from "express";
import * as dotenv from "dotenv";
import ResponseData from "../models/ResponeData";
import cron from "node-cron";
import { validateLogin } from "../validate/UserValidate";
import { User } from "../models/User";
import { AppDataSource } from "../../dbConfig";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
dotenv.config();
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

//đăng nhập
router.post("/login", express.json(), async (req, res) => {
  try {
    const body = req.body;
    // validate
    await validateLogin(body);
    if (body.userName && body.passWord) {
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      const member = await userRepository.findOne({
        where: {
          userName: body.userName,
        },
      });
      if (member && bcrypt.compareSync(body.passWord, member.passWord || "")) {
        const payload = {
          email: member.email,
          id: member.id,
          name: member.userName,
        };
        const token = await jwt.sign(payload, String(process.env.SECRETKEY), {
          expiresIn: body.memorize === true ? "30d" : "1h",
        });
        return res.status(200).json(new ResponseData(token, "Login Success"));
      } else {
        return res
          .status(403)
          .json(new ResponseData("", "Incorrect account or password"));
      }
    } else {
      res
        .status(401)
        .json(
          new ResponseData("", "You have logged out, please log in again.")
        );
    }
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

//quên mật khẩu
router.post("/forgot-password", express.json(), async (req, res) => {
  const email = req.body.email;
  const member = await userRepository.findOneBy({
    email: email,
  });
  if (!member) {
    return res.status(404).json(new ResponseData(null, "Email not found."));
  }

  member.passWord = bcrypt.hashSync("123456aA@", 10);
  await userRepository.save(member);
  return res.status(200).json(new ResponseData("", "Done"));
});

// cron.schedule("*/10 * * * * *", () => {
//   autoDeactive();
// });
export default router;
