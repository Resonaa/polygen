import type { Params } from "@remix-run/react";
import { z } from "zod";

import { CUID_LENGTH } from "~/utils/cuid";

import { usernameSchema } from "./auth.server";
import { safeParseAndFlatten } from "./utils.server";

const idSchema = z.coerce.number().int().finite().safe().min(1);

const cuidSchema = z.string().length(CUID_LENGTH).cuid2();

const pageSchema = idSchema;

const postContentSchema = z.string().trim().min(1).max(1e5);

const isPrivateSchema = z.literal("true").or(z.literal("false"));

const commentContentSchema = z.string().trim().min(1).max(1e4);

const langSchema = z.literal("zh").or(z.literal("en"));

const titleSchema = z.string().trim().min(1).max(50);

const addPostSchema = z
  .object({
    content: postContentSchema,
    isPrivate: isPrivateSchema
  })
  .strict();

const getPostSchema = z
  .object({
    cuid: cuidSchema
  })
  .strict();

const addCommentSchema = z
  .object({
    content: commentContentSchema,
    parentCuid: cuidSchema
  })
  .strict();

const editPostSchema = z
  .object({
    cuid: cuidSchema,
    content: postContentSchema
  })
  .strict();

const deletePostSchema = z
  .object({
    cuid: cuidSchema
  })
  .strict();

const deleteCommentSchema = z
  .object({
    id: idSchema
  })
  .strict();

const deleteAnnouncementSchema = deleteCommentSchema;

const editAnnouncementSchema = z
  .object({
    id: idSchema,
    title: titleSchema,
    content: postContentSchema
  })
  .strict();

const createAnnouncementSchema = z
  .object({
    lang: langSchema,
    title: titleSchema,
    content: postContentSchema
  })
  .strict();

const getPostPageSchema = z
  .object({
    page: pageSchema
  })
  .strict();

const getCommentPageSchema = z
  .object({
    page: pageSchema,
    parentCuid: cuidSchema
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

export function validateDeleteAnnouncementFormData(data: FormData) {
  return safeParseAndFlatten(deleteAnnouncementSchema, data);
}

export function validateEditAnnouncementFormData(data: FormData) {
  return safeParseAndFlatten(editAnnouncementSchema, data);
}

export function validateCreateAnnouncementFormData(data: FormData) {
  return safeParseAndFlatten(createAnnouncementSchema, data);
}
