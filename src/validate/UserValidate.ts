import Joi, { allow } from "joi";

export default async function validateSavePartner(params: any) {
  const schema = Joi.object({
    id: Joi.number().allow(),
    userName: Joi.string().required().max(255),
    passWord: Joi.string().allow(),
    email: Joi.string().required().max(255).email(),
    phoneNumber: Joi.allow(),
    role: Joi.required(),
    gender: Joi.allow(),
    age: Joi.allow(),
    address: Joi.allow(),
    emergencyContact: Joi.allow(),
    remarks: Joi.allow(),
    isActive: Joi.allow(),
    createdDate: Joi.allow(),
    lastTimeLogin: Joi.allow(),
  });
  return schema.validateAsync(params, {
    abortEarly: false,
  });
}
// validate login
export async function validateLogin(params: any) {
  const schema = Joi.object({
    userName: Joi.string().required().max(255),
    passWord: Joi.string().required().max(255),
    memorize: Joi.allow(),
  });
  try {
    const value = await schema.validateAsync(params);
  } catch (error: any) {
    throw error;
  }
}

export async function validateResetPassword(params: any) {
  const schema = Joi.object({
    memberId: Joi.number().required(),
  });
  try {
    const value = await schema.validateAsync(params);
  } catch (error: any) {
    throw error;
  }
}

export async function validateChangePassWord(params: any) {
  const schema = Joi.object({
    passWordOld: Joi.string().required(),
    passWordNew: Joi.string().required(),
    passWordNewConfirm: Joi.string().required(),
  });
  try {
    const value = await schema.validateAsync(params);
  } catch (error: any) {
    throw error;
  }
}
