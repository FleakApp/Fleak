import bcrypt from "bcryptjs";

export const comparePasswords = (str: string, hash: string) =>
  bcrypt.compare(str, hash);
export const hashPassword = (str: string) => bcrypt.hash(str, 12);
