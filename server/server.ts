import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db";
import session from "express-session";
import MongoStore from "connect-mongo";

import AuthRouter from "./routes/AuthRoutes";
import ThumbnailRouter from "./routes/ThumbnailRoutes";
import UserRouter from "./routes/UserRoutes";
import ChatRouter from "./routes/ChatRoutes";

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

const app = express();

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Yahan apna deployed FRONTEND URL add karo
  // Example:
  // "https://your-frontend.onrender.com",
];

app.use(
  cors({
<<<<<<< HEAD
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", process.env.FRONTEND_URL || ""],
=======
    origin: (origin, callback) => {
      // Allow requests without an Origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
>>>>>>> 37b1e49 (Fix Gemini image generation and deployment)
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

<<<<<<< HEAD
app.set("trust proxy", 1); // Trust first proxy (needed for render to set cookies securely)
=======
app.options("*", cors());

/* -------------------- MongoDB -------------------- */

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("MONGO_URI is not defined in .env");
}

/* -------------------- Session -------------------- */
>>>>>>> 37b1e49 (Fix Gemini image generation and deployment)

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
<<<<<<< HEAD
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
=======
      httpOnly: true,

      // Local = false, Render/HTTPS = true
      secure: process.env.NODE_ENV === "production",

      // Cross-origin frontend/backend ke liye production me none
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
>>>>>>> 37b1e49 (Fix Gemini image generation and deployment)
    },

    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "sessions",
    }),
  })
);

/* -------------------- Middleware -------------------- */

app.use(express.json());

/* -------------------- Routes -------------------- */

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);

/* -------------------- Server -------------------- */

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();