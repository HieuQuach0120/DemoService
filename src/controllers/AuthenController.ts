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
       
      let member = await userRepository.findOne({
        where: [
          { userName: body.userName },
          { email: body.userName }
        ]
      });
      console.log('member', member);
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

/**
 * @swagger
 * /authen/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đổi mật khẩu
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc mật khẩu cũ sai
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/change-password", express.json(), async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json(new ResponseData("", "Missing required fields"));
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json(new ResponseData("", "New passwords do not match"));
    }
    // Lấy userId từ token
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json(new ResponseData("", "No token provided"));
    }
    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, String(process.env.SECRETKEY));
    } catch (err) {
      return res.status(401).json(new ResponseData("", "Invalid token"));
    }
    const userId = decoded.id;
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json(new ResponseData("", "User not found"));
    }
    if (!bcrypt.compareSync(oldPassword, user.passWord || "")) {
      return res.status(400).json(new ResponseData("", "Old password is incorrect"));
    }
    user.passWord = bcrypt.hashSync(newPassword, 10);
    await userRepository.save(user);
    return res.status(200).json(new ResponseData("", "Password changed successfully"));
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

// cron.schedule("*/10 * * * * *", () => {
//   autoDeactive();
// });
export default router;
