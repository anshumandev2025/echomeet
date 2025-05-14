import { createServer } from "./server.js";
import { type Request, Response } from "express";
const port = process.env.PORT || 5001;
const server = createServer();
server.get("/check", (_: Request, res: Response) => {
  res.send({ msg: "Health is ok" });
});
server.listen(port, () => {
  console.log("server is running on port", port);
});
