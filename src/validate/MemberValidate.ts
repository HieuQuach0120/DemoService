import Joi, { allow } from "joi";

export default async function validateSaveMember(params: any) {
  const schema = Joi.object({
    id: Joi.number().allow(),
    name: Joi.string().required().max(255),
    description: Joi.string().max(255),
  });
  return schema.validateAsync(params, {
    abortEarly: false,
  });
}
