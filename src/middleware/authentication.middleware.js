import {
  BadRequestException,
  decodeToken,
  ForbiddenException,
  TokenTypeEnum,
} from "../common/utils/index.js";

export const authentication = ({ tokenType = TokenTypeEnum.access }) => {
  return async (req, res, next) => {
    if (!req.headers?.authorization)
      throw BadRequestException({ message: "Missing Authorization key!!" });
    const [flag, credential] = req.headers.authorization.split(" ");
    if (!flag || !credential) {
      throw BadRequestException({ message: "Missing authorization parts!" });
    }
    switch (flag) {
      case "basic":
        const [username, password] = Buffer.from(credential, "base64")
          .toString()
          .split(":");
        console.log(username, password);
        break;
      case "bearer":
        req.user = await decodeToken({
          token: credential,
          tokenType,
        });
        break;
      default:
        break;
    }

    next();
  };
};

export const authorization = ({ accessRoles = [] }) => {
  return async (req, res, next) => {
    if (!accessRoles?.includes(user.role)) {
      throw ForbiddenException({ message: "Not allowed access!" });
    }
    next();
  };
};
