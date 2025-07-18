import { Request, Response } from "express";
import connectToServer from "./server";
const port = process.env.PORT || 3000;

const server = connectToServer();

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
