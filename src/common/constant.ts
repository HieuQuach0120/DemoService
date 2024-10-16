import moment from "moment";
import fs from "fs";
import path from "path";

export function isNullorUndefined(value: any) {
  if (
    value === null ||
    value === "" ||
    value === undefined ||
    value?.length === 0
  ) {
    return true;
  }
  return false;
}

export function convertDateToString(value: any, format?: string) {
  if (moment(value).isValid()) {
    return moment(value).format(format || "YYYY-MM-DD");
  }
  throw new Error(" Định dạng ngày không đúng YYYY-MM-DD ");
}

export function generateRandomString(myLength: number) {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );
  const randomString = randomArray.join("");
  return randomString;
}

export const ROLE = {
  ADMIN: 1,
  MEMBER: 2,
  PUBLIC: 3,
};

export const TOPIC_NOTI = {
  MEMBER: "topic_member",
  PUBLIC: "topic_public",
};

export const PERMISSION = {
  MEMBER: 2,
  PUBLIC: 3,
};

export const GENDER = {
  MALE: 1,
  FEMALE: 2,
};
export const MEMBERSHIP_STATUS = {
  REJECT: 0,
  WAITING: 1,
  ACCEPT: 2,
  ARCHIVED: 3,
};
export const PASSWORD_DEFAULT = "123";
export const LIMIT_DEFAULT = 10;
export const OFFSET_DEFAULT = 0;
export function checkPermistionAdmin(role: number) {
  if (role === ROLE.ADMIN) {
    return true;
  }
  return false;
}

export const readTemplateFile = (filename: string): string | null => {
  const templateFolderPath = path.join(__dirname, "..", "template");
  const templateFilePath = path.join(templateFolderPath, filename);

  try {
    return fs.readFileSync(templateFilePath, "utf8");
  } catch (err) {
    return null;
  }
};
