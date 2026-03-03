import Joi from "joi";

const idParam = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
});

export const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  }),
});

export const updateUserSchema = idParam.keys({
  body: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid("user", "admin"),
    isActive: Joi.boolean(),
  }).min(1),
});

export const getUsersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow(""),
    isActive: Joi.boolean(),
  }),
});

export const getUserByIdSchema = idParam;

export const deleteUserSchema = idParam;

