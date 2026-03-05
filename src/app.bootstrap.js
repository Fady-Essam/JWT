import { NODE_ENV, port } from "../config/config.service.js";
import { authRouter, userRouter } from "./modules/index.js";
import express from "express";
import { globalErrorHandling } from "./common/utils/response/error.response.js";
import { connectDB } from "./DB/index.js";
import cors from "cors";

async function bootstrap() {
  const app = express();
  //convert buffer data
  app.use(cors(), express.json());
  //application routing
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  //DB
  await connectDB();
  //invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  //error-handling
  app.use(globalErrorHandling);

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
export default bootstrap;
