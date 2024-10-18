import express from "express";
import * as dotenv from "dotenv";
import ResponseData from "../models/ResponeData";
import { AppDataSource } from "../../dbConfig";
import { Member } from "../models/Member";
import validateSaveMember from "../validate/MemberValidate";

dotenv.config();
const router = express.Router();
const LIMIT_DEFAULT = 10;
const OFFSET_DEFAULT = 0;

const memberRepository = AppDataSource.getRepository(Member);

//create
router.post("/create", express.json(), async (req, res) => {
  try {
    validateSaveMember(req.body).then(async (member) => {
      const memberResult = await memberRepository.findOneBy({
        name: member.name,
      });
      if (memberResult) {
        return res.status(400).json(new ResponseData("", "name_is_exist"));
      }
      const form = Object.assign({}, member);
      const memberSave = memberRepository.create(form);
      await memberRepository.save(memberSave);
      return res
        .status(200)
        .json(new ResponseData(member, "member_created_success"));
    });
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

//get list
router.get("/get-list", async (req, res) => {
  try {
    const data = req.query;
    let query = memberRepository.createQueryBuilder("member");

    // Bỏ điều kiện WHERE "1 = 1" vì nó không cần thiết
    if (data.name) {
      const keyword = data.name.toString();
      query = query.where("name LIKE :name", { name: `%${keyword}%` });
    }

    // Always set limit with offset
    const limit = data.limit ? Number(data.limit) : LIMIT_DEFAULT;
    const offset = data.offset ? Number(data.offset) : OFFSET_DEFAULT;
    query.limit(limit);
    query.offset(offset);

    const [members, total] = await query.getManyAndCount();

    return res.status(200).json(new ResponseData({ members, total }, "Done"));
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

export default router;
