import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db";
import session from "express-session";
import MongoStore from "connect-mongo";

import AuthRouter from "./routes/AuthRoutes";
import ThumbnailRouter from "./routes/ThumbnailRoutes";
import UserRouter from "./routes/UserRoutes";
// 1. Import the ChatRouter
import ChatRouter from "./routes/ChatRoutes"; 

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", process.env.FRONTEND_URL || ""],
    credentials: true,
  })
);

app.set("trust proxy", 1); // Trust first proxy (needed for render to set cookies securely)

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI as string,
      collectionName: "sessions",
    }),
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);
// 2. Register the Chat Route
app.use("/api/chat", ChatRouter); 

const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();