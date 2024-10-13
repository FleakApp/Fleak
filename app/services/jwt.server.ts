import jwt from "jsonwebtoken";

type Payload = Record<string, unknown>;

// JWT_SECRET = `node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"`

export const createToken = (
  payload: Payload,
  options?: jwt.SignOptions,
): string => {
  try {
    const token = jwt.sign(payload, String(process.env.JWT_SECRET), {
      issuer: "@fleak-org",
      expiresIn: "1d",
      ...options,
    });
    return token;
  } catch (e) {
    // Oops
    throw new Error("JWT ERROR");
  }
};

export function decryptToken<T>(token: string): T {
  try {
    jwt.verify(token, String(process.env.JWT_SECRET));
    const payload = jwt.decode(token);
    return payload as T;
  } catch (e) {
    // Oops
    throw new Error("JWT ERROR");
  }
}
