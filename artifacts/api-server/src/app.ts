import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/mongodb";
import { seedAdmin } from "./lib/seed";

connectDB()
  .then(() => seedAdmin())
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  });

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors());

// Upload routes need a large limit for base64-encoded files
app.use("/api/upload", express.json({ limit: "250mb" }));
app.use("/api/upload", express.urlencoded({ extended: true, limit: "250mb" }));

// All other routes use a standard limit
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use("/api", router);

// Friendly 413 error — must be after routes
app.use((err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err.type === "entity.too.large") {
    res.status(413).json({
      error:
        "File too large. Please upload your video directly to Cloudinary and paste the URL instead.",
    });
    return;
  }
  next(err);
});

export default app;
