export function badRequest(body?: BodyInit) {
  return new Response(body, { status: 400, statusText: "Bad Request" });
}

export function forbidden(body?: BodyInit) {
  return new Response(body, { status: 403, statusText: "Forbidden" });
}

export function notFound(body?: BodyInit) {
  return new Response(body, { status: 404, statusText: "Not Found" });
}
