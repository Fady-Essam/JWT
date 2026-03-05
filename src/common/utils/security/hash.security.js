import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";
import * as argon2 from "argon2";
import { HashEnum } from "./index.js";

export const generateHash = async (
  plainText,
  salt = SALT_ROUND,
  algo = HashEnum.Bcrypt,
) => {
  let hashValue = "";
  switch (algo) {
    case HashEnum.Argon:
      hashValue = await argon2.hash(plainText);
      break;
    default:
      hashValue = await hash(plainText, salt);
      break;
  }
  return hashValue;
};

export const compareHash = async (
  plainText,
  cipherText,
  algo = HashEnum.Bcrypt,
) => {
  let match = false;
  switch (algo) {
    case HashEnum.Argon:
      match = await argon2.verify(cipherText, plainText);
      break;
    default:
      match = await argon2.compare(plainText, cipherText);
      break;
  }
  return match;
};
