import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não suportado. Use JPG ou PNG."));
    }
  },
});

export function generateImageKey(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  return `events/${new Date().toISOString().split("T")[0]}/${uuidv4()}${ext}`;
}
