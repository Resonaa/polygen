export function validatePostContent(content: unknown): content is string {
  return typeof content === "string" && content.trim().length > 0 && content.length < 100000;
}

export function validatePage(page: unknown): page is number {
  return typeof page === "number" && page > 0;
}

export function validateCommentContent(content: unknown): content is string {
  return typeof content === "string" && content.trim().length > 0 && content.length < 10000;
}

export function validateUsername(username: unknown): username is string {
  return typeof username === "string" && /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,16}$/.test(username);
}

export function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6;
}

export function validateCaptcha(captcha: unknown): captcha is string {
  return typeof captcha === "string" && captcha.length === 4;
}

const DEFAULT_REDIRECT = "/";

export function safeRedirect(to: unknown, defaultRedirect: string = DEFAULT_REDIRECT) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}