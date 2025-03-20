import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import fileUpload from "express-fileupload";


const app: Express = express();

interface AppConfig {
  port: number | string;
}

export const createApp = ({ port }: AppConfig): { app: Express; port: number | string } => {
  app.use(morgan("dev"));

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" })); 

  app.use(
    fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  );


  return { app, port };
};
