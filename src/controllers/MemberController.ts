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
      const result = await MemberService.createMember(member);
      if (result.error) {
        return res.status(400).json(new ResponseData("", result.error));
      }
      return res
        .status(200)
        .json(new ResponseData(result.member, "member_created_success"));
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
    const result = await MemberService.getMemberList(data, LIMIT_DEFAULT, OFFSET_DEFAULT);
    return res.status(200).json(new ResponseData(result, "Done"));
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
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json(new ResponseData("", "Missing member id"));
    }
    const result = await MemberService.deleteMemberById(Number(id));
    if (!result) {
      return res.status(404).json(new ResponseData("", "Member not found"));
    }
    return res.status(200).json(new ResponseData("", "Delete success"));
  } catch (error: any) {
    return res.status(500).json(new ResponseData("", error.toString()));
  }
});

export default router;

// update
router.put(
  "/update/:id",
  express.json(),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      validateSaveMember(req.body).then(async (member) => {
        const existing = await memberRepository.findOneBy({ id });
        if (!existing) {
          return res.status(404).json(new ResponseData("", "member_not_found"));
        }
        existing.name = member.name;
        existing.description = member.description;
        await memberRepository.save(existing);
        return res
          .status(200)
          .json(new ResponseData(existing, "member_updated_success"));
      });
    } catch (error: any) {
      return res.status(500).json(new ResponseData("", error.toString()));
    }
  }
);