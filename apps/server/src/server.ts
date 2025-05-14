import express, { type Express } from "express";
import cors from "cors";
export const createServer = (): Express => {
  const app = express();
  app.use(cors());
  return app;
};
