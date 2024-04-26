import { encode } from "turbo-stream";

/**
 * A 304 response with empty body.
 */
export const notModified = new Response(null, { status: 304 });

/**
 * A 400 response with empty body.
 */
export const badRequest = new Response(null, {
  status: 400,
  statusText: "Bad Request"
});

/**
 * A 403 response with empty body.
 */
export const forbidden = new Response(null, {
  status: 403,
  statusText: "Forbidden"
});

/**
 * A 404 response with empty body.
 */
export const notFound = new Response(null, {
  status: 404,
  statusText: "Not Found"
});

/**
 * A turbo-stream response. API routes should use this manually.
 */
export const turbo = (body: unknown, init?: ResponseInit) =>
  new Response(encode(body), init);
