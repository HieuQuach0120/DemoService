import express from "express";
import * as dotenv from "dotenv";
import ResponseData from "../models/ResponeData";
import { AppDataSource } from "../../dbConfig";
import { Member } from "../models/Member";
import validateSaveMember from "../validate/MemberValidate";
import { MemberService } from "../services/MemberService";

dotenv.config();
const router = express.Router();
const LIMIT_DEFAULT = 10;
const OFFSET_DEFAULT = 0;

const memberRepository = AppDataSource.getRepository(Member);

// create

//create
/**
 * @swagger
 * /member/create:
 *   post:
 *     tags:
 *       - Member
 *     summary: Tạo member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Success
 */
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
/**
 * @swagger
 * /member/get-list:
 *   get:
 *     tags:
 *       - Member
 *     summary: Lấy danh sách member
 *     responses:
 *       200:
 *         description: Danh sách member
 */

router.get("/get-list", async (req, res) => {
  try {
    const data = req.query;
    let query = memberRepository.createQueryBuilder("member");

    if (data.name) {
      const keyword = data.name.toString();
      query = query.where("name LIKE :name", { name: `%${keyword}%` });
    }

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


// Tìm member theo id
/**
 * @swagger
 * /member/find/{id}:
 *   get:
 *     tags:
 *       - Member
 *     summary: Lấy thông tin member theo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của member
 *     responses:
 *       200:
 *         description: Thông tin member
 *       404:
 *         description: Không tìm thấy member
 */
router.get("/find/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json(new ResponseData("", "Missing member id"));
    }
    const member = await MemberService.findMemberById(Number(id));
    if (!member) {
      return res.status(404).json(new ResponseData("", "Member not found"));
    }
    return res.status(200).json(new ResponseData(member, "Done"));
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});


// update
router.put("/update/:id", express.json(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    validateSaveMember(req.body).then(async (member) => {
      const result = await MemberService.updateMemberById(id, member);

      if (result.error === "member_not_found") {
        return res.status(404).json(new ResponseData("", "member_not_found"));
      }

      return res.status(200).json(new ResponseData(result.member, "member_updated_success"));
    });
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

// delete
// Xóa member theo id
/**
 * @swagger
 * /member/delete/{id}:
 *   delete:
 *     tags:
 *       - Member
 *     summary: 
*     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của member
 *     responses:
 *       200:
 *         description: Danh sách member
 */

router.delete(
  "/delete/:id",
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await memberRepository.findOneBy({ id });
      if (!existing) {
        return res.status(404).json(new ResponseData("", "member_not_found"));
      }
      await memberRepository.delete(id);
      return res
        .status(200)
        .json(new ResponseData(existing, "member_deleted_success"));
    } catch (error: any) {
      return res.status(500).json(new ResponseData("", error.toString()));
    }
  }
);

export default router;
