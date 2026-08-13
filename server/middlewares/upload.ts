import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
