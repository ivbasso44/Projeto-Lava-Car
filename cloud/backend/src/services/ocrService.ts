import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

export interface OcrResult {
  plate: string | null;
  confidence: number;
  rawText: string;
}

const PLATE_REGEX = /[A-Z]{3}[0-9][A-Z0-9][0-9]{2}/;

export async function runOcr(imageBuffer: Buffer): Promise<OcrResult> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ocr-"));
  const imagePath = path.join(tmpDir, "plate.jpg");

  try {
    await fs.writeFile(imagePath, imageBuffer);

    // Executa script Python com PaddleOCR
    const { stdout } = await execFileAsync("python3", [
      path.join(__dirname, "../ocr/run_paddleocr.py"),
      imagePath,
    ]);

    const lines = stdout.trim().split("\n");
    const rawText = lines.join(" ").toUpperCase();
    const match = rawText.match(PLATE_REGEX);

    if (match) {
      return {
        plate: match[0],
        confidence: 0.85,
        rawText,
      };
    }

    return {
      plate: null,
      confidence: 0,
      rawText,
    };
  } catch (error) {
    console.error("Erro no OCR:", error);
    return {
      plate: null,
      confidence: 0,
      rawText: "",
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
