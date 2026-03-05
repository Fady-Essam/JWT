import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { UserModel } from "./model/user.model.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
    await UserModel.syncIndexes();
    console.log(`DB Connected Successfully! ✅`);
  } catch (error) {
    console.log(`Failed to connect DB ❌`);
    throw new Error(error);
  }
};
