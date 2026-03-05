import jwt from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  System_REFRESH_TOKEN_SECRET_KEY,
  System_TOKEN_SECRET_KEY,
  User_REFRESH_TOKEN_SECRET_KEY,
  User_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import { RoleEnum } from "../../enums/user.enum.js";
import { AudienceEnum, TokenTypeEnum } from "../../enums/security.enum.js";
import {
  BadRequestException,
  unauthorizedException,
} from "../response/error.response.js";
import { findOne } from "../../../DB/db.services.js";
import { UserModel } from "../../../DB/index.js";

/** Encodeing JWT **/
export const generateToken = async ({
  payload = {},
  secret = User_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verfiyToken = async ({
  token,
  secret = User_TOKEN_SECRET_KEY,
} = {}) => {
  return jwt.verify(token, secret);
};

export const getSignatureToken = async (role) => {
  let accessSignature = undefined;
  let refreshSignature = undefined;
  let audience = AudienceEnum.User;

  switch (role) {
    case RoleEnum.Admin:
      accessSignature = System_TOKEN_SECRET_KEY;
      refreshSignature = System_REFRESH_TOKEN_SECRET_KEY;
      audience = AudienceEnum.System;
      break;
    default:
      accessSignature = User_TOKEN_SECRET_KEY;
      refreshSignature = User_REFRESH_TOKEN_SECRET_KEY;
      break;
  }
  return { accessSignature, refreshSignature, audience };
};

export const getSignatureLevel = async (audienceType) => {
  let signatureLevel;
  switch (audienceType) {
    case AudienceEnum.System:
      signatureLevel = RoleEnum.Admin;
      break;
    default:
      signatureLevel = RoleEnum.User;
      break;
  }
  return signatureLevel;
};

export const createLoginCredentials = async (user, issuer) => {
  const { accessSignature, refreshSignature, audience } =
    await getSignatureToken(user.role);
  const accessToken = await generateToken({
    payload: { sub: user._id },
    secret: accessSignature,
    options: {
      issuer,
      audience: [TokenTypeEnum.access, audience],
      expiresIn: ACCESS_EXPIRES_IN,
    },
  });
  const refreshToken = await generateToken({
    payload: { sub: user._id },
    secret: refreshSignature,
    options: {
      issuer,
      audience: [TokenTypeEnum.refresh, audience],
      expiresIn: REFRESH_EXPIRES_IN,
    },
  });
  return { accessToken, refreshToken };
};

export const decodeToken = async ({
  token,
  tokenType = TokenTypeEnum.access,
} = {}) => {
  const decode = await jwt.decode(token);
  console.log({ decode });
  if (!decode?.aud?.length) {
    throw BadRequestException({
      message: "Failed to decode the token aud is required!",
    });
  }
  const [decodedTokenType, audienceType] = decode.aud;
  if (decodedTokenType !== tokenType) {
    throw BadRequestException({ message: "Invalid token type!" });
  }
  const signatureLevel = await getSignatureLevel(audienceType);
  const { accessSignature, refreshSignature } =
    await getSignatureToken(signatureLevel);
  let verifiedToken = await verfiyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.access ? accessSignature : refreshSignature,
  });
  const user = await findOne({
    model: UserModel,
    filter: { _id: verifiedToken.sub },
  });
  if (!user)
    throw unauthorizedException({ message: "Not Registered account!" });
  return user;
};
