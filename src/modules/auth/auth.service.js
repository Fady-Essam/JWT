import { create, findOne, UserModel } from "../../DB/index.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";

import {
  compareHash,
  ConflictException,
  encrypt,
  decrypt,
  generateHash,
  HashEnum,
  unauthorizedException,
  createLoginCredentials,
} from "../../common/utils/index.js";

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;
  const checkUserExists = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkUserExists) {
    throw ConflictException("Email already exists");
  }
  const user = await create({
    model: UserModel,
    data: [
      {
        username,
        email,
        password: await generateHash(password, undefined, HashEnum.Argon),
        phone: await encrypt(phone),
        provider: ProviderEnum.System,
      },
    ],
  });
  return user;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: ProviderEnum.System },
  });
  const match = await compareHash(password, user.password, HashEnum.Argon);
  if (!match) {
    throw unauthorizedException({ message: "Invalid email or password" });
  }
  user.phone = await decrypt(user.phone);

  return await createLoginCredentials(user, issuer);
};
