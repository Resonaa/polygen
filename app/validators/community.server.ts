import type { Params } from "@remix-run/react";
import { z } from "zod";

import { usernameSchema } from "./auth.server";
import { safeParseAndFlatten } from "./utils.server";

const idSchema = z.coerce.number().int().finite().safe().min(1);

const pageSchema = idSchema;

const postContentSchema = z.string().trim().min(1).max(1e5);

const commentContentSchema = z.string().trim().min(1).max(1e4);

const addPostSchema = z
  .object({
    content: postContentSchema
  })
  .strict();

const getPostSchema = z
  .object({
    id: idSchema
  })
  .strict();

const addCommentSchema = z
  .object({
    content: commentContentSchema,
    parentId: idSchema
  })
  .strict();

const editPostSchema = z
  .object({
    id: idSchema,
    content: postContentSchema
  })
  .strict();

const deletePostSchema = z
  .object({
    id: idSchema
  })
  .strict();

const deleteCommentSchema = deletePostSchema;

const getPostPageSchema = z
  .object({
    page: pageSchema
  })
  .strict();

const getCommentPageSchema = z
  .object({
    page: pageSchema,
    parentId: idSchema
  })
  .strict();

const getUserPostSchema = z
  .object({
    page: pageSchema,
    username: usernameSchema
  })
  .strict();

export function validateAddPostFormData(data: FormData) {
  return safeParseAndFlatten(addPostSchema, data);
}

export function validateGetPostParams(params: Params) {
  return safeParseAndFlatten(getPostSchema, params);
}

export function validateAddCommentFormData(data: FormData) {
  return safeParseAndFlatten(addCommentSchema, data);
}

export function validateEditPostFormData(data: FormData) {
  return safeParseAndFlatten(editPostSchema, data);
}

export function validateDeletePostFormData(data: FormData) {
  return safeParseAndFlatten(deletePostSchema, data);
}

export function validateDeleteCommentFormData(data: FormData) {
  return safeParseAndFlatten(deleteCommentSchema, data);
}

export function validateGetPostPageFormData(data: FormData) {
  return safeParseAndFlatten(getPostPageSchema, data);
}

export function validateGetCommentPageFormData(data: FormData) {
  return safeParseAndFlatten(getCommentPageSchema, data);
}

export function validateGetUserPostFormData(data: FormData) {
  return safeParseAndFlatten(getUserPostSchema, data);
}
