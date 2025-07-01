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
      let member;
      if (body.userName) {
        member = await userRepository.findOne({ where: { userName: body.userName } });
      } else if (body.email) {
        member = await userRepository.findOne({ where: { email: body.email } });
      }
      if (member && bcrypt.compareSync(body.passWord, member.passWord || "")) {
        const payload = {
          email: member.email,
          id: member.id,
          name: member.userName,
        };
        const token = await jwt.sign(payload, String(process.env.SECRETKEY), {
          expiresIn: "24h",
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

// Đăng ký tài khoản
router.post("/register", express.json(), async (req, res) => {
  try {
    const { userName, passWord, email, phoneNumber } = req.body;
    if (!userName || !passWord || !email || !phoneNumber) {
      return res.status(400).json(new ResponseData("", "Missing required fields"));
    }
    // Kiểm tra trùng userName hoặc email
    const existingUser = await userRepository.findOne({
      where: [
        { userName: userName },
        { email: email }
      ]
    });
    if (existingUser) {
      return res.status(409).json(new ResponseData("", "Username or email already exists"));
    }
    // Hash password
    const hashedPassword = bcrypt.hashSync(passWord, 10);
    // Tạo user mới
    const newUser = userRepository.create({
      userName,
      passWord: hashedPassword,
      email,
      phoneNumber
    });
    await userRepository.save(newUser);
    return res.status(201).json(new ResponseData("", "Register Success"));
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

// cron.schedule("*/10 * * * * *", () => {
//   autoDeactive();
// });
export default router;
