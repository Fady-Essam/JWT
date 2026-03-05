import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enums/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required!"],
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Required!"],
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    DOB: Date,
    phone: String,
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },
    profilePic: String,
    confirmEmail: Date,
  },
  {
    collection: "Users",
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
