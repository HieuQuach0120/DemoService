import { AppDataSource } from "../../dbConfig";
import { Member } from "../models/Member";

const memberRepository = AppDataSource.getRepository(Member);

export class MemberService {
  static async createMember(memberData: any) {
    const memberResult = await memberRepository.findOneBy({
      name: memberData.name,
    });
    if (memberResult) {
      return { error: "name_is_exist" };
    }
    const form = Object.assign({}, memberData);
    const memberSave = memberRepository.create(form);
    await memberRepository.save(memberSave);
    return { member: memberData };
  }

  static async getMemberList(queryData: any, limitDefault = 10, offsetDefault = 0) {
    let query = memberRepository.createQueryBuilder("member");
    if (queryData.name) {
      const keyword = queryData.name.toString();
      query = query.where("name LIKE :name", { name: `%${keyword}%` });
    }
    const limit = queryData.limit ? Number(queryData.limit) : limitDefault;
    const offset = queryData.offset ? Number(queryData.offset) : offsetDefault;
    query.limit(limit);
    query.offset(offset);
    const [members, total] = await query.getManyAndCount();
    return { members, total };
  }

  static async findMemberById(id: number) {
    const member = await memberRepository.findOneBy({ id });
    return member;
  }

  static async deleteMemberById(id: number) {
    const member = await memberRepository.findOneBy({ id });
    if (!member) {
      return null; // Không tìm thấy
    }
    await memberRepository.remove(member);
    return true; // Xóa thành công
  }
}
